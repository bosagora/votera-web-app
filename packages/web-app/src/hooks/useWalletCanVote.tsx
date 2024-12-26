import {useEffect, useState} from 'react';
// import {
//   MultisigClient,
//   TokenVotingClient,
//   VoteValues,
// } from '@aragon/sdk-client';

import {HookData, ProposalId} from 'utils/types';
// import {PluginTypes, usePluginClient} from './usePluginClient';
import {stripPlgnAdrFromProposalId} from '../utils/proposals';
import {MultisigMember} from './useDaoMembers';

/**
 * Check whether wallet is eligible to vote on proposal
 * @param address wallet address
 * @returns whether given wallet address is allowed to vote on proposal with given id
 */
export const useWalletCanVote = (
  address: string | null,
  members: MultisigMember[],
  approval: string[] | undefined,
  executed: boolean | undefined
): HookData<boolean> => {
  const [data, setData] = useState([false, false, false] as
    | boolean[]
    | boolean);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  // const isMultisigClient = pluginType === 'multisig.plugin.dao.eth';
  // const isTokenVotingClient = pluginType === 'token-voting.plugin.dao.eth';
  //
  // const client = usePluginClient(pluginType);

  useEffect(() => {
    async function fetchCanVote() {
      if (!address || !approval || executed) {
        setData(false);
        return;
      }

      try {
        setIsLoading(true);
        let canVote;

        // if (isMultisigClient) {
        //   canVote = [
        //     await (client as MultisigClient)?.methods.canApprove({
        //       proposalId: proposalId.export(),
        //       approverAddressOrEns: address,
        //     }),
        //   ];
        // } else if (isTokenVotingClient) {
        //   const canVoteValuesPromises = [
        //     VoteValues.ABSTAIN,
        //     VoteValues.NO,
        //     VoteValues.YES,
        //   ].map(vote => {
        //     return (client as TokenVotingClient)?.methods.canVote({
        //       voterAddressOrEns: address,
        //       proposalId: proposalId.export(),
        //       vote,
        //     });
        //   });
        //   canVote = await Promise.all(canVoteValuesPromises);
        // }

        const approved =
          approval &&
          approval.some(
            a =>
              // remove the call to strip plugin address when sdk returns proper plugin address
              stripPlgnAdrFromProposalId(a).toLowerCase() ===
              address.toLowerCase()
          );
        const isMember =
          members &&
          members.some(
            a =>
              // remove the call to strip plugin address when sdk returns proper plugin address
              stripPlgnAdrFromProposalId(a.address).toLowerCase() ===
              address.toLowerCase()
          );

        // console.log('approval :', approval);
        // console.log('members :', members);
        // console.log('isMember :', isMember);
        // console.log('approved :', approved);

        if (isMember && !approved) {
          setData(true);
        } else setData(false);

        // if (canVote !== undefined) setData(canVote);
        // else setData([false, false, false]);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCanVote();
  }, [address, approval, members, executed]);

  return {
    data: Array.isArray(data) ? data.some(v => v) : data,
    error,
    isLoading,
  };
};
