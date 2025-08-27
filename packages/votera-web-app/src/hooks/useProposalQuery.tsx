import {useCallback, useEffect, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {Client, ProposalData, SortType} from 'votera-sdk-client';
import {useQuery} from '@tanstack/react-query';

export const PROPOSALS_PER_PAGE = 9;

async function fetchProposals(
  client: Client | undefined,
  page: number
): Promise<Array<ProposalData> | null> {
  if (!client) return Promise.reject(new Error('client must be defined'));

  const startIndex = (page - 1) * PROPOSALS_PER_PAGE;
  const endIndex = startIndex + PROPOSALS_PER_PAGE;
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
    // console.log('fetchProposals error', e);
    return Promise.reject(new Error('getProposalList failed'));
  }
}

async function fetchProposal(
  client: Client | undefined,
  proposalId: string
): Promise<ProposalData | null> {
  if (!client) return Promise.reject(new Error('client must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  try {
    return await client.methods.getProposal(proposalId);
  } catch (e) {
    return Promise.reject(new Error('getProposal failed'));
  }
}

export const useProposalWithUseQuery = (
  proposalId?: string,
  page = 1,
  refetchInterval = 0
) => {
  const {network, networkUrlSegment} = useNetwork();
  const {client, network: clientNetwork} = useClient();
  const queryNetwork = useMemo(
    () => networkUrlSegment ?? network,
    [network, networkUrlSegment]
  );
  const enabled = !!client && clientNetwork === queryNetwork;

  const queryFn = useCallback(() => {
    return proposalId
      ? fetchProposal(client, proposalId)
      : fetchProposals(client, page);
  }, [client, proposalId, page]);

  return useQuery<ProposalData | Array<ProposalData> | null>({
    queryKey: proposalId
      ? ['proposal', queryNetwork, proposalId]
      : ['proposals', queryNetwork, page],
    queryFn,
    enabled,
    refetchOnWindowFocus: false,
    refetchInterval,
  });
};

export const useProposalQuery = (proposalId?: string, page?: number) => {
  const navigate = useNavigate();
  const apiResponse = useProposalWithUseQuery(proposalId, page);

  useEffect(() => {
    if (apiResponse.isFetched) {
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
