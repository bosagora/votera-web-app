import {useCallback, useEffect, useMemo, useState} from 'react';
import {CHAIN_METADATA} from 'utils/constants';

import {HookData} from 'utils/types';
import {fetchBalance, getTokenInfo, isNativeToken} from 'utils/tokens';
import {useSpecificProvider} from 'context/providers';
import {useNetwork} from 'context/network';
import {TokenType} from '../utils/aragon/sdk-client-common-types';
import {AssetBalance} from '../utils/aragon/sdk-client-types';
import loadedTokensMeta from '../../data/tokens.json';

export const useLoadTokenLogoURL = (): {getImgUrl: any; tokenList: any} => {
  const [tokenList, setTokenList] = useState({});
  useEffect(() => {
    // async function loadTokens() {
    //   // const loadedTokensMeta = await fetch('/data/tokens.json') // 파일 경로를 지정합니다.
    //   const loadedTokensMeta = await fetch(
    //     'https://raw.githubusercontent.com/bosagora/multisig-wallet-app/v0.x.x/packages/web-app/data/tokens.json'
    //   ) // 파일 경로를 지정합니다.
    //     .then(response => {
    //       if (!response.ok) {
    //         throw new Error(
    //           'Network response was not ok ' + response.statusText
    //         );
    //       }
    //       return response.json();
    //     });
    //   setTokenList(loadedTokensMeta);
    // }
    // loadTokens();

    setTokenList(loadedTokensMeta);
  }, []);

  const getImgUrl = useCallback(
    (symbol: string, chainId: number) => {
      if (!tokenList) return '';

      const matched = tokenList.tokens.filter(
        (t: {symbol: string; chainId: number}) =>
          t.symbol === symbol && t.chainId === chainId
      );
      return matched ? matched[0].logoURI : '';
    },
    [tokenList]
  );
  return {getImgUrl, tokenList};
};

export const useDaoBalances = (
  daoAddress: string
): HookData<Array<AssetBalance> | undefined> => {
  const {network} = useNetwork();
  const [data, setData] = useState<Array<AssetBalance>>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {tokenList} = useLoadTokenLogoURL();

  // Use the useEffect hook to fetch DAO balances
  useEffect(() => {
    async function getBalances() {
      try {
        setIsLoading(true);

        const loadedTokens = tokenList
          ? tokenList.tokens
              ?.filter(t => t.chainId === CHAIN_METADATA[network].id)
              .filter((t: {address: string}) => !isNativeToken(t.address))
              .map((t: {address: any}) => t.address)
          : [];

        const tokenStorage = localStorage.getItem('LOCAL_TOKENS');
        const nonZeroBalancesBefore =
          tokenStorage && tokenStorage[provider.network.chainId]
            ? JSON.parse(tokenStorage[provider.network.chainId])
            : [];
        const nonZeroBalances = [
          ...new Set(nonZeroBalancesBefore.concat(loadedTokens)),
        ];

        const nativeCurrency = CHAIN_METADATA[network].nativeCurrency;
        let nativeTokenBalances = [] as Array<AssetBalance>;

        const fetchNativeCurrencyBalance = provider.getBalance(daoAddress);

        // Define a list of promises to fetch ERC20 token balances
        const tokenListPromises = !nonZeroBalances
          ? []
          : nonZeroBalances.map(async (contractAddress: string) => {
              const {decimals, name, symbol} = await getTokenInfo(
                contractAddress,
                provider,
                CHAIN_METADATA[network].nativeCurrency
              );
              const tokenBalance = await fetchBalance(
                contractAddress,
                daoAddress,
                provider,
                nativeCurrency,
                false
              );
              return {
                address: contractAddress,
                name,
                symbol,
                updateDate: new Date(),
                type: TokenType.ERC20,
                balance: BigInt(tokenBalance),
                decimals,
              };
            });

        // Wait for both native currency and ERC20 balances to be fetched
        const [nativeCurrencyBalance, erc20balances] = await Promise.all([
          fetchNativeCurrencyBalance,
          Promise.all(tokenListPromises),
        ]);

        if (!nativeCurrencyBalance.eq(0)) {
          nativeTokenBalances = [
            {
              id: '',
              type: TokenType.NATIVE,
              ...CHAIN_METADATA[network].nativeCurrency,
              updateDate: new Date(),
              balance: BigInt(nativeCurrencyBalance.toString()),
            },
          ];
        }
        const erc20balancesWith = erc20balances?.filter(token => {
          return token.balance !== BigInt(0);
        });
        if (erc20balances)
          setData([...nativeTokenBalances, ...erc20balancesWith]);
      } catch (error) {
        // console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    if (daoAddress) getBalances();
  }, [daoAddress, network, provider, tokenList]);

  return {data, error, isLoading};
};
