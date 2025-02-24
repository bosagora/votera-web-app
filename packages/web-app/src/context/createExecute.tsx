import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient2} from 'hooks/useClient2';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {Dashboard} from '../utils/paths';
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
  const {client} = useClient2();
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
    try {
      const baseGasLimit = BigInt(80000);

      const feeData = await provider?.getFeeData();
      if (!feeData || !provider) {
        throw new Error('가스 데이터를 가져올 수 없습니다.');
      }

      const baseFee = BigInt(feeData.gasPrice?.toString() || '0');
      const maxPriorityFeePerGas = BigInt(
        feeData.maxPriorityFeePerGas?.toString() || '0'
      );

      const totalFeePerGas = baseFee + maxPriorityFeePerGas;
      const estimatedFee = totalFeePerGas * baseGasLimit;

      return {
        average: estimatedFee,
        max: (estimatedFee * BigInt(120)) / BigInt(100),
      };
    } catch (error) {
      console.error('가스 수수료 계산 중 오류:', error);
      return {
        average: BigInt(1000000000),
        max: BigInt(1000000000),
      };
    }
  }, [provider]);

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
      const executeIterator = await client.methods.execute(
        executeData.proposalId
      );

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
        navigate(
          generatePath(Dashboard, {
            network,
            id: executeData?.proposalId,
          })
        );
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
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
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
