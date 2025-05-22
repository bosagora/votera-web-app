import {ProposalStatus} from 'utils/aragon/sdk-client-common-types';
import {useEffect, useState} from 'react';

import {recalculateStatus} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalListItem} from 'utils/types';
import {useVoteraProposalDetailsQuery} from './useVoteraProposalDetails';
import {PluginTypes} from 'utils/aragon/types';
import {useClient2} from './useClient2';
import {IProposalData, SortType} from 'votera-sdk-client';
import {useProposalsQuery} from './useProposalQuery';

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param daoAddress
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals2(
  limit = 3,
  skip = 0,
  sortType: SortType
): HookData<Array<IProposalData>> & {totalCount: number} {
  const [data, setData] = useState<Array<IProposalData>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<Error>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {data: daoDetails} = useProposalsQuery();

  const {client} = useClient2();

  useEffect(() => {
    async function getDaoProposals() {
      //console.log('getDaoProposals > daoAddress:', daoAddress);
      try {
        if (skip === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const txCount = (await client?.methods.getProposalLength()) || 0;
        setTotalCount(txCount);

        if (skip < txCount) {
          const from = txCount - limit - skip < 0 ? 0 : txCount - limit - skip;
          const to =
            from === 0
              ? txCount % limit === 0
                ? limit
                : txCount % limit
              : from + limit;

          // console.log('txCount : ', txCount);
          // console.log('skip : ', skip);
          // console.log('requiredCount : ', requiredCount);
          // console.log('from, to : ', from, to);
          const response = limit
            ? await client?.methods.getProposalList(from, to, SortType.ASC)
            : await client?.methods.getProposalList(0, txCount, SortType.ASC);

          // if (status && response) {
          //   response = (await response).filter(
          //     p => p.executed === (status === ProposalStatus.EXECUTED)
          //   );
          // }
          // const sortedResponse = response ? response.reverse() : response;
          // console.log('sortedResponse : ', sortedResponse);
          /**
           * NOTE: This needs to be removed once the SDK has taken cared
           * of prioritizing the active state over the successful one
           * when the end date has not yet been reached
           */
          const proposals = response?.map(proposal => {
            proposal = {
              ...proposal,
            } as unknown as IProposalData;

            return proposal;
          });
          setData(proposals || []);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
        setIsInitialLoading(false);
        setIsLoadingMore(false);
      }
    }

    if (client) {
      getDaoProposals();
    }
  }, [client, limit, skip, status]);

  return {data, totalCount, error, isLoading, isInitialLoading, isLoadingMore};
}
