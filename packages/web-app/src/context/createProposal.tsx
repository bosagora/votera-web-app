import {useReactiveVar} from '@apollo/client';
import {
  CreateMajorityVotingProposalParams,
  CreateProposalBaseParams,
  PluginTypes,
  ProposalCreationSteps,
  VoteValues,
  WithdrawParams,
} from 'utils/aragon/types';
// import {
//   DaoAction,
//   ProposalMetadata,
//   TokenType,
// } from '@aragon/sdk-client-common';
// import {hexToBytes} from '@aragon/sdk-common';
import {BigNumber, ethers} from 'ethers';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
// import {useDaoToken} from 'hooks/useDaoToken';
// import {
//   isMultisigVotingSettings,
//   isTokenVotingSettings,
//   usePluginSettings,
// } from 'hooks/usePluginSettings';
// import {usePollGasFee} from 'hooks/usePollGasfee';
// import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
// import {trackEvent} from 'services/analytics';
// import {getEtherscanVerifiedContract} from 'services/etherscanAPI';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
// import {
//   customJSONReplacer,
//   getDefaultPayableAmountInputName,
//   toDisplayEns,
// } from 'utils/library';
// import {Proposal} from 'utils/paths';
// import {
//   CacheProposalParams,
//   getNonEmptyActions,
//   mapToCacheProposal,
// } from 'utils/proposals';
// import {isNativeToken} from 'utils/tokens';
// import {ProposalId, ProposalResource} from 'utils/types';
// import {pendingMultisigProposalsVar} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {trackEvent} from '../services/analytics';
import {usePollGasFee} from '../hooks/usePollGasfee';
import {BigNumberish} from '@ethersproject/bignumber';
import {ABIStorage, BOACoin, NormalSteps} from 'multisig-wallet-sdk-client';
import {Dashboard} from '../utils/paths';
import {isNativeToken} from 'utils/tokens';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};



type CreateVotingProposalParams = {
  title: string;
  description: string;
  destination: string;
  value: BigNumberish;
};

type CreateVotingProposalEstimationParams = {
  walletAddress: string;
  title: string;
  description: string;
  destination: string;
  value: BigNumberish;
  data: string;
  tokenAddress: string;
};

// Mock 데이터 추가
const MOCK_DAO_DETAILS = {
  address: '0x123...abc',
};

const MOCK_PROPOSAL_ITERATOR = {
  *[Symbol.asyncIterator]() {
    yield {key: NormalSteps.SENT, txHash: '0x123'};
    yield {key: NormalSteps.SUCCESS, transactionId: 1};
  },
};

const mockDisplayEns = (addr: string) => addr;

const CreateProposalProvider: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  //console.log('CreateProposalProvider');
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {preferences} = usePrivacyContext();

  const client = {
    estimation: {
      submitTransactionNativeTransfer: async (..._args: any[]) => ({average: 1000}),
      submitTransactionTokenTransfer: async (..._args: any[]) => ({average: 1000})
    }
  };
  const navigate = useNavigate();
  const {getValues} = useFormContext();
  const {network} = useNetwork();
  const mockWalletData = {
    isOnWrongNetwork: false,
    provider: null,
    address: '0x123...abc'
  };
  const {isOnWrongNetwork, provider, address} = mockWalletData;

  // useDaoDetailsQuery를 mock으로 대체
  const daoDetails = MOCK_DAO_DETAILS;
  const daoDetailsLoading = false;

  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds(1000000000);

  const [proposalId, setProposalId] = useState<string>();
  const [proposalCreationData, setProposalCreationData] =
    useState<CreateVotingProposalEstimationParams>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const estimateCreationFees = useCallback(async () => {
    if (!client) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    if (isNativeToken(proposalCreationData.tokenAddress)) {
      return client?.estimation.submitTransactionNativeTransfer(
        proposalCreationData.walletAddress,
        proposalCreationData.title,
        proposalCreationData.description,
        proposalCreationData.destination,
        BigNumber.from(proposalCreationData.value)
      );
    }

    return client?.estimation.submitTransactionTokenTransfer(
      proposalCreationData.walletAddress,
      proposalCreationData.title,
      proposalCreationData.description,
      proposalCreationData.tokenAddress,
      proposalCreationData.destination,
      BigNumber.from(proposalCreationData.value)
    );
  }, [client, proposalCreationData]);

  const shouldPoll = useMemo(
    () =>
      creationProcessState === TransactionState.WAITING &&
      proposalCreationData !== undefined,
    [creationProcessState, proposalCreationData]
  );

  const {
    tokenPrice = 1000,
    maxFee = 100000,
    averageFee = 50000,
    stopPolling = () => {},
    error: gasEstimationError = null,
  } = {
    tokenPrice: 1000,
    maxFee: 100000, 
    averageFee: 50000,
    stopPolling: () => {},
    error: null
  };

  const handleCloseModal = useCallback(() => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(
          generatePath(Dashboard, {
            network,
            dao: daoDetails?.address,
            id: proposalId,
          })
        );
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  }, [
    creationProcessState,
    daoDetails?.address,
    // daoDetails?.ensDomain,
    navigate,
    network,
    proposalId,
    setShowTxModal,
    stopPolling,
  ]);

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;
  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams =
    useCallback(async (): Promise<CreateVotingProposalEstimationParams> => {
      const [title, description] = getValues([
        'proposalTitle',
        'proposalSummary',
      ]);

      //console.log('getProposalCreationParams : proposalTitle', title);
      // Ignore encoding if the proposal had no actions
      const actionsFromForm = getValues('actions');
      // console.log(
      //   'getProposalCreationParams : actionsFromForm',
      //   actionsFromForm
      // );
      const action = actionsFromForm[0];

      const encoded = isNativeToken(action.tokenAddress)
        ? '0x'
        : ABIStorage.encodeFunctionData('MultiSigToken', 'transfer', [
            mockDisplayEns(address),
            BigNumber.from(0),
          ]);
      return {
        walletAddress: daoDetails?.address || '',
        title,
        description,
        destination: action.to.address,
        tokenAddress: action.tokenAddress,
        value: BOACoin.make(action.amount).value,
        data: encoded,
      };
    }, [getValues]);

  const handlePublishProposal = useCallback(async () => {
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      return;
    }

    const isNative = isNativeToken(proposalCreationData.tokenAddress || '0x');
    
    // Mock iterator 사용
    const proposalIterator = MOCK_PROPOSAL_ITERATOR;

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);

    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case NormalSteps.SENT:
            break;
          case NormalSteps.SUCCESS: {
            const mockTransactionId = "123"; // mock transaction ID 사용
            setProposalId(mockTransactionId);
            setCreationProcessState(TransactionState.SUCCESS);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  }, [
    creationProcessState,
    handleCloseModal,
    isOnWrongNetwork,
    open,
    proposalCreationData,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
      else if (!showTxModal) setProposalCreationData(undefined);
    }

    setProposalData();
  }, [creationProcessState, getProposalCreationParams, showTxModal]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {children}
      {/* <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishProposal}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposal')}
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
        disabledCallback={disableActionButton}
      /> */}
    </>
  );
};

export {CreateProposalProvider};
