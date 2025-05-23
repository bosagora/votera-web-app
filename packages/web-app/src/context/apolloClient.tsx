import {InMemoryCache, makeVar} from '@apollo/client';
import {CachePersistor, LocalStorageWrapper} from 'apollo3-cache-persist';

import {
  FAVORITE_DAOS_KEY,
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  SupportedChainID,
} from 'utils/constants';
import {PRIVACY_KEY} from './privacyContext';
import {
  AssessmentResult,
  ExecutionStates,
  IProposalData,
  ISystemProposalParam,
  ProposalPeriod,
  ProposalStates,
  ProposalType,
  SystemProposalType,
  VoteResult,
} from 'votera-sdk-client';
import {customJSONReviver} from '../utils/library';
import {DetailedProposal} from '../utils/types';
import {BigNumber} from '@ethersproject/bignumber';
import {VoteraProposalData} from '../utils/votera/sdk-client-types';

const cache = new InMemoryCache();

// add the REST API's typename you want to persist here
const entitiesToPersist = ['tokenData'];

// check if cache should be persisted or restored based on user preferences
const value = localStorage.getItem(PRIVACY_KEY);
if (value && JSON.parse(value).functional) {
  const persistor = new CachePersistor({
    cache,
    // TODO: Check and update the size needed for the cache
    maxSize: 5242880, // 5 MiB
    storage: new LocalStorageWrapper(window.localStorage),
    debug: process.env.NODE_ENV === 'development',
    persistenceMapper: async (data: string) => {
      const parsed = JSON.parse(data);

      const mapped: Record<string, unknown> = {};
      const persistEntities: string[] = [];
      const rootQuery = parsed['ROOT_QUERY'];

      mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
        (obj: Record<string, unknown>, key: string) => {
          if (key === '__typename') return obj;

          const keyWithoutArgs = key.substring(0, key.indexOf('('));
          if (entitiesToPersist.includes(keyWithoutArgs)) {
            obj[key] = rootQuery[key];

            if (Array.isArray(rootQuery[key])) {
              const entities = rootQuery[key].map(
                (item: Record<string, unknown>) => item.__ref
              );
              persistEntities.push(...entities);
            } else {
              const entity = rootQuery[key].__ref;
              persistEntities.push(entity);
            }
          }

          return obj;
        },
        {__typename: 'Query'}
      );

      persistEntities.reduce((obj, key) => {
        obj[key] = parsed[key];
        return obj;
      }, mapped);

      return JSON.stringify(mapped);
    },
  });

  const restoreApolloCache = async () => {
    await persistor.restore();
  };

  restoreApolloCache();
}

/*************************************************
 *            FAVORITE & SELECTED DAOS           *
 *************************************************/
// including description, type, and chain in anticipation for
// showing these votera proposal on explorer page
export type NavigationVoteraProposal = Omit<
  VoteraProposalData,
  'creationDate' | 'metadata'
> & {
  proposalType: ProposalType;
  title: string;
  description: string;
  proposer: string;
  proposalId: string;
  address: string;
  chain: SupportedChainID;
};
const favoriteVoteraProposals = JSON.parse(
  localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
);
const favoriteVoteraProposalsVar = makeVar<Array<NavigationVoteraProposal>>(
  favoriteVoteraProposals
);

const selectedVoteraProposalVar = makeVar<NavigationVoteraProposal>({
  proposalType: ProposalType.FUND,
  title: '',
  description: '',
  proposer: '',
  proposalId: '',
  address: '',
  chain: 5,
});

export {favoriteVoteraProposalsVar, selectedVoteraProposalVar};

/*************************************************
 *                 PENDING PROPOSAL              *
 *************************************************/
// iffy about this structure
export type CachedProposal = Omit<
  DetailedProposal,
  'creationBlockNumber' | 'executionBlockNumber' | 'executionDate' | 'status'
> & {};

export type PendingMultisigApprovals = {
  /** key is: daoAddress_proposalId; value: wallet address */
  [key: string]: string;
};
const pendingMultisigApprovals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_VOTES_KEY) || '{}'
);

export const pendingMultisigApprovalsVar = makeVar<PendingMultisigApprovals>(
  pendingMultisigApprovals
);

/*************************************************
 *                PENDING EXECUTION              *
 *************************************************/
// Token-based
export type PendingTokenBasedExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingTokenBasedExecution = JSON.parse(
  localStorage.getItem(PENDING_EXECUTION_KEY) || '{}',
  customJSONReviver
);
const pendingTokenBasedExecutionVar = makeVar<PendingTokenBasedExecution>(
  pendingTokenBasedExecution
);

//================ Multisig
export type PendingMultisigExecution = {
  /** key is: daoAddress_proposalId */
  [key: string]: boolean;
};
const pendingMultisigExecution = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_EXECUTION_KEY) || '{}',
  customJSONReviver
);
export const pendingMultisigExecutionVar = makeVar<PendingMultisigExecution>(
  pendingMultisigExecution
);
//================ Multisig
type PendingMultisigProposals = {
  // key is dao address
  [key: string]: {
    // key is proposal id
    [key: string]: CachedProposal;
  };
};
export const pendingMultisigProposals = JSON.parse(
  localStorage.getItem(PENDING_MULTISIG_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
export const pendingMultisigProposalsVar = makeVar<PendingMultisigProposals>(
  pendingMultisigProposals
);
