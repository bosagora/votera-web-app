import {useReactiveVar} from '@apollo/client';
import {useCallback, useEffect, useState} from 'react';

import {usePrivacyContext} from 'context/privacyContext';
import {CHAIN_METADATA, PENDING_MULTISIG_PROPOSALS_KEY} from 'utils/constants';
import {formatUnits} from 'utils/library';
import {DetailedProposal, HookData, ProposalId} from 'utils/types';
import {useDaoDetailsQuery} from './useDaoDetails';
import {useClient} from './useClient';
import {BigNumber, constants} from 'ethers';
import {PluginTypes, ProposalStatus} from '../utils/aragon/types';
import {
  ABIStorage,
  ISmartContractFunctionData,
} from 'multisig-wallet-sdk-client';
import {getTokenInfo} from '../utils/tokens';
import {useSpecificProvider} from '../context/providers';
import {useNetwork} from '../context/network';
import {pendingMultisigApprovalsVar} from '../context/apolloClient';

/**
 * Retrieve a single detailed proposal
 * @param daoAddress address used to create unique proposal id
 * @param proposalId id of proposal to retrieve
 * @param pluginType plugin type
 * @param pluginAddress plugin address
 * @returns a detailed proposal
 */
export const useDaoProposal = (
  daoAddress: string,
  proposalId: ProposalId | undefined,
  pluginType: PluginTypes,
  pluginAddress: string,
  intervalInMills?: number
): HookData<DetailedProposal | undefined> => {
  // TODO: please remove daoAddress when refactoring to react-query based query
  const [data, setData] = useState<DetailedProposal>();
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const [numberOfRuns, setNumberOfRuns] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer>();

  const {preferences} = usePrivacyContext();
  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {client} = useClient();
  const {data: daoDetails} = useDaoDetailsQuery();

  const cachedMultisigVotes = useReactiveVar(pendingMultisigApprovalsVar);

  const proposalGuid = proposalId?.makeGloballyUnique(pluginAddress);
  const isMultisigPlugin = pluginType === 'multisig.plugin.dao.eth';
  const isTokenBasedPlugin = pluginType === 'token-voting.plugin.dao.eth';

  // return cache keys and variables based on the type of plugin;
  const getCachedProposalData = useCallback(
    (proposalGuid: string) => {
      if (pluginType === 'multisig.plugin.dao.eth') {
        return {
          proposalCacheKey: PENDING_MULTISIG_PROPOSALS_KEY,
          votes: cachedMultisigVotes,
        };
      }
    },
    [cachedMultisigVotes, daoAddress, pluginType]
  );

  function displayFunctionData2(data: ISmartContractFunctionData): object {
    const contents: string[] = [];
    contents.push(`Interface: ${data.interfaceName}`);
    contents.push(`Function: ${data.fragment.name}`);
    contents.push('Parameter:');
    const tt = {};
    for (let idx = 0; idx < data.fragment.inputs.length; idx++) {
      tt[data.fragment.inputs[idx].name] = String(data.parameter[idx]);
    }

    return tt;
  }

  useEffect(() => {
    if ((intervalInMills || 0) > 0) {
      setNumberOfRuns(value => value + 1);

      const id = setInterval(() => {
        setNumberOfRuns(value => value + 1);
      }, intervalInMills);

      setIntervalId(id);
    } else {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    };
    // This effect only runs when intervalInMills will changed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalInMills]);

  useEffect(() => {
    const getDaoProposal = async (proposalGuid: string) => {
      const cacheData = getCachedProposalData(proposalGuid);

      try {
        // Do not show loader if page is already loaded
        if (numberOfRuns === 0) {
          setIsLoading(true);
        }
        const proposal = await client?.multiSigWallet.getTransaction(
          BigNumber.from(proposalId?.export())
        );

        if (proposal) {
          let ret;
          if (proposal.data !== '0x') {
            const res = ABIStorage.decodeFunctionData(proposal.data);
            if (res) {
              console.log(ABIStorage.displayFunctionData(res));
              ret = displayFunctionData2(res);
            }
          }
          const tokenAddress =
            proposal.data === '0x'
              ? constants.AddressZero
              : proposal.destination;
          const toAddress =
            proposal.data === '0x' ? proposal.destination : ret?.to;
          const amount =
            proposal.data === '0x'
              ? Number(formatUnits(proposal.value, 18))
              : Number(formatUnits(ret?.amount, 18));
          const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;
          const token = await getTokenInfo(
            tokenAddress || '',
            provider,
            nativeCurrency
          );

          const requiredCount = await client?.multiSigWallet.getRequired();
          setData({
            ...proposal,
            dao: {
              address: daoDetails?.address,
              name: daoDetails?.metadata.name,
            },
            settings: {minApprovals: requiredCount, onlyListed: true},
            token,
            tokenAddress,
            to: toAddress,
            amount,
            status: proposal.executed
              ? ProposalStatus.EXECUTED
              : ProposalStatus.ACTIVE,
          } as unknown as DetailedProposal);
        }
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    if (daoAddress && proposalGuid && (isMultisigPlugin || isTokenBasedPlugin))
      getDaoProposal(proposalGuid);
  }, [
    daoAddress,
    getCachedProposalData,
    pluginType,
    proposalGuid,
    pluginAddress,
    numberOfRuns,
    isMultisigPlugin,
    isTokenBasedPlugin,
    client?.multiSigWallet,
    proposalId,
    network,
    provider,
    daoDetails?.address,
    daoDetails?.metadata.name,
  ]);

  return {data, error, isLoading};
};
