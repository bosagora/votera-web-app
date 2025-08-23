import React, {createContext, useCallback, useContext, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {NormalSteps} from 'votera-sdk-client';
import {Details} from '../utils/paths';

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
  const {isOnWrongNetwork, provider} = useWallet();

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
    if (assessmentCreationData !== undefined) {
      return client?.estimation.postScore(assessmentCreationData.proposalId, [
        assessmentCreationData.assessment.completeness,
        assessmentCreationData.assessment.possibility,
        assessmentCreationData.assessment.profitability,
        assessmentCreationData.assessment.attractiveness,
        assessmentCreationData.assessment.scalability,
      ]);
    }
  }, [client?.estimation, assessmentCreationData]);

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
      const assessIterator = client.methods.transition(
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
        const assessIterator = client.methods.postScore(
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
    // console.log('assessmentProcessState', assessmentProcessState);
    // console.log('proposalId', proposalId);
    switch (assessmentProcessState) {
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
