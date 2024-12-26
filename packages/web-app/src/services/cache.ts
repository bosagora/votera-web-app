// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {NavigationDao} from 'context/apolloClient';
import {
  FAVORITE_DAOS_KEY,
  PENDING_DAOS_KEY,
  SupportedChainID,
  SupportedNetworks,
  VERIFIED_CONTRACTS_KEY,
} from 'utils/constants';
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
}): Promise<NavigationDao[]> {
  const {skip, limit} = options;

  const favoriteDaos = JSON.parse(
    localStorage.getItem(FAVORITE_DAOS_KEY) || '[]'
  ) as NavigationDao[];

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return favoriteDaos.slice(skip, limit ? skip + limit : undefined);
}

/**
 * Fetch a favorited DAO from the cache if available
 * @param daoAddress the address of the favorited DAO to fetch
 * @param chain the chain of the favorited DAO to fetch
 * @returns a favorited DAO with the given address and chain or null
 * if not found
 */
export async function getFavoritedDaoFromCache(
  daoAddress: string | undefined,
  chain: SupportedChainID
) {
  if (!daoAddress)
    return Promise.reject(new Error('daoAddressOrEns must be defined'));

  if (!chain) return Promise.reject(new Error('chain must be defined'));

  const daos = await getFavoritedDaosFromCache({skip: 0});
  return (
    daos.find(dao => dao.address === daoAddress && dao.chain === chain) ?? null
  );
}

/**
 * Favorite a DAO by adding it to the favorite DAOs cache
 * @param dao DAO being favorited
 * @returns an error if the dao to favorite is not provided
 */
export async function addFavoriteDaoToCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('daoToFavorite must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = [dao, ...cache];

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Removes a favorite DAO from the cache
 * @param dao DAO to unfavorite
 * @returns an error if no DAO is provided
 */
export async function removeFavoriteDaoFromCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const newCache = cache.filter(
    fd =>
      fd.address.toLowerCase() !== dao.address.toLowerCase() ||
      fd.chain !== dao.chain
  );

  localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
}

/**
 * Update a DAO in the cache
 * @param dao updated DAO; note dao.address & dao.chain should never be changed
 * @returns an error if no DAO is provided
 */
export async function updateFavoritedDaoInCache(dao: NavigationDao) {
  if (!dao) return Promise.reject(new Error('dao must be defined'));

  const cache = await getFavoritedDaosFromCache({skip: 0});
  const daoFound = cache.findIndex(
    d => d.address === dao.address && d.chain === dao.chain
  );

  if (daoFound !== -1) {
    const newCache = [...cache];
    newCache[daoFound] = {...dao};

    localStorage.setItem(FAVORITE_DAOS_KEY, JSON.stringify(newCache));
  }
}
