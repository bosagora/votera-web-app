import {useEffect, useState} from 'react';
import {useClient} from './useClient';

/**
 * Check whether wallet is eligible to vote on proposal
 * @param pluginAddress plugin address
 * @param proposalId proposal id
 * @returns whether given wallet address is allowed to vote on proposal with given id
 */
export const useWalletCanVote = (
  pluginAddress: string,
  proposalId: string
): boolean => {
  const [canVote, setCanVote] = useState(false);
  const {client} = useClient();

  useEffect(() => {
    if (!client) return;

    const checkCanVote = async () => {
      try {
        const canVote = await client.methods.canVote(pluginAddress, proposalId).call();
        setCanVote(canVote);
      } catch (error) {
        console.error('Error checking if wallet can vote:', error);
        setCanVote(false);
      }
    };

    checkCanVote();
  }, [client, pluginAddress, proposalId]);

  return canVote;
};
