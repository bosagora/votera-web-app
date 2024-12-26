import {useReactiveVar} from '@apollo/client';
import {
  CreateMajorityVotingProposalParams,
  CreateProposalBaseParams,
  PluginTypes,
  ProposalCreationSteps,
  VoteValues,
  WithdrawParams,
} from 'utils/aragon/types';
// import {
//   DaoAction,
//   ProposalMetadata,
//   TokenType,
// } from '@aragon/sdk-client-common';
// import {hexToBytes} from '@aragon/sdk-common';
import {BigNumber, ethers} from 'ethers';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
// import {useDaoToken} from 'hooks/useDaoToken';
// import {
//   isMultisigVotingSettings,
//   isTokenVotingSettings,
//   usePluginSettings,
// } from 'hooks/usePluginSettings';
// import {usePollGasFee} from 'hooks/usePollGasfee';
// import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
// import {trackEvent} from 'services/analytics';
// import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
// import {
//   customJSONReplacer,
//   getDefaultPayableAmountInputName,
//   toDisplayEns,
// } from 'utils/library';
// import {Proposal} from 'utils/paths';
// import {
//   CacheProposalParams,
//   getNonEmptyActions,
//   mapToCacheProposal,
// } from 'utils/proposals';
// import {isNativeToken} from 'utils/tokens';
// import {ProposalId, ProposalResource} from 'utils/types';
// import {pendingMultisigProposalsVar} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {trackEvent} from '../services/analytics';
import {usePollGasFee} from '../hooks/usePollGasfee';
import {BigNumberish} from '@ethersproject/bignumber';
import {ABIStorage, BOACoin, NormalSteps} from 'multisig-wallet-sdk-client';
import {Dashboard} from '../utils/paths';
import {toDisplayEns} from '../utils/library';
import {isNativeToken} from 'utils/tokens';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

type CreateVotingProposalParams = {
  title: string;
  description: string;
  destination: string;
  value: BigNumberish;
};

type CreateVotingProposalEstimationParams = {
  walletAddress: string;
  title: string;
  description: string;
  destination: string;
  value: BigNumberish;
  data: string;
  tokenAddress: string;
};

const CreateProposalProvider: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  //console.log('CreateProposalProvider');
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {preferences} = usePrivacyContext();

  const {client} = useClient();
  const navigate = useNavigate();
  const {getValues} = useFormContext();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();

  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetailsQuery();
  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds(1000000000);

  const [proposalId, setProposalId] = useState<string>();
  const [proposalCreationData, setProposalCreationData] =
    useState<CreateVotingProposalEstimationParams>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const estimateCreationFees = useCallback(async () => {
    if (!client) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    if (isNativeToken(proposalCreationData.tokenAddress)) {
      return client?.estimation.submitTransactionNativeTransfer(
        proposalCreationData.walletAddress,
        proposalCreationData.title,
        proposalCreationData.description,
        proposalCreationData.destination,
        proposalCreationData.value
      );
    }

    return client?.estimation.submitTransactionTokenTransfer(
      proposalCreationData.walletAddress,
      proposalCreationData.title,
      proposalCreationData.description,
      proposalCreationData.tokenAddress,
      proposalCreationData.destination,
      proposalCreationData.value
    );
  }, [client, proposalCreationData]);

  const shouldPoll = useMemo(
    () =>
      creationProcessState === TransactionState.WAITING &&
      proposalCreationData !== undefined,
    [creationProcessState, proposalCreationData]
  );

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = useCallback(() => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Dashboard, {
            network,
            dao: daoDetails?.address,
            id: proposalId,
          })
        );
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  }, [
    creationProcessState,
    daoDetails?.address,
    // daoDetails?.ensDomain,
    navigate,
    network,
    proposalId,
    setShowTxModal,
    stopPolling,
  ]);

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;
  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams =
    useCallback(async (): Promise<CreateVotingProposalEstimationParams> => {
      const [title, description] = getValues([
        'proposalTitle',
        'proposalSummary',
      ]);

      //console.log('getProposalCreationParams : proposalTitle', title);
      // Ignore encoding if the proposal had no actions
      const actionsFromForm = getValues('actions');
      // console.log(
      //   'getProposalCreationParams : actionsFromForm',
      //   actionsFromForm
      // );
      const action = actionsFromForm[0];

      const encoded = isNativeToken(action.tokenAddress)
        ? '0x'
        : ABIStorage.encodeFunctionData('MultiSigToken', 'transfer', [
            address,
            BigNumber.from(0),
          ]);
      return {
        walletAddress: daoDetails?.address || '',
        title,
        description,
        destination: action.to.address,
        tokenAddress: action.tokenAddress,
        value: BOACoin.make(action.amount).value,
        data: encoded,
      };
    }, [getValues]);

  const handlePublishProposal = useCallback(async () => {
    // if (!pluginClient) {
    //   return new Error('ERC20 SDK client is not initialized correctly');
    // }
    //
    // if no creation data is set, or transaction already running, do nothing.
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      //console.log('Transaction is running');
      return;
    }

    // trackEvent('newProposal_createNowBtn_clicked', {
    //   dao_address: daoDetails?.address,
    //   estimated_gwei_fee: averageFee,
    //   total_usd_cost: averageFee ? tokenPrice * Number(averageFee) : 0,
    // });
    //
    const isNative = isNativeToken(proposalCreationData.tokenAddress || '0x');
    const proposalIterator = isNative
      ? client?.multiSigWallet.submitTransactionNativeTransfer(
          proposalCreationData.title,
          proposalCreationData.description,
          proposalCreationData.destination,
          proposalCreationData.value
        )
      : client?.multiSigWallet.submitTransactionTokenTransfer(
          proposalCreationData.title,
          proposalCreationData.description,
          proposalCreationData.tokenAddress,
          proposalCreationData.destination,
          proposalCreationData.value
        );

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);

    // NOTE: quite weird, I've had to wrap the entirety of the generator
    // in a try-catch because when the user rejects the transaction,
    // the try-catch block inside the for loop would not catch the error
    // FF - 11/21/2020
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            //console.log(step.txHash);
            // trackEvent('newProposal_transaction_signed', {
            //   dao_address: daoDetails?.address,
            //   network: network,
            //   wallet_provider: provider?.connection.url,
            // });
            break;
          case NormalSteps.SUCCESS: {
            //TODO: replace with step.proposal id when SDK returns proper format
            // const prefixedId = new ProposalId(
            //   step.transactionId
            // ).makeGloballyUnique(pluginAddress);
            //
            const prefixedId = step.transactionId.toString();
            setProposalId(prefixedId);
            setCreationProcessState(TransactionState.SUCCESS);
            // trackEvent('newProposal_transaction_success', {
            //   dao_address: daoDetails?.address,
            //   network: network,
            //   wallet_provider: provider?.connection.url,
            //   proposalId: prefixedId,
            // });

            // cache proposal
            // handleCacheProposal(prefixedId);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
      // trackEvent('newProposal_transaction_failed', {
      //   dao_address: daoDetails?.address,
      //   network: network,
      //   wallet_provider: provider?.connection.url,
      //   error,
      // });
    }
  }, [
    // averageFee,
    creationProcessState,
    daoDetails?.address,
    // handleCacheProposal,
    handleCloseModal,
    isOnWrongNetwork,
    network,
    open,
    // pluginAddress,
    // pluginClient,
    proposalCreationData,
    provider?.connection.url,
    // tokenPrice,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
      else if (!showTxModal) setProposalCreationData(undefined);
    }

    setProposalData();
  }, [creationProcessState, getProposalCreationParams, showTxModal]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishProposal}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposal')}
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
        disabledCallback={disableActionButton}
      />
    </>
  );
};

export {CreateProposalProvider};
