import {ProposalStatus} from 'utils/aragon/sdk-client-common-types';
import {useEffect, useState} from 'react';

import {recalculateStatus} from 'utils/proposals';
import {DetailedProposal, HookData, ProposalListItem} from 'utils/types';
import {useDaoDetailsQuery} from './useDaoDetails';
import {PluginTypes} from 'utils/aragon/types';
import {useClient} from './useClient';

/**
 * Retrieves list of proposals from SDK
 * NOTE: rename to useDaoProposals once the other hook has been deprecated
 * @param daoAddress
 * @param type plugin type
 * @returns list of proposals on plugin
 */
export function useProposals(
  daoAddress: string,
  type: PluginTypes,
  limit = 3,
  skip = 0,
  status?: ProposalStatus
): HookData<Array<ProposalListItem>> & {totalCount: number} {
  const [data, setData] = useState<Array<ProposalListItem>>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<Error>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {data: daoDetails} = useDaoDetailsQuery();

  const {client} = useClient();
  client?.multiSigWallet.attach(daoAddress);

  const isMultisigPlugin = type === 'multisig.plugin.dao.eth';
  const isTokenBasedPlugin = type === 'token-voting.plugin.dao.eth';

  useEffect(() => {
    async function getDaoProposals() {
      //console.log('getDaoProposals > daoAddress:', daoAddress);
      try {
        if (skip === 0) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        const txCount =
          (await client?.multiSigWallet.getTransactionCount()) || 0;
        setTotalCount(txCount);

        if (skip < txCount) {
          const from = txCount - limit - skip < 0 ? 0 : txCount - limit - skip;
          const to =
            from === 0
              ? txCount % limit === 0
                ? limit
                : txCount % limit
              : from + limit;
          const requiredCount = await client?.multiSigWallet.getRequired();

          // console.log('txCount : ', txCount);
          // console.log('skip : ', skip);
          // console.log('requiredCount : ', requiredCount);
          // console.log('from, to : ', from, to);
          let response = limit
            ? await client?.multiSigWallet.getTransactionsInRange(from, to)
            : await client?.multiSigWallet.getTransactionsInRange(0, txCount);

          if (status && response) {
            response = (await response).filter(
              p => p.executed === (status === ProposalStatus.EXECUTED)
            );
          }
          const sortedResponse = response ? response.reverse() : response;
          // console.log('sortedResponse : ', sortedResponse);
          /**
           * NOTE: This needs to be removed once the SDK has taken cared
           * of prioritizing the active state over the successful one
           * when the end date has not yet been reached
           */
          const proposals = sortedResponse?.map(proposal => {
            proposal = {
              ...proposal,
              dao: {
                address: daoDetails?.address,
                name: daoDetails?.metadata.name,
              },
              settings: {minApprovals: requiredCount, onlyListed: true},
            } as unknown as DetailedProposal;

            return recalculateStatus(
              proposal as DetailedProposal
            ) as DetailedProposal;
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

    if (daoAddress && client) {
      getDaoProposals();
    }
  }, [
    client,
    daoAddress,
    isMultisigPlugin,
    isTokenBasedPlugin,
    limit,
    skip,
    status,
  ]);

  return {data, totalCount, error, isLoading, isInitialLoading, isLoadingMore};
}
