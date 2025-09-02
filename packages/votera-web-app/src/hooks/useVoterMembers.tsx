import {useNetwork} from '../context/network';
import {useSpecificProvider} from '../context/providers';
import {useEffect, useState} from 'react';
import {CHAIN_METADATA} from '../utils/constants';

import {HookData} from '../utils/types';
import {useWallet} from './useWallet';
import {useClient} from './useClient';
import {Client, VoteBallotData, SortType} from 'votera-sdk-client';

export type VoterMembers = {
  length: number;
  members: VoteBallotData[];
};

export type FetchEvaluatorResponse = {
  totalLength: number;
  responseData: VoteBallotData[];
};

async function fetchVoterMembers(
  client: Client | undefined,
  proposalId: string,
  pageIndex: number = 1,
  pageSize: number = 10
): Promise<FetchEvaluatorResponse> {
  if (client && proposalId !== '') {
    const length = await client.methods.getVoterLength(proposalId);
    const startIndex = (pageIndex - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    if (startIndex < length) {
      return {
        totalLength: length,
        responseData: await client.methods.getBallotOfAllMembersList(
          proposalId,
          startIndex,
          endIndex,
          SortType.ASC
        ),
      };
    } else {
      return {
        totalLength: length,
        responseData: [],
      };
    }
  } else
    return {
      totalLength: 0,
      responseData: [],
    };
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list. NOTE: the
 * totalMembers included in the response is the total number of members in the
 * DAO, and not the number of members returned when filtering by search term.
 *
 * @param proposalId
 * @param pageIndex
 * @param pageSize
 */
export const useVoterMembers = (
  proposalId: string,
  pageIndex: number = 1,
  pageSize: number = 10
): HookData<VoterMembers> => {
  const [data, setData] = useState<VoteBallotData[]>([]);
  const [totalLength, setTotalLength] = useState<number>(0);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {client} = useClient();
  const {address} = useWallet();

  useEffect(() => {
    async function fetchMembers() {
      try {
        if (client) {
          setIsLoading(true);
          const response = await fetchVoterMembers(
            client,
            proposalId,
            pageIndex,
            pageSize
          );
          if (!response) {
            setTotalLength(0);
            setData([]);
            return;
          }
          setTotalLength(response.totalLength);
          setData(response.responseData);
          setIsLoading(false);
          setError(undefined);
        } else {
          setData([]);
          return;
        }
      } catch (err) {
        console.log(err);
        setError(err as Error);
      }
    }

    fetchMembers();
  }, [address, client, network, provider]);

  return {
    data: {
      length: totalLength,
      members: data,
    },
    isLoading,
    error,
  };
};
