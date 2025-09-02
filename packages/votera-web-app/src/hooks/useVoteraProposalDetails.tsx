import {useQuery} from '@tanstack/react-query';
import {useCallback, useEffect, useMemo} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {NotFound} from 'utils/paths';
import {useClient} from './useClient';
import {SupportedNetworks} from 'utils/constants';
import {Client, ProposalData} from 'votera-sdk-client';

async function fetchProposalDetails(
  client: Client | undefined,
  proposalId: string | undefined
): Promise<ProposalData | null> {
  if (!proposalId)
    return Promise.reject(new Error('Proposal ID must be defined'));

  if (!client) return Promise.reject(new Error('client must be defined'));

  try {
    return await client.methods.getProposal(proposalId.toLowerCase());
  } catch (e) {
    return Promise.reject(new Error('getProposal failed'));
  }
}

/**
 * Custom hook to fetch ProposalData for a given Proposal ID using the current network and client.
 * @param proposalId - The Proposal ID to fetch details for.
 * @param refetchInterval
 * @returns An object with the status of the query and the Proposal Detail, if available.
 */
export const useProposalQuery = (
  proposalId: string | undefined,
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
  const enabled = !!proposalId && !!client && clientNetwork === queryNetwork;

  const queryFn = useCallback(() => {
    return fetchProposalDetails(client, proposalId);
  }, [client, proposalId]);

  return useQuery<ProposalData | null>({
    queryKey: ['voteraProposalDetails', proposalId, queryNetwork],
    queryFn,
    select: addAvatarToWallet(network),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval,
  });
};

export const useVoteraProposalDetailsQuery = () => {
  const {id} = useParams();
  const navigate = useNavigate();

  const proposalId = id?.toLowerCase();
  const apiResponse = useProposalQuery(proposalId);
  useEffect(() => {
    if (apiResponse.isFetched) {
      if (apiResponse.error || apiResponse.data === null) {
        navigate(NotFound, {
          replace: true,
          state: {incorrectVoteraProposal: proposalId},
        });
      }
    }
  }, [
    apiResponse.data,
    apiResponse.error,
    apiResponse.isFetched,
    proposalId,
    navigate,
  ]);
  return apiResponse;
};

const addAvatarToWallet =
  (network: SupportedNetworks) => (data: ProposalData | null) => {
    if (!data) return null;
    return {
      ...data,
    };
  };
