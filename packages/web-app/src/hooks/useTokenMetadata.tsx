import {constants} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {HookData, TokenWithMetadata} from 'utils/types';
import {AssetBalance} from '../utils/aragon/sdk-client-types';
import {TokenType} from '../utils/aragon/sdk-client-common-types';
import {useLoadTokenLogoURL} from './useDaoBalances';

export const useTokenMetadata = (
  assets: AssetBalance[]
): HookData<TokenWithMetadata[]> => {
  const {network} = useNetwork();
  const [data, setData] = useState<TokenWithMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();
  const {getImgUrl} = useLoadTokenLogoURL();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);

        // map metadata to token balances
        const tokensWithMetadata = assets?.map((asset, index) => ({
          balance: asset.type !== TokenType.ERC721 ? asset.balance : BigInt(0),
          metadata: {
            ...(asset.type === TokenType.ERC20
              ? {
                  id: asset.address,
                  decimals: asset.decimals,
                  name: asset.name,
                  symbol: asset.symbol,
                }
              : {
                  id: constants.AddressZero,
                  decimals: CHAIN_METADATA[network].nativeCurrency.decimals,
                  name: CHAIN_METADATA[network].nativeCurrency.name,
                  symbol: CHAIN_METADATA[network].nativeCurrency.symbol,
                }),

            price: 1,
            apiId: index,
            imgUrl: getImgUrl(asset.symbol, CHAIN_METADATA[network].id) || '',
          },
        }));

        setData(tokensWithMetadata);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    if (assets) fetchMetadata();
  }, [assets, getImgUrl, network]);

  return {data, isLoading: loading, error};
};
