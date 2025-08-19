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
import {Details} from '../utils/paths';
import {useNetwork} from './network';

type CommentParams = {
  proposalId: string;
  message: string;
};

type CreateCommentContextType = {
  handlePublishComment: (params: CommentParams) => Promise<void>;
};

const CreateCommentContext = createContext<CreateCommentContextType | null>(
  null
);

const CreateCommentProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork} = useWallet();

  const [commentProcessState, setCommentProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [commentCreationData, setCommentCreationData] =
    useState<CommentParams>();

  const shouldPoll =
    commentCreationData !== undefined &&
    commentProcessState === TransactionState.WAITING;

  const estimateCommentFees = useCallback(async () => {
    if (commentCreationData !== undefined) {
      return client?.estimation.postComment(
        commentCreationData.proposalId,
        commentCreationData.message
      );
    }
  }, [client?.estimation, commentCreationData]);

  const handlePublishComment = async (params: CommentParams) => {
    setCommentProcessState(TransactionState.WAITING);
    setShowModal(true);
    setCommentCreationData(params);
  };

  const handleExecuteComment = async () => {
    if (commentProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !commentCreationData ||
      commentProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCommentProcessState(TransactionState.LOADING);

    try {
      const commentIterator = client.methods.postComment(
        commentCreationData.proposalId,
        commentCreationData.message
      );

      for await (const step of commentIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log('Comment submission sent:', step);
            break;
          case NormalSteps.PREPARED:
            console.log('Comment submission prepared:', step);
            break;
          case NormalSteps.DONE: {
            console.log('Comment submitted successfully');
            setCommentCreationData(undefined);
            setCommentProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentProcessState(TransactionState.ERROR);
    }
  };

  const handleCloseModal = () => {
    switch (commentProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Details, {
            network,
            id: commentCreationData?.proposalId,
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
  } = usePollGasFee(estimateCommentFees, shouldPoll);

  return (
    <CreateCommentContext.Provider value={{handlePublishComment}}>
      {children}
      <PublishModal
        title={t('assessmentWidget.transactionModal.commentModal.title')}
        subtitle={t(
          'assessmentWidget.transactionModal.commentModal.description'
        )}
        buttonLabelSuccess={t('assessmentWidget.buttonLabelSuccess')}
        state={commentProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteComment}
        closeOnDrag={commentProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateCommentContext.Provider>
  );
};

function useCreateCommentContext(): CreateCommentContextType {
  const context = useContext(CreateCommentContext);
  if (!context) {
    throw new Error(
      'useCreateCommentContext must be used within a CreateCommentProvider'
    );
  }
  return context;
}

export {useCreateCommentContext, CreateCommentProvider};
