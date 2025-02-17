import {useCallback, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {SupportedNetworks} from 'utils/constants';
import {Client, IProposalData, SortType} from 'votera-sdk-client';
import {useClient2} from './useClient2';
import {useQuery} from '@tanstack/react-query';

export const PROPOSALS_PER_PAGE = 9;

async function fetchProposals(
  client: Client | undefined,
  page: number
): Promise<Array<IProposalData> | null> {
  if (!client) return Promise.reject(new Error('client must be defined'));

  const startIndex = (page - 1) * PROPOSALS_PER_PAGE;
  const endIndex = startIndex + PROPOSALS_PER_PAGE;
  console.log(
    'fetching proposals list > page:',
    page,
    'startIndex:',
    startIndex,
    'endIndex:',
    endIndex
  );
  if (page === 0) {
    return [];
  }

  try {
    return await client.methods.getProposalList(
      startIndex,
      endIndex,
      SortType.DSC
    );
  } catch (e) {
    console.log('fetchProposals error', e);
    return Promise.reject(new Error('getProposalList failed'));
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
  page: number = 1,
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
      : fetchProposals(client, page);
  }, [client, proposalId, page]);

  return useQuery<IProposalData | Array<IProposalData> | null>({
    queryKey: proposalId
      ? ['proposal', queryNetwork, proposalId]
      : ['proposals', queryNetwork, page],
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
      console.log('apiResponse.error', apiResponse.error);
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

export const useProposalQuery = (proposalId?: string, page?: number) => {
  const navigate = useNavigate();
  const apiResponse = useProposalWithUseQuery(proposalId, page);

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
