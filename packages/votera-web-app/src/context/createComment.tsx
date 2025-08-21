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
  const {isOnWrongNetwork, provider} = useWallet();

  const [commentProcessState, setCommentProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [commentCreationData, setCommentCreationData] =
    useState<CommentParams>();
  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    commentCreationData !== undefined &&
    commentProcessState === TransactionState.WAITING;

  const estimateCommentFees = useCallback(async () => {
    try {
      const baseGasLimit = BigInt(50000); // 코멘트 제출을 위한 기본 가스 한도

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
      setProposalId(commentCreationData.proposalId);
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
        setShowModal(false);
        window.location.reload();
        navigate(
          generatePath(Details, {
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
