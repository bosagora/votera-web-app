import {NormalSteps} from 'multisig-wallet-sdk-client';
import React, {createContext, useCallback, useContext, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useAddFavoriteDaoMutation} from 'hooks/useFavoritedDaos';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {CreateDaoFormData} from 'pages/createDAO';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  TransactionState,
} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';

type CreateDaoContextType = {
  /** Prepares the creation data and awaits user confirmation to start process */
  handlePublishDao: () => void;
};

const CreateDaoContext = createContext<CreateDaoContextType | null>(null);

declare type CreateWalletParams = {
  name: string;
  description: string;
  members: string[];
  required: number;
};

const CreateDaoProvider: React.FC = ({children}) => {
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {getValues} = useFormContext<CreateDaoFormData>();
  const {client} = useClient();

  const addFavoriteDaoMutation = useAddFavoriteDaoMutation();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>();
  const [daoCreationData, setDaoCreationData] = useState<CreateWalletParams>();
  const [showModal, setShowModal] = useState(false);
  const [daoAddress, setDaoAddress] = useState('');

  const shouldPoll =
    daoCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !daoCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handlePublishDao = async () => {
    setCreationProcessState(TransactionState.WAITING);
    setShowModal(true);
    const creationParams = await getDaoSettings();
    setDaoCreationData(creationParams);
  };

  // Handler for modal button click
  const handleExecuteCreation = async () => {
    // if DAO has been created, we don't need to do anything do not execute it
    // again, close the modal
    // trackEvent('daoCreation_publishDAONow_clicked', {
    //   network: getValues('blockchain')?.network,
    // });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (!daoCreationData || creationProcessState === TransactionState.LOADING) {
      //console.log('Transaction is running');
      return;
    }

    // if the wallet was in a wrong network user will see the wrong network warning
    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    // proceed with creation if transaction is waiting or was not successfully executed (retry);
    await createDao();
  };

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Dashboard, {
            network: network,
            dao: daoAddress,
          })
        );
        break;
      default: {
        setShowModal(false);
      }
    }
  };

  // Get dao setting configuration for creation process
  const getDaoSettings = useCallback(async (): Promise<CreateWalletParams> => {
    const {
      blockchain,
      daoName,
      daoSummary,
      multisigWallets,
      multisigMinimumApprovals,
    } = getValues();

    return {
      name: daoName,
      description: daoSummary,
      members: multisigWallets.map(wallet => wallet.address),
      required: multisigMinimumApprovals,
    };
  }, [getValues]);

  // estimate creation fees
  const estimateCreationFees = useCallback(async () => {
    if (daoCreationData === undefined) {
      return {
        average: BigInt(1500000000),
        max: BigInt(1500000000),
      };
    }
    return client?.estimation.create(
      daoCreationData.name,
      daoCreationData.description,
      daoCreationData.members,
      daoCreationData.required,
      1
    );
  }, [client?.estimation, daoCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  // run dao creation transaction
  const createDao = async () => {
    setCreationProcessState(TransactionState.LOADING);

    // Check if SDK initialized properly
    if (!client || !daoCreationData) {
      throw new Error('SDK client is not initialized correctly');
    }
    const createIterator = client?.multiSigWalletFactory.create(
      daoCreationData.name,
      daoCreationData.description,
      daoCreationData.members,
      daoCreationData.required,
      1
    );

    // Check if createDaoIterator function is initialized
    if (!createIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      for await (const step of createIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            //console.log(step.txHash);
            // trackEvent('daoCreation_transaction_signed', {
            //   network: getValues('blockchain')?.network,
            // });
            break;
          case NormalSteps.SUCCESS:
            console.log(
              'Newly created DAO address',
              step.address.toLowerCase()
            );
            // trackEvent('daoCreation_transaction_success', {
            //   network: getValues('blockchain')?.network,
            //   wallet_provider: provider?.connection.url,
            // });
            setDaoCreationData(undefined);
            setCreationProcessState(TransactionState.SUCCESS);
            setDaoAddress(step.address.toLowerCase());

            try {
              await Promise.all([
                addFavoriteDaoMutation.mutateAsync({
                  dao: {
                    address: step.address.toLocaleLowerCase(),
                    chain: CHAIN_METADATA[network].id,
                    metadata: {
                      name: daoCreationData.name,
                      description: daoCreationData.description,
                    },
                  },
                }),
              ]);
            } catch (error) {
              console.warn(
                'Error favoriting and adding newly created DAO to cache',
                error
              );
            }
            break;
        }
      }
    } catch (err) {
      // unsuccessful execution, keep creation data for retry
      console.log(err);
      // trackEvent('daoCreation_transaction_failed', {
      //   network: getValues('blockchain')?.network,
      //   wallet_provider: provider?.connection.url,
      //   err,
      // });
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <CreateDaoContext.Provider value={{handlePublishDao}}>
      {children}
      <PublishModal
        subtitle={t('TransactionModal.publishDaoSubtitle')}
        buttonLabelSuccess={t('TransactionModal.launchDaoDashboard')}
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </CreateDaoContext.Provider>
  );
};

function useCreateDaoContext(): CreateDaoContextType {
  return useContext(CreateDaoContext) as CreateDaoContextType;
}

export {useCreateDaoContext, CreateDaoProvider};
