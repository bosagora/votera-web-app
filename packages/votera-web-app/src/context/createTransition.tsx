import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {useGlobalModalContext} from './globalModals';
import {NormalSteps} from 'votera-sdk-client';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from '../utils/paths';
import {useNetwork} from './network';

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
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {isOnWrongNetwork, provider} = useWallet();
  const [transitionProcessState, setTransitionProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [transitionData, setTransitionData] = useState<TransitionParams>();
  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    transitionData !== undefined &&
    transitionProcessState === TransactionState.WAITING;

  const estimateTransitionFees = useCallback(async () => {
    if (transitionData !== undefined) {
      return client?.estimation.transition(transitionData.proposalId);
    }
  }, [client?.estimation, transitionData]);

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

    try {
      setProposalId(transitionData.proposalId);
      const transitionIterator = client.methods.transition(
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
        setShowModal(false);
        window.location.reload();
        navigate(
          generatePath(Dashboard, {
            network,
            id: proposalId,
          })
        );
        break;
      default: {
        setShowModal(false);
        stopPolling();
      }
    }
  };

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
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
