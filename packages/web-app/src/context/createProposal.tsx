import {BigNumber, ethers} from 'ethers';
import {BytesLike} from '@ethersproject/bytes';
import React, {createContext, useCallback, useContext, useState} from 'react';
import {useFormContext} from 'react-hook-form';
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
import {BigNumberish} from '@ethersproject/bignumber';
import {
  ProposalType,
  SystemProposalType,
  ISystemProposalParam,
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
  params: ISystemProposalParam[];
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
    if (proposalCreationData === undefined) {
      return {
        average: BigInt(1500000000),
        max: BigInt(1500000000),
      };
    }

    try {
      // 기본 가스 한도 설정
      let baseGasLimit = BigInt(21000); // 기본 이더리움 트랜잭션

      // 제안서 타입에 따른 가스 한도 조정
      if (proposalCreationData.proposalType === ProposalType.FUND) {
        baseGasLimit = BigInt(100000); // 펀딩 제안서는 더 높은 가스 필요
      } else if (proposalCreationData.proposalType === ProposalType.SYSTEM) {
        baseGasLimit = BigInt(80000); // 시스템 제안서에 대한 가스 설정
      }

      // 펀딩 금액에 따른 가스 조정
      if (proposalCreationData.fundAmount) {
        const fundAmountBigNumber = BigNumber.from(
          proposalCreationData.fundAmount
        );
        const fundAmountFactor = fundAmountBigNumber.toBigInt() / BigInt(1e18);
        baseGasLimit += fundAmountFactor * BigInt(1000); // 펀딩 금액에 따른 추가 가스
      }

      // 파라미터가 있는 경우 추가 가스 계산ㅂ
      if (
        proposalCreationData.params &&
        proposalCreationData.params.length > 0
      ) {
        baseGasLimit += BigInt(50000 * proposalCreationData.params.length);
      }

      // 설명 길이에 따른 가스 추가
      const descriptionLength = proposalCreationData.description.length;
      if (descriptionLength > 1000) {
        baseGasLimit += BigInt(100000); // 긴 설명에 대한 추가 가스
      }

      const feeData = await provider?.getFeeData();

      if (!feeData || !provider) {
        throw new Error('가스 데이터를 가져올 수 없습니다.');
      }

      const baseFee = BigNumber.from(feeData.gasPrice ?? 0);
      const maxPriorityFeePerGas = BigNumber.from(
        feeData.maxPriorityFeePerGas ?? 0
      );

      const totalFeePerGas = baseFee.add(maxPriorityFeePerGas);
      const estimatedFee = totalFeePerGas.mul(baseGasLimit);

      // 네트워크 혼잡도에 따른 추가 버퍼
      const networkBusyMultiplier =
        baseFee > ethers.utils.parseUnits('100', 'gwei')
          ? BigInt(130)
          : BigInt(120);

      return {
        average: estimatedFee.toBigInt(),
        max: estimatedFee
          .mul(BigNumber.from(networkBusyMultiplier))
          .div(100)
          .toBigInt(),
        gasLimit: baseGasLimit,
        maxFeePerGas: totalFeePerGas.toBigInt(),
        maxPriorityFeePerGas: maxPriorityFeePerGas.toBigInt(),
        baseFee: baseFee.toBigInt(),
      };
    } catch (error) {
      console.error('가스 수수료 계산 중 오류:', error);
      return {
        average: BigInt(1500000000),
        max: BigInt(1500000000),
        gasLimit: BigInt(21000),
        maxFeePerGas: BigInt(0),
        maxPriorityFeePerGas: BigInt(0),
        baseFee: BigInt(0),
      };
    }
  }, [proposalCreationData, provider]);

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

    console.log('fundAmount', fundAmount);
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
      const isAvailable = await client.methods.isAvailableProposalId(
        proposalCreationData.proposalId
      );
      if (!isAvailable) {
        throw new Error('Proposal ID is already in use');
      }
      console.log('proposalCreationData :', proposalCreationData);
      const proposalIterator = await client.methods.createProposal(
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
        navigate(
          generatePath(Dashboard, {
            network,
            id: proposalId,
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
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  return (
    <CreateProposalContext.Provider value={{handlePublishProposal}}>
      {children}
      <PublishModal
        title={t('createDAO2.deploy.transactionModal.title')}
        subtitle={t('createDAO2.deploy.transactionModal.description')}
        buttonLabelSuccess={t('createDAO2.buttonLabelSuccess')}
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
