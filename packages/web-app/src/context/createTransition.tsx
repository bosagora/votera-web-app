import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {useGlobalModalContext} from './globalModals';
import {NormalSteps} from 'votera-sdk-client';

type TransitionParams = {
  proposalId: string;
};

type CreateTransitionContextType = {
  handlePublishTransition: (params: TransitionParams) => Promise<void>;
};

const CreateTransitionContext =
  createContext<CreateTransitionContextType | null>(null);

const CreateTransitionProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const {isOnWrongNetwork, provider} = useWallet();
  const [proposalId, setProposalId] = useState<string>();
  const [transitionProcessState, setTransitionProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [transitionData, setTransitionData] = useState<TransitionParams>();

  const shouldPoll =
    transitionData !== undefined &&
    transitionProcessState === TransactionState.WAITING;

  const estimateTransitionFees = useCallback(async () => {
    try {
      const baseGasLimit = BigInt(80000); // 기본 가스 한도

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

  const handlePublishTransition = async (params: TransitionParams) => {
    setTransitionProcessState(TransactionState.WAITING);
    setShowModal(true);
    setTransitionData(params);
  };

  const handleExecuteTransition = async () => {
    if (transitionProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !transitionData ||
      transitionProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setTransitionProcessState(TransactionState.LOADING);

    setProposalId(transitionData.proposalId);
    try {
      const transitionIterator = await client.methods.transition(
        transitionData.proposalId
      );

      for await (const step of transitionIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log('Transition submission sent:', step);
            break;
          case NormalSteps.PREPARED:
            console.log('Transition submission prepared:', step);
            break;
          case NormalSteps.DONE: {
            console.log('Transition submitted successfully');
            setTransitionData(undefined);
            setTransitionProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error submitting transition:', error);
      setTransitionProcessState(TransactionState.ERROR);
    }
  };

  const handleCloseModal = () => {
    switch (transitionProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        window.location.reload();
        // navigate(
        //   generatePath(Proposal, {
        //     network,
        //     id: proposalId,
        //   })
        // );
        // setShowModal(false);
        // setProposalId(undefined);
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
  } = usePollGasFee(estimateTransitionFees, shouldPoll);

  return (
    <CreateTransitionContext.Provider
      value={{handlePublishTransition: handlePublishTransition}}
    >
      {children}
      <PublishModal
        title={t('transitionWidget.transactionModal.title')}
        subtitle={t('transitionWidget.transactionModal.description')}
        buttonLabelSuccess={t('transitionWidget.buttonLabelSuccess')}
        state={transitionProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteTransition}
        closeOnDrag={transitionProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateTransitionContext.Provider>
  );
};

function useCreateTransitionContext(): CreateTransitionContextType {
  const context = useContext(CreateTransitionContext);
  if (!context) {
    throw new Error(
      'useCreateTransitionContext must be used within a CreateTransitionProvider'
    );
  }
  return context;
}

export {useCreateTransitionContext, CreateTransitionProvider};
