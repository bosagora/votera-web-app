import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {NavigationVoteraProposal} from 'context/apolloClient';
import {useCallback} from 'react';
import {
  addFavoriteDaoToCache,
  getFavoritedDaoFromCache,
  getFavoritedDaosFromCache,
  removeFavoriteDaoFromCache,
  updateFavoritedDaoInCache,
} from 'services/cache';
import {
  CHAIN_METADATA,
  SupportedNetworks,
  getSupportedNetworkByChainId,
} from 'utils/constants';

import {QueryOption} from 'votera-sdk-client';

const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 4,
};

/**
 * This hook manages the pagination of cached DAOs.
 * @param enabled boolean value that indicates whether the query should be enabled or not
 * @param options.limit maximum number of DAOs to be fetched per page.
 * @returns an infinite query object that can be used to fetch and
 * display the cached DAOs.
 */
export const useFavoritedProposalsInfiniteQuery = (
  enabled = true,
  {limit = DEFAULT_QUERY_PARAMS.limit}: Partial<Pick<QueryOption, 'limit'>> = {}
) => {
  return useInfiniteQuery({
    queryKey: ['infiniteFavoritedVoteraProposals'],

    queryFn: useCallback(
      ({pageParam = 0}) =>
        getFavoritedDaosFromCache({
          skip: limit * pageParam,
          limit,
        }),
      [limit]
    ),

    getNextPageParam: (
      lastPage: NavigationVoteraProposal[],
      allPages: NavigationVoteraProposal[][]
    ) => (lastPage.length === limit ? allPages.length : undefined),

    select: augmentCachedProposals,
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Fetch a favorite DAO from the cache
 * @param proposalId address of the favorited DAO
 * @param network network of the favorited DAO
 * @returns favorited DAO with given address and network if available
 */
export const useFavoritedProposalQuery = (
  proposalId: string | undefined,
  network: SupportedNetworks
) => {
  const chain = CHAIN_METADATA[network].id;

  return useQuery({
    queryKey: ['FavoriteProposal', proposalId, network],
    queryFn: () => getFavoritedDaoFromCache(proposalId, chain),
    enabled: !!proposalId && !!network,
  });
};

/**
 * Update a favorite proposal in the cache
 */
export const useUpdateFavoritedProposalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {proposal: NavigationVoteraProposal}) =>
      updateFavoritedDaoInCache(variables.proposal),

    onSuccess: (_, variables) => {
      const network = getSupportedNetworkByChainId(variables.proposal.chain);

      queryClient.invalidateQueries(['favoritedVoteraProposals']);
      queryClient.invalidateQueries(['infiniteFavoritedVoteraProposals']);
      queryClient.invalidateQueries([
        'favoritedDao',
        variables.proposal.address,
        network,
      ]);
    },
  });
};

/**
 * Add a favorited Proposal to the cache
 * @param onSuccess callback to run once DAO has been added to the cache
 */
export const useAddFavoritedDaoMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {proposal: NavigationVoteraProposal}) =>
      addFavoriteDaoToCache(variables.proposal),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries(['favoritedVoteraProposals']);
      queryClient.invalidateQueries(['infiniteFavoritedVoteraProposals']);
    },
  });
};

/**
 * Remove a favorited DAO from the cache
 * @param onSuccess callback to run once favorited DAO has been removed successfully
 */
export const useRemoveFavoriteDaoMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: {proposal: NavigationVoteraProposal}) =>
      removeFavoriteDaoFromCache(variables.proposal),

    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries(['favoriteVoteraProposals']);
      queryClient.invalidateQueries(['infinitefavoriteVoteraProposals']);
    },
  });
};

/**
 * Augment Proposals by resolving the IPFS CID for each DAO's avatar.
 * @param data raw fetched data for the cached DAOs.
 * @returns list of DAOs augmented with the resolved IPFS CID avatars
 */
function augmentCachedProposals(
  data: InfiniteData<NavigationVoteraProposal[]>
) {
  return {
    pageParams: data.pageParams,
    pages: data.pages.flatMap(page => addAvatarToWallet(page)),
  };
}

/**
 * Add resolved IPFS CID for each Proposal's avatar to the metadata.
 * @param proposals array of `NavigationVoteraProposal` objects representing the Proposals to be processed.
 * @returns array of augmented NavigationVoteraProposal objects with resolved avatar IPFS CIDs.
 */
function addAvatarToWallet<T extends NavigationVoteraProposal>(
  proposals: T[]
): T[] {
  return proposals.map(proposal => {
    return {
      ...proposal,
    } as T;
  });
}
