import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {Dashboard} from '../utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {NormalSteps} from 'votera-sdk-client';

type SendVoteCostParams = {
  proposalId: string;
};

type CreateSendVoteCostContextType = {
  handlePublish: (params: SendVoteCostParams) => Promise<void>;
};

const CreateSendVoteCostContext =
  createContext<CreateSendVoteCostContextType | null>(null);

const CreateSendVoteCostProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider} = useWallet();

  const [sendVoteCostProcessState, setSendVoteCostProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [sendVoteCostData, setSendVoteCostData] =
    useState<SendVoteCostParams>();
  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    sendVoteCostData !== undefined &&
    sendVoteCostProcessState === TransactionState.WAITING;

  const estimateSendVoteCostFees = useCallback(async () => {
    if (sendVoteCostData !== undefined) {
      return client?.estimation.sendVoteCost(sendVoteCostData.proposalId);
    }
  }, [client?.estimation, sendVoteCostData]);

  const handlePublish = async (params: SendVoteCostParams) => {
    setSendVoteCostProcessState(TransactionState.WAITING);
    setShowModal(true);
    setSendVoteCostData(params);
  };

  const handleSendVoteCostSubmission = async () => {
    if (sendVoteCostProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !sendVoteCostData ||
      sendVoteCostProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setSendVoteCostProcessState(TransactionState.LOADING);

    try {
      setProposalId(sendVoteCostData.proposalId);
      const sendVoteCostIterator = client.methods.sendVoteCost(
        sendVoteCostData.proposalId
      );

      for await (const step of sendVoteCostIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log('SendVoteCost submission sent:', step);
            break;
          case NormalSteps.PREPARED:
            console.log('SendVoteCost submission prepared:', step);
            break;
          case NormalSteps.DONE: {
            console.log('SendVoteCost submitted successfully');
            setSendVoteCostData(undefined);
            setSendVoteCostProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error submitting sendVoteCost:', error);
      setSendVoteCostProcessState(TransactionState.ERROR);
    }
  };

  const handleCloseModal = () => {
    switch (sendVoteCostProcessState) {
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
  } = usePollGasFee(estimateSendVoteCostFees, shouldPoll);

  return (
    <CreateSendVoteCostContext.Provider value={{handlePublish: handlePublish}}>
      {children}
      <PublishModal
        title={t('sendVoteCostWidget.transactionModal.title')}
        subtitle={t('sendVoteCostWidget.transactionModal.description')}
        buttonLabelSuccess={t('sendVoteCostWidget.buttonLabelSuccess')}
        state={sendVoteCostProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleSendVoteCostSubmission}
        closeOnDrag={sendVoteCostProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateSendVoteCostContext.Provider>
  );
};

function useCreateSendVoteCostContext(): CreateSendVoteCostContextType {
  const context = useContext(CreateSendVoteCostContext);
  if (!context) {
    throw new Error(
      'CreateSendVoteCostContext must be used within a CreateSendVoteCostProvider'
    );
  }
  return context;
}

export {useCreateSendVoteCostContext, CreateSendVoteCostProvider};
