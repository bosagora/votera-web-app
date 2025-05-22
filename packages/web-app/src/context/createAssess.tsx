import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {Proposal} from '../utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {NormalSteps} from 'votera-sdk-client';

type Assessment = {
  completeness: number;
  possibility: number;
  profitability: number;
  attractiveness: number;
  scalability: number;
};

type AssessmentParams = {
  proposalId: string;
  assessment: Assessment;
  open_expired_assessment: boolean;
};

type CreateAssessContextType = {
  handlePublishAssessment: (params: AssessmentParams) => Promise<void>;
};

const CreateAssessContext = createContext<CreateAssessContextType | null>(null);

const CreateAssessProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();

  const [assessmentProcessState, setAssessmentProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [showModal, setShowModal] = useState(false);
  const [assessmentCreationData, setAssessmentCreationData] =
    useState<AssessmentParams>();
  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    assessmentCreationData !== undefined &&
    assessmentProcessState === TransactionState.WAITING;

  const estimateAssessmentFees = useCallback(async () => {
    try {
      const baseGasLimit = BigInt(80000); // 평가 제출을 위한 기본 가스 한도

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

  const handlePublishAssessment = async (params: AssessmentParams) => {
    setAssessmentProcessState(TransactionState.WAITING);
    setShowModal(true);
    setAssessmentCreationData(params);
  };

  const handleExecuteAssessment = async () => {
    if (assessmentProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !assessmentCreationData ||
      assessmentProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setAssessmentProcessState(TransactionState.LOADING);

    if (assessmentCreationData.open_expired_assessment) {
      const assessIterator = await client.methods.transition(
        assessmentCreationData.proposalId
      );

      try {
        for await (const step of assessIterator) {
          switch (step.key) {
            case NormalSteps.SENT:
              console.log('Assessment submission sent:', step);
              break;
            case NormalSteps.PREPARED:
              console.log('Assessment submission prepared:', step);
              break;
            case NormalSteps.DONE:
              console.log('Assessment submitted successfully');
              break;
          }
        }
      } catch (error) {
        console.error('Error submitting assessment:', error);
        setAssessmentProcessState(TransactionState.ERROR);
      }
    } else {
      try {
        const scores = [
          assessmentCreationData.assessment.completeness,
          assessmentCreationData.assessment.possibility,
          assessmentCreationData.assessment.profitability,
          assessmentCreationData.assessment.attractiveness,
          assessmentCreationData.assessment.scalability,
        ] as const;

        setProposalId(assessmentCreationData.proposalId);
        const assessIterator = await client.methods.postScore(
          assessmentCreationData.proposalId,
          scores as [number, number, number, number, number]
        );

        for await (const step of assessIterator) {
          switch (step.key) {
            case NormalSteps.SENT:
              console.log('Assessment submission sent:', step);
              break;
            case NormalSteps.PREPARED:
              console.log('Assessment submission prepared:', step);
              break;
            case NormalSteps.DONE: {
              console.log('Assessment submitted successfully');
              setAssessmentCreationData(undefined);
              setAssessmentProcessState(TransactionState.SUCCESS);
              break;
            }
          }
        }
      } catch (error) {
        console.error('Error submitting assessment:', error);
        setAssessmentProcessState(TransactionState.ERROR);
      }
    }
  };

  const handleCloseModal = () => {
    console.log('assessmentProcessState', assessmentProcessState);
    console.log('proposalId', proposalId);
    switch (assessmentProcessState) {
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
  } = usePollGasFee(estimateAssessmentFees, shouldPoll);

  return (
    <CreateAssessContext.Provider
      value={{handlePublishAssessment: handlePublishAssessment}}
    >
      {children}
      <PublishModal
        title={t('assessmentWidget.transactionModal.title')}
        subtitle={t('assessmentWidget.transactionModal.description')}
        buttonLabelSuccess={t('assessmentWidget.buttonLabelSuccess')}
        state={assessmentProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteAssessment}
        closeOnDrag={assessmentProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
      />
    </CreateAssessContext.Provider>
  );
};

function useCreateAssessContext(): CreateAssessContextType {
  const context = useContext(CreateAssessContext);
  if (!context) {
    throw new Error(
      'useCreateAssessContext must be used within a CreateAssessProvider'
    );
  }
  return context;
}

export {useCreateAssessContext, CreateAssessProvider};
