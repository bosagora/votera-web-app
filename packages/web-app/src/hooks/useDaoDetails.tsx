import {Client, WalletDetails} from 'multisig-wallet-sdk-client';
import {useQuery} from '@tanstack/react-query';
import {useCallback, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {SupportedNetworks} from 'utils/constants';

async function fetchDaoDetails(
  client: Client | undefined,
  daoAddressOrEns: string | undefined
): Promise<WalletDetails | null> {
  if (!daoAddressOrEns)
    return Promise.reject(new Error('walletAddress must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  try {
    return await client.multiSigWalletFactory.getWalletDetail(
      daoAddressOrEns.toLowerCase()
    );
  } catch (e) {
    return Promise.reject(new Error('getWalletDetail failed'));
  }
}

/**
 * Custom hook to fetch DAO details for a given DAO address or ENS name using the current network and client.
 * @param daoAddressOrEns - The DAO address or ENS name to fetch details for.
 * @param refetchInterval
 * @returns An object with the status of the query and the DAO details, if available.
 */
export const useDaoQuery = (
  daoAddressOrEns: string | undefined,
  refetchInterval = 0
) => {
  const {network, networkUrlSegment} = useNetwork();
  const {client, network: clientNetwork} = useClient();
  // if network is unsupported this will be caught when compared to client
  const queryNetwork = useMemo(
    () => networkUrlSegment ?? network,
    [network, networkUrlSegment]
  );

  // make sure that the network and the url match up with client network before making the request
  const enabled =
    !!daoAddressOrEns && !!client && clientNetwork === queryNetwork;

  const queryFn = useCallback(() => {
    return fetchDaoDetails(client, daoAddressOrEns);
  }, [client, daoAddressOrEns]);

  return useQuery<WalletDetails | null>({
    queryKey: ['daoDetails', daoAddressOrEns, queryNetwork],
    queryFn,
    select: addAvatarToWallet(network),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval,
  });
};

export const useDaoDetailsQuery = () => {
  const {dao} = useParams();
  const navigate = useNavigate();

  const daoAddressOrEns = dao?.toLowerCase();
  const apiResponse = useDaoQuery(daoAddressOrEns);
  useEffect(() => {
    if (apiResponse.isFetched) {
      if (apiResponse.error || apiResponse.data === null) {
        navigate(NotFound, {
          replace: true,
          state: {incorrectDao: daoAddressOrEns},
        });
      }
    }
  }, [
    apiResponse.data,
    apiResponse.error,
    apiResponse.isFetched,
    daoAddressOrEns,
    navigate,
  ]);
  return apiResponse;
};

const addAvatarToWallet =
  (network: SupportedNetworks) => (wallet: WalletDetails | null) => {
    if (!wallet) return null;

    return {
      ...wallet,
      metadata: {
        ...wallet?.metadata,
        avatar: undefined,
      },
    };
  };
