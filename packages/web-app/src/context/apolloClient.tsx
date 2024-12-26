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
import {WalletDetails} from 'multisig-wallet-sdk-client';
import {customJSONReviver} from '../utils/library';
import {DetailedProposal} from '../utils/types';
import {VotingMode} from '../utils/aragon/sdk-client-multisig-types';

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
// showing these daos on explorer page
export type NavigationDao = Omit<WalletDetails, 'creationDate' | 'metadata'> & {
  address: string;
  metadata: {
    name: string;
    description?: string;
  };
  creationDate?: Date;
  chain: SupportedChainID;
};
const favoriteDaos = JSON.parse(
  localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
);
const favoriteDaosVar = makeVar<Array<NavigationDao>>(favoriteDaos);

const selectedDaoVar = makeVar<NavigationDao>({
  address: '',
  metadata: {
    name: '',
  },
  chain: 5,
});

export {favoriteDaosVar, selectedDaoVar};

/*************************************************
 *                 PENDING PROPOSAL              *
 *************************************************/
// iffy about this structure
export type CachedProposal = Omit<
  DetailedProposal,
  'creationBlockNumber' | 'executionBlockNumber' | 'executionDate' | 'status'
> & {
  votingMode?: VotingMode;
  minApprovals?: number;
};

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
