import {constants} from 'ethers';
import {useEffect, useState} from 'react';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {HookData, TokenWithMetadata} from 'utils/types';
import {useLoadTokenLogoURL} from './useVoteraBalances';

import {AssetBalance, TokenType} from 'utils/votera/sdk-client-types';

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
          balance:
            asset.type !== TokenType.ERC721
              ? (asset as {balance: bigint}).balance
              : BigInt(0),
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
            apiId: index.toString(),
            imgUrl:
              getImgUrl(
                (asset as {symbol: string}).symbol,
                CHAIN_METADATA[network].id
              ) || '',
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
