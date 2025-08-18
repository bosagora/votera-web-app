// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {NavigationVoteraProposal} from 'context/apolloClient';
import {FAVORITE_VOTERA_PROPOSAL_KEY, SupportedChainID} from 'utils/constants';
import {sleepFor} from 'utils/library';

/**
 * Fetch a list of favorited DAOs
 * @param cache favorited DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of favorited DAOs based on given options
 */
export async function getFavoritedDaosFromCache(options: {
  skip: number;
  limit?: number;
}): Promise<NavigationVoteraProposal[]> {
  const {skip, limit} = options;

  const favoriteVoteraProposals = JSON.parse(
    localStorage.getItem(FAVORITE_VOTERA_PROPOSAL_KEY) || '[]'
  ) as NavigationVoteraProposal[];

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return favoriteVoteraProposals.slice(skip, limit ? skip + limit : undefined);
}

/**
 * Fetch a favorited DAO from the cache if available
 * @param proposalId the address of the favorited DAO to fetch
 * @param chain the chain of the favorited DAO to fetch
 * @returns a favorited DAO with the given address and chain or null
 * if not found
 */
export async function getFavoritedDaoFromCache(
  proposalId: string | undefined,
  chain: SupportedChainID
) {
  if (!proposalId)
    return Promise.reject(new Error('proposal ID must be defined'));

  if (!chain) return Promise.reject(new Error('chain must be defined'));

  const proposals = await getFavoritedDaosFromCache({skip: 0});
  return (
    proposals.find(
      proposal => proposal.address === proposalId && proposal.chain === chain
    ) ?? null
  );
}

/**
 * Favorite a DAO by adding it to the favorite DAOs cache
 * @param proposal Proposal being favorited
 * @returns an error if the dao to favorite is not provided
 */
export async function addFavoriteDaoToCache(
  proposal: NavigationVoteraProposal
) {
  if (!proposal)
    return Promise.reject(new Error('daoToFavorite must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = [proposal, ...cache];

  localStorage.setItem(FAVORITE_VOTERA_PROPOSAL_KEY, JSON.stringify(newCache));
}

/**
 * Removes a favorite DAO from the cache
 * @param proposal DAO to unfavorite
 * @returns an error if no DAO is provided
 */
export async function removeFavoriteDaoFromCache(
  proposal: NavigationVoteraProposal
) {
  if (!proposal) return Promise.reject(new Error('proposal must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = cache.filter(
    fd =>
      fd.proposalId.toLowerCase() !== proposal.proposalId.toLowerCase() ||
      fd.chain !== proposal.chain
  );

  localStorage.setItem(FAVORITE_VOTERA_PROPOSAL_KEY, JSON.stringify(newCache));
}

/**
 * Update a DAO in the cache
 * @param proposal updated DAO; note proposal.proposalId & proposal.chain should never be changed
 * @returns an error if no DAO is provided
 */
export async function updateFavoritedDaoInCache(
  proposal: NavigationVoteraProposal
) {
  if (!proposal) return Promise.reject(new Error('proposal must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const daoFound = cache.findIndex(
    d => d.proposalId === proposal.proposalId && d.chain === proposal.chain
  );

  if (daoFound !== -1) {
    const newCache = [...cache];
    newCache[daoFound] = {...proposal};

    localStorage.setItem(
      FAVORITE_VOTERA_PROPOSAL_KEY,
      JSON.stringify(newCache)
    );
  }
}
