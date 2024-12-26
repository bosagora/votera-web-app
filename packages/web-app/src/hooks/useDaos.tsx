import {
  Client,
  ContractWalletInfo,
  SortDirection,
  QueryOption,
  WalletDetails,
} from 'multisig-wallet-sdk-client';
import {InfiniteData, useInfiniteQuery} from '@tanstack/react-query';

import {useClient} from './useClient';
import {useWallet} from './useWallet';

export const EXPLORE_FILTER = ['favorite', 'newest', 'popular'] as const;
export type ExploreFilter = typeof EXPLORE_FILTER[number];

export type AugmentedDaoListItem = WalletDetails;

const DEFAULT_QUERY_PARAMS = {
  direction: SortDirection.DESC,
  skip: 0,
  limit: 32,
};

/**
 * Fetch a list of DAOs
 * @param client SDK common client. Can be undefined if the client is not available.
 * @param address
 * @param options query parameters for fetching the DAOs
 * @returns list of DAOs based on given params
 */
async function fetchDaos(
  client: Client | undefined,
  address: string | null,
  options: QueryOption
) {
  if (address) {
    //console.log('fetchDaos > options:', options);
    return client
      ? await client.multiSigWalletFactory.getWallets(address, options)
      : Promise.reject(new Error('Client not defined'));
  } else return [];
}

/**
 * This hook returns a list of daos. The data returned for each dao contains
 * information about the dao such as metadata, plugins installed on the dao,
 * address, etc.
 *
 * The DAO criteria can be either popular or newest DAOs, or DAOs that a user has favorited.
 * @param options.limit The maximum number of DAOs to return. Fetches 4 DAOs by default.
 * @param options.direction sort direction
 * @returns A list of daos and their respective infos (metadata, plugins, etc.)
 */
export const useDaosInfiniteQuery = (
  address: string,
  enabled = true,
  {
    direction = DEFAULT_QUERY_PARAMS.direction,
    limit = DEFAULT_QUERY_PARAMS.limit,
  }: Partial<Pick<QueryOption, 'direction' | 'limit'>> = {}
) => {
  // const {address} = useWallet();
  const {client} = useClient();

  return useInfiniteQuery({
    queryKey: ['infiniteDaos'],
    queryFn: async ({pageParam = 0}) => {
      const skip = limit * pageParam;
      return fetchDaos(client, address, {skip, limit, direction});
    },
    getNextPageParam: (
      lastPage: WalletDetails[],
      allPages: WalletDetails[][]
    ) => (lastPage.length === limit ? allPages.length : undefined),
    select: (data: InfiniteData<WalletDetails[]>) =>
      toAugmentedDaoListItem(data),
    enabled,
    refetchOnWindowFocus: true,
  });
};

/**
 * Function that augments an array of `DaoListItem` by adding
 * the avatar IPFS CID and the chainID
 * @param data array of `DaoListItem`
 * @returns augmented DAO with avatar link and proper chain
 */
// TODO: ideally chain id comes from the SDK; remove when available
function toAugmentedDaoListItem(data: InfiniteData<WalletDetails[]>) {
  return {
    pageParams: data.pageParams,
    pages: data.pages.flatMap(page =>
      page.map(wallet => {
        return wallet as AugmentedDaoListItem;
      })
    ),
  };
}
