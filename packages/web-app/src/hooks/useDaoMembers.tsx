import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import {useEffect, useState} from 'react';
import {CHAIN_METADATA} from 'utils/constants';

import {HookData} from 'utils/types';
import {useWallet} from './useWallet';
import {useClient} from './useClient';
import {Client} from 'multisig-wallet-sdk-client';

export type MultisigMember = {
  address: string;
};
export type BalanceMember = MultisigMember & {
  balance: number;
};

export type DaoMembers = {
  members: MultisigMember[];
  filteredMembers: MultisigMember[];
};

async function fetchDaoMembers(
  client: Client | undefined,
  address: string | null,
  daoAddressOrEns: string
) {
  if (client && address) {
    client.multiSigWallet.attach(daoAddressOrEns);
    const isOwner = await client.multiSigWallet.isOwner(address);
    //console.log('isOwner :', isOwner);
    return client
      ? await client.multiSigWallet.getMembers()
      : Promise.reject(new Error('Client not defined'));
  } else return [];
}

/**
 * Hook to fetch DAO members. Fetches token if DAO is token based, and allows
 * for a search term to be passed in to filter the members list. NOTE: the
 * totalMembers included in the response is the total number of members in the
 * DAO, and not the number of members returned when filtering by search term.
 *
 * @param pluginAddress plugin from which members will be retrieved
 * @param pluginType plugin type
 * @param searchTerm Optional member search term  (e.g. '0x...')
 * @returns A list of DAO members, the total number of members in the DAO and
 * the DAO token (if token-based)
 */
export const useDaoMembers = (
  daoAddressOrEns: string,
  searchTerm?: string
): HookData<DaoMembers> => {
  const [data, setData] = useState<MultisigMember[]>([]);
  const [rawMembers, setRawMembers] = useState<MultisigMember[] | string[]>();
  const [filteredData, setFilteredData] = useState<MultisigMember[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  const pluginType = 'multisig.plugin.dao.eth';
  const {client} = useClient();

  const {address} = useWallet();

  // Fetch the list of members for a this DAO.
  useEffect(() => {
    // console.log(
    //   'useDaoMembers > useEffect > daoAddressOrEns:',
    //   daoAddressOrEns
    // );
    async function fetchMembers() {
      try {

        if (pluginType === 'multisig.plugin.dao.eth' || network === 'goerli') {
          setIsLoading(true);

          const response = await fetchDaoMembers(
            client,
            address,
            daoAddressOrEns
          );
          //console.log('response :', response);

          if (!response) {
            setData([]);
            return;
          }

          setRawMembers(response);
        } else {
          setData([] as MultisigMember[]);
        }
        setIsLoading(false);
        setError(undefined);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      }
    }

    fetchMembers();
  }, [address, client, daoAddressOrEns, network, pluginType, provider]);

  // map the members to the desired structure
  // Doing this separately to get rid of duplicate calls
  // when raw members present, but no token details yet
  useEffect(() => {
    async function mapMembers() {
      if (!rawMembers) return;

      let members;
      members = rawMembers.map(m => ({address: m} as MultisigMember));

      members.sort(sortMembers);
      setData(members);
    }

    mapMembers();
  }, [network, provider, rawMembers]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData([]);
    } else {
      setFilteredData(
        (data as MultisigMember[]).filter(d =>
          d.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [data, daoAddressOrEns, searchTerm]);
  //
  return {
    data: {
      members: data,
      filteredMembers: filteredData,
    },
    isLoading,
    error,
  };
};

function sortMembers<T extends MultisigMember>(a: T, b: T) {
  if (a.address === (b as MultisigMember).address) return 0;
  return a.address > (b as MultisigMember).address ? 1 : -1;
}
