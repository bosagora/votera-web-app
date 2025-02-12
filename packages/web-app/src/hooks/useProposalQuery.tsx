import {useCallback, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {SupportedNetworks} from 'utils/constants';
import {Client, IProposalData, SortType} from 'votera-sdk-client';
import {useClient2} from './useClient2';
import {useQuery} from '@tanstack/react-query';

async function fetchProposals(
  client: Client | undefined
): Promise<Array<IProposalData> | null> {
  if (!client) return Promise.reject(new Error('client must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  console.log('fetching proposals list > ');
  try {
    return await client.methods.getProposalList(0, 12, SortType.DSC);
  } catch (e) {
    return Promise.reject(new Error('getWalletDetail failed'));
  }
}

async function fetchProposal(
  client: Client | undefined,
  proposalId: string
): Promise<IProposalData | null> {
  console.log('client 4444 :', client?.web3.getProvider()?.network.name);
  if (!client) return Promise.reject(new Error('client must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));
  console.log('fetching proposal single > ', proposalId);

  try {
    return await client.methods.getProposal(proposalId);
  } catch (e) {
    return Promise.reject(new Error('getProposal failed'));
  }
}

export const useProposalWithUseQuery = (
  proposalId?: string,
  refetchInterval = 0
) => {
  const {network, networkUrlSegment} = useNetwork();
  const {client, network: clientNetwork} = useClient2();
  const queryNetwork = useMemo(
    () => networkUrlSegment ?? network,
    [network, networkUrlSegment]
  );
  console.log('useProposalWithUseQuery id', proposalId);
  const enabled = !!client && clientNetwork === queryNetwork;

  console.log('useProposalWithUseQuery enabled', enabled);
  const queryFn = useCallback(() => {
    return proposalId
      ? fetchProposal(client, proposalId)
      : fetchProposals(client);
  }, [client, proposalId]);

  return useQuery<IProposalData | Array<IProposalData> | null>({
    queryKey: proposalId
      ? ['proposal', queryNetwork, proposalId]
      : ['proposals', queryNetwork],
    queryFn,
    enabled,
    refetchOnWindowFocus: false,
    refetchInterval,
  });
};

export const useProposalsQuery = () => {
  const navigate = useNavigate();
  const apiResponse = useProposalWithUseQuery();

  useEffect(() => {
    if (apiResponse.isFetched) {
      if (apiResponse.error || apiResponse.data === null) {
        navigate(NotFound, {
          replace: true,
          state: {incorrectDao: 'test'},
        });
      }
    }
  }, [apiResponse.data, apiResponse.error, apiResponse.isFetched, navigate]);
  return apiResponse;
};

export const useProposalQuery = (proposalId?: string) => {
  const navigate = useNavigate();
  const apiResponse = useProposalWithUseQuery(proposalId);

  useEffect(() => {
    if (apiResponse.isFetched) {
      console.log('useProposalQuery isFetched', apiResponse.isFetched);
      if (apiResponse.error || apiResponse.data === null) {
        navigate(NotFound, {
          replace: true,
          state: {incorrectProposal: proposalId},
        });
      }
    }
  }, [
    apiResponse.data,
    apiResponse.error,
    apiResponse.isFetched,
    navigate,
    proposalId,
  ]);

  return apiResponse;
};
