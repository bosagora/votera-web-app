import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {useGlobalModalContext} from './globalModals';
import {NormalSteps} from 'votera-sdk-client';

type VoteParams = {
  proposalId: string;
  choice: number;
  openExpiredVote: boolean;
};

type CreateVoteContextType = {
  handlePublishVote: (params: VoteParams) => Promise<void>;
};

const CreateVoteContext = createContext<CreateVoteContextType | null>(null);

const CreateVoteProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const {isOnWrongNetwork, provider} = useWallet();

  const [voteProcessState, setVoteProcessState] = useState<TransactionState>(
    TransactionState.WAITING
  );
  const [showModal, setShowModal] = useState(false);
  const [voteData, setVoteData] = useState<VoteParams>();

  const shouldPoll =
    voteData !== undefined && voteProcessState === TransactionState.WAITING;

  const estimateVoteFees = useCallback(async () => {
    try {
      const baseGasLimit = BigInt(60000); // 투표를 위한 기본 가스 한도

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

  const handlePublishVote = async (params: VoteParams) => {
    setVoteProcessState(TransactionState.WAITING);
    setShowModal(true);
    setVoteData(params);
  };

  const handleExecuteVote = async () => {
    if (voteProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (!client || !voteData || voteProcessState === TransactionState.LOADING) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setVoteProcessState(TransactionState.LOADING);

    if (voteData.openExpiredVote) {
      const voteIterator = await client.methods.transition(voteData.proposalId);

      try {
        for await (const step of voteIterator) {
          switch (step.key) {
            case NormalSteps.SENT:
              console.log('Vote submission sent:', step);
              break;
            case NormalSteps.PREPARED:
              console.log('Vote submission prepared:', step);
              break;
            case NormalSteps.DONE: {
              console.log('Vote submitted successfully');
              setVoteData(undefined);
              setVoteProcessState(TransactionState.SUCCESS);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        setVoteProcessState(TransactionState.ERROR);
      }
    } else {
      try {
        const voteIterator = await client.methods.postBallot(
          voteData.proposalId,
          voteData.choice
        );

        for await (const step of voteIterator) {
          switch (step.key) {
            case NormalSteps.SENT:
              console.log('Vote submission sent:', step);
              break;
            case NormalSteps.PREPARED:
              console.log('Vote submission prepared:', step);
              break;
            case NormalSteps.DONE: {
              console.log('Vote submitted successfully');
              setVoteData(undefined);
              setVoteProcessState(TransactionState.SUCCESS);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error submitting vote:', error);
        setVoteProcessState(TransactionState.ERROR);
      }
    }
  };

  const handleCloseModal = () => {
    switch (voteProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        window.location.reload();
        // navigate(
        //   generatePath(Proposal, {
        //     network,
        //     id: voteData?.proposalId,
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
  } = usePollGasFee(estimateVoteFees, shouldPoll);

  return (
    <CreateVoteContext.Provider value={{handlePublishVote}}>
      {children}
      <PublishModal
        title={t('voteWidget.transactionModal.title')}
        subtitle={t('voteWidget.transactionModal.description')}
        buttonLabelSuccess={t('voteWidget.buttonLabelSuccess')}
        state={voteProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteVote}
        closeOnDrag={voteProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateVoteContext.Provider>
  );
};

function useCreateVoteContext(): CreateVoteContextType {
  const context = useContext(CreateVoteContext);
  if (!context) {
    throw new Error(
      'useCreateVoteContext must be used within a CreateVoteProvider'
    );
  }
  return context;
}

export {useCreateVoteContext, CreateVoteProvider};
