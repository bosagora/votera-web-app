import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {Details} from '../utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {NormalSteps} from 'votera-sdk-client';

type ExecuteParams = {
  proposalId: string;
};

type CreateExecuteContextType = {
  handlePublishExecution: (params: ExecuteParams) => Promise<void>;
};

const CreateExecuteContext = createContext<CreateExecuteContextType | null>(
  null
);

const CreateExecuteProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider} = useWallet();

  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [executeData, setExecuteData] = useState<ExecuteParams>();

  const shouldPoll =
    executeData !== undefined &&
    executeProcessState === TransactionState.WAITING;

  const estimateExecuteFees = useCallback(async () => {
    if (executeData !== undefined) {
      return client?.estimation.execute(executeData.proposalId);
    }
  }, [client?.estimation, executeData]);

  const handlePublishExecution = async (params: ExecuteParams) => {
    setExecuteProcessState(TransactionState.WAITING);
    setShowModal(true);
    setExecuteData(params);
  };

  const handleExecuteSubmission = async () => {
    if (executeProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !executeData ||
      executeProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setExecuteProcessState(TransactionState.LOADING);

    try {
      const executeIterator = client.methods.execute(executeData.proposalId);

      for await (const step of executeIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log('Execute submission sent:', step);
            break;
          case NormalSteps.PREPARED:
            console.log('Execute submission prepared:', step);
            break;
          case NormalSteps.DONE: {
            console.log('Execute submitted successfully');
            setExecuteData(undefined);
            setExecuteProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error submitting execute:', error);
      setExecuteProcessState(TransactionState.ERROR);
    }
  };

  const handleCloseModal = () => {
    switch (executeProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        window.location.reload();
        // navigate(
        //   generatePath(Details, {
        //     network,
        //     id: executeData?.proposalId,
        //   })
        // );
        break;
      default: {
        setShowModal(false);
      }
    }
  };

  const {
    tokenPrice,
    maxFee,
    averageFee,
    error: gasEstimationError,
  } = usePollGasFee(estimateExecuteFees, shouldPoll);

  return (
    <CreateExecuteContext.Provider
      value={{handlePublishExecution: handlePublishExecution}}
    >
      {children}
      <PublishModal
        title={t('executionWidget.transactionModal.title')}
        subtitle={t('executionWidget.transactionModal.description')}
        buttonLabelSuccess={t('executionWidget.buttonLabelSuccess')}
        state={executeProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteSubmission}
        closeOnDrag={executeProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateExecuteContext.Provider>
  );
};

function useCreateExecuteContext(): CreateExecuteContextType {
  const context = useContext(CreateExecuteContext);
  if (!context) {
    throw new Error(
      'useCreateExecuteContext must be used within a CreateExecuteProvider'
    );
  }
  return context;
}

export {useCreateExecuteContext, CreateExecuteProvider};
