// import {Erc20TokenDetails} from '@aragon/sdk-client';
import {ListItemAddress} from '@aragon/ui-components';
import {formatUnits, isAddress} from 'ethers/lib/utils';
import React, {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
// import {useSpecificProvider} from 'context/providers';
import {MultisigMember} from 'hooks/useDaoMembers';
import {CHAIN_METADATA} from 'utils/constants';
// import {getTokenInfo} from 'utils/tokens';

type MembersListProps = {
  members: Array<MultisigMember>;
};

export const MembersList: React.FC<MembersListProps> = ({members}) => {
  const {network} = useNetwork();
  // const [totalSupply, setTotalSupply] = useState<number>(0);
  //
  // const provider = useSpecificProvider(CHAIN_METADATA[network].id);

  // useEffect(() => {
  //   async function fetchTotalSupply() {
  //     if (token) {
  //       const {totalSupply: supply, decimals} = await getTokenInfo(
  //         token.address,
  //         provider,
  //         CHAIN_METADATA[network].nativeCurrency
  //       );
  //       setTotalSupply(Number(formatUnits(supply, decimals)));
  //     }
  //   }
  //   fetchTotalSupply();
  // }, [provider, token, network]);

  const itemClickHandler = (address: string) => {
    const baseUrl = CHAIN_METADATA[network].explorer;
    if (isAddress(address))
      window.open(baseUrl + '/address/' + address, '_blank');
    else window.open(baseUrl + '/enslookup-search?search=' + address, '_blank');
  };

  return (
    <>
      {members.map(member => {
        return (
          <ListItemAddress
            // won't allow key in the objects for whatever reason
            key={member.address}
            {...{
              label: member.address,
              src: member.address,
              onClick: () => itemClickHandler(member.address),
            }}
          />
        );
      })}
    </>
  );
};
