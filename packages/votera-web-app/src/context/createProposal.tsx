import {BigNumber, ethers} from 'ethers';
import React, {createContext, useCallback, useContext, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useWallet} from 'hooks/useWallet';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {TransactionState} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {
  ProposalType,
  SystemProposalType,
  SystemProposalParam,
  NormalSteps,
  Amount,
} from 'votera-sdk-client';

type CreateProposalContextType = {
  /** Prepares the proposal creation data and awaits user confirmation */
  handlePublishProposal: () => Promise<void>;
};

const CreateProposalContext = createContext<CreateProposalContextType | null>(
  null
);

type CreateProposalParams = {
  proposalType: ProposalType;
  title: string;
  description: string;
  proposalId: string;
  fundAmount: BigNumber;
  assessmentPeriod: number;
  votePeriod: number;
  documentId: string;
  systemType: SystemProposalType;
  params: SystemProposalParam[];
};

const CreateProposalProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {client} = useClient();
  const navigate = useNavigate();
  const {getValues} = useFormContext();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);
  const [proposalCreationData, setProposalCreationData] =
    useState<CreateProposalParams>();
  const [showModal, setShowModal] = useState(false);
  const [proposalId, setProposalId] = useState<string>();

  const shouldPoll =
    proposalCreationData !== undefined &&
    creationProcessState === TransactionState.WAITING;

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  const estimateCreationFees = useCallback(async () => {
    if (!proposalCreationData) return;
    if (!client) return;

    return client.estimation.createProposal(
      proposalCreationData.proposalType,
      proposalCreationData.title,
      proposalCreationData.description,
      proposalCreationData.proposalId,
      proposalCreationData.fundAmount,
      proposalCreationData.assessmentPeriod,
      proposalCreationData.votePeriod,
      proposalCreationData.documentId,
      proposalCreationData.systemType,
      proposalCreationData.params
    );
  }, [client, proposalCreationData]);

  const getProposalCreationParams = useCallback(async () => {
    const [
      proposalId,
      proposalType,
      title,
      description,
      documentId,
      assessmentPeriod,
      votePeriod,
      fundAmount,
    ] = getValues([
      'proposalId',
      'proposalType',
      'title',
      'description',
      'documentId',
      'assessmentPeriod',
      'votePeriod',
      'fundAmount',
    ]);

    // console.log('fundAmount', fundAmount);
    return {
      proposalType: proposalType,
      title,
      description,
      proposer: address,
      proposalId: proposalId,
      fundAmount:
        proposalType === ProposalType.FUND
          ? Amount.make(Number(fundAmount), 18).value
          : Amount.make(Number(0), 18).value,
      assessmentPeriod: Number(assessmentPeriod || 7),
      votePeriod: Number(votePeriod || 14),
      documentId,
      systemType: SystemProposalType.NORMAL,
      params: [],
    };
  }, [getValues]);

  const handlePublishProposal = async () => {
    setCreationProcessState(TransactionState.WAITING);
    setShowModal(true);
    const creationParams = await getProposalCreationParams();
    setProposalCreationData(creationParams);
  };

  const handleExecuteCreation = async () => {
    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (
      !client ||
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }
    setCreationProcessState(TransactionState.LOADING);
    try {
      setProposalId(proposalCreationData.proposalId);
      const isAvailable = await client.methods.isAvailableProposalId(
        proposalCreationData.proposalId
      );
      if (!isAvailable) {
        throw new Error('Proposal ID is already in use');
      }
      // console.log('proposalCreationData :', proposalCreationData);
      const proposalIterator = client.methods.createProposal(
        proposalCreationData.proposalType,
        proposalCreationData.title,
        proposalCreationData.description,
        proposalCreationData.proposalId,
        proposalCreationData.fundAmount,
        proposalCreationData.assessmentPeriod,
        proposalCreationData.votePeriod,
        proposalCreationData.documentId,
        proposalCreationData.systemType,
        proposalCreationData.params
      );

      for await (const step of proposalIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log('Proposal creation transaction sent:', step);
            break;
          case NormalSteps.PREPARED:
            console.log('Proposal creation transaction prepared:', step);
            break;
          case NormalSteps.DONE: {
            console.log('Proposal created successfully');
            setProposalId(proposalCreationData.proposalId as string);
            setProposalCreationData(undefined);
            setCreationProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error creating proposal:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      const lowerCaseMessage = errorMessage.toLowerCase();
      if (lowerCaseMessage.includes('invalid participant')) {
        alert('You do not have permission to create proposals.');
      } else {
        // alert(errorMessage);
      }
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowModal(false);
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
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  return (
    <CreateProposalContext.Provider value={{handlePublishProposal}}>
      {children}
      <PublishModal
        title={t('createProposal.deploy.transactionModal.title')}
        subtitle={t('createProposal.deploy.transactionModal.description')}
        buttonLabelSuccess={t('createProposal.buttonLabelSuccess')}
        state={creationProcessState}
        isOpen={showModal}
        onClose={handleCloseModal}
        callback={handleExecuteCreation}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        disabledCallback={disableActionButton}
      />
    </CreateProposalContext.Provider>
  );
};

function useCreateProposalContext(): CreateProposalContextType {
  const context = useContext(CreateProposalContext);
  if (!context) {
    throw new Error(
      'useCreateProposalContext must be used within a CreateProposalProvider'
    );
  }
  return context;
}

export {useCreateProposalContext, CreateProposalProvider};
