import {
  VoteProposalParams,
  VoteValues,
} from '../utils/aragon/sdk-client-multisig-types';
import {BigNumber} from 'ethers';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {PENDING_MULTISIG_VOTES_KEY, TransactionState} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {ProposalId} from 'utils/types';

import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {useProviders} from './providers';
import {PluginTypes} from '../utils/aragon/types';
import {useClient} from '../hooks/useClient';
import {NormalSteps} from 'multisig-wallet-sdk-client';
import {Proposal} from '../utils/paths';
import {pendingMultisigApprovalsVar} from './apolloClient';

//TODO: currently a context, but considering there might only ever be one child,
// might need to turn it into a wrapper that passes props to proposal page
type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (vote: VoteValues, token?: string) => void;
  handleExecuteProposal: () => void;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading: boolean;
  voteSubmitted: boolean;
  executeSubmitted: boolean;
  executionFailed: boolean;
  transactionHash: string;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id: urlId} = useParams();

  const {address, isConnected} = useWallet();
  const {network} = useNetwork();
  const navigate = useNavigate();
  const {infura: provider} = useProviders();

  const [tokenAddress, setTokenAddress] = useState<string>();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  const [voteParams, setVoteParams] = useState<VoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const [executeProposalId, setExecuteProposalId] = useState<ProposalId>();
  const [executeSubmitted, setExecuteSubmitted] = useState(false);
  const [executionFailed, setExecutionFailed] = useState(false);
  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>();
  const [transactionHash, setTransactionHash] = useState<string>('');

  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.address || '',
      pluginType: 'multisig.plugin.dao.eth',
    };
  }, [daoDetails]);
  const {client} = useClient();
  const {preferences} = usePrivacyContext();

  const shouldPollVoteFees = useMemo(
    () =>
      (voteParams !== undefined &&
        voteProcessState === TransactionState.WAITING) ||
      (executeProposalId !== undefined &&
        executeProcessState === TransactionState.WAITING),
    [executeProposalId, executeProcessState, voteParams, voteProcessState]
  );

  const shouldDisableCallback = useMemo(() => {
    if (
      voteProcessState === TransactionState.SUCCESS ||
      executeProcessState === TransactionState.SUCCESS
    )
      return false;

    return !(voteParams || executeProposalId);
  }, [executeProcessState, executeProposalId, voteParams, voteProcessState]);

  /*************************************************
   *                    Helpers                    *
   *************************************************/
  const handleSubmitVote = useCallback(
    (vote: VoteValues, tokenAddress?: string) => {
      // id should never be null as it is required to navigate to this page
      // Also, the proposal details page (child) navigates back to not-found
      // if the id is invalid
      setVoteParams({
        proposalId: new ProposalId(urlId!).export(),
        vote,
      });

      setTokenAddress(tokenAddress);
      setShowVoteModal(true);
      setVoteProcessState(TransactionState.WAITING);
    },
    [urlId]
  );

  // estimate voting fees
  const estimateVotingFees = useCallback(async () => {
    return client?.estimation.confirmTransaction(
      address || '',
      BigNumber.from(0)
    );
  }, [address, client]);

  const handleExecuteProposal = useCallback(() => {
    setExecuteProposalId(new ProposalId(urlId!));
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  }, [urlId]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateVotingFees, shouldPollVoteFees);

  // handles closing vote modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowVoteModal(false);
        break;
      default: {
        setShowVoteModal(false);
        // stopPolling();
      }
    }
  }, [stopPolling, voteProcessState]);

  // set proper state and cache vote when transaction is successful
  const onVoteSubmitted = useCallback(
    async (proposalId: ProposalId, vote: VoteValues) => {
      if (!daoDetails?.address) return;

      setVoteParams(undefined);
      setVoteSubmitted(true);
      setVoteProcessState(TransactionState.SUCCESS);

      if (!address) return;

      let newCache;
      let cacheKey = '';
      // // cache multisig vote
      if (pluginType === 'multisig.plugin.dao.eth') {
        newCache = {
          date: new Date().toDateString(),
        };
        cacheKey = PENDING_MULTISIG_VOTES_KEY;
        pendingMultisigApprovalsVar(newCache);
      }

      // add to local storage
      if (preferences?.functional) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
      navigate(
        generatePath(Proposal, {
          network,
          dao: daoDetails.address,
          id: proposalId.export(),
        })
      );
    },
    [
      address,
      daoDetails?.address,
      network,
      pluginType,
      preferences?.functional,
      provider,
      tokenAddress,
    ]
  );

  // handles vote submission/execution
  const handleVoteExecution = useCallback(async () => {
    if (voteProcessState === TransactionState.SUCCESS) {
      handleCloseVoteModal();
      return;
    }

    if (!voteParams || voteProcessState === TransactionState.LOADING) {
      //console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    setVoteProcessState(TransactionState.LOADING);

    const voteSteps = client?.multiSigWallet.confirmTransaction(
      BigNumber.from(new ProposalId(urlId!).export())
    );

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    // clear up previous submission state
    setVoteSubmitted(false);

    try {
      for await (const step of voteSteps) {
        switch (step.key) {
          case NormalSteps.SENT:
            console.log(step.txHash);
            break;
          case NormalSteps.SUCCESS:
            await onVoteSubmitted(
              new ProposalId(voteParams.proposalId),
              voteParams.vote
            );
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setVoteProcessState(TransactionState.ERROR);
    }
  }, [
    client?.multiSigWallet,
    handleCloseVoteModal,
    onVoteSubmitted,
    pluginAddress,
    urlId,
    voteParams,
    voteProcessState,
  ]);

  // handles closing execute modal
  const handleCloseExecuteModal = useCallback(() => {
    switch (executeProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowExecuteModal(false);
          setExecuteSubmitted(true);
        }
        break; // TODO: reload and cache
      default: {
        setShowExecuteModal(false);
        stopPolling();
      }
    }
  }, [executeProcessState, stopPolling]);

  const value = useMemo(
    () => ({
      handleSubmitVote,
      handleExecuteProposal,
      isLoading,
      pluginAddress,
      pluginType,
      voteSubmitted,
      executeSubmitted,
      executionFailed,
      transactionHash,
    }),
    [
      isLoading,
      executeSubmitted,
      executionFailed,
      handleExecuteProposal,
      handleSubmitVote,
      pluginAddress,
      pluginType,
      transactionHash,
      voteSubmitted,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ProposalTransactionContext.Provider value={value}>
      {children}
      <PublishModal
        title={
          showExecuteModal
            ? t('labels.signExecuteProposal')
            : t('labels.signVote')
        }
        buttonLabel={
          showExecuteModal
            ? t('governance.proposals.buttons.execute')
            : t('governance.proposals.buttons.vote')
        }
        state={
          (showExecuteModal ? executeProcessState : voteProcessState) ||
          TransactionState.WAITING
        }
        isOpen={showVoteModal || showExecuteModal}
        onClose={
          showExecuteModal ? handleCloseExecuteModal : handleCloseVoteModal
        }
        callback={handleVoteExecution}
        closeOnDrag={
          showExecuteModal
            ? executeProcessState !== TransactionState.LOADING
            : voteProcessState !== TransactionState.LOADING
        }
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
        gasEstimationError={gasEstimationError}
        disabledCallback={shouldDisableCallback}
      />
    </ProposalTransactionContext.Provider>
  );
};

function useProposalTransactionContext(): ProposalTransactionContextType {
  const context = useContext(ProposalTransactionContext);

  if (context === null) {
    throw new Error(
      'useProposalTransactionContext() can only be used on the descendants of <UseProposalTransactionProvider />'
    );
  }
  return context;
}

export {ProposalTransactionProvider, useProposalTransactionContext};
