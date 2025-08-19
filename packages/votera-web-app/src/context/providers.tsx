import {
  InfuraProvider,
  JsonRpcProvider,
  Web3Provider,
} from '@ethersproject/providers';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  getSupportedNetworkByChainId,
  SupportedChainID,
  SupportedNetworks,
} from 'utils/constants';
import {Nullable} from 'utils/types';
import {useNetwork} from './network';
import {translateToNetworkishName} from 'utils/library';

/* CONTEXT PROVIDER ========================================================= */

type Providers = {
  infura: InfuraProvider | JsonRpcProvider;
  web3: Nullable<Web3Provider>;
};

const ProviderContext = createContext<Nullable<Providers>>(null);

type ProviderProviderProps = {
  children: React.ReactNode;
};

/**
 * Returns two blockchain providers.
 *
 * The infura provider is always available, regardless of whether a
 * wallet is connected.
 *
 * The web3 provider, however, is based on the connected and wallet and will
 * therefore be null if no wallet is connected.
 */
export function ProvidersProvider({children}: ProviderProviderProps) {
  const {provider} = useWallet();
  const {network} = useNetwork();

  const [infuraProvider, setInfuraProvider] = useState<Providers['infura']>(
    new JsonRpcProvider(CHAIN_METADATA['bosagora_mainnet'].rpc[0], {
      chainId: CHAIN_METADATA['bosagora_mainnet'].id,
      name: translateToNetworkishName('bosagora_mainnet'),
    })
  );

  useEffect(() => {
    setInfuraProvider(getInfuraProvider(network));
  }, [network]);

  return (
    <ProviderContext.Provider
      // TODO: remove casting once useSigner has updated its version of the ethers library
      value={{infura: infuraProvider, web3: (provider as Web3Provider) || null}}
    >
      {children}
    </ProviderContext.Provider>
  );
}

function getInfuraProvider(network: SupportedNetworks) {
  return new JsonRpcProvider(CHAIN_METADATA[network].rpc[0], {
    chainId: CHAIN_METADATA[network].id,
    name: translateToNetworkishName(network),
  });
}

/**
 * Returns provider based on the given chain id
 * @param chainId network chain is
 * @returns infura provider
 */
export function useSpecificProvider(
  chainId: SupportedChainID
): Providers['infura'] {
  const network = getSupportedNetworkByChainId(chainId) as SupportedNetworks;

  const [infuraProvider, setInfuraProvider] = useState(
    getInfuraProvider(network)
  );

  useEffect(() => {
    setInfuraProvider(getInfuraProvider(network));
  }, [chainId, network]);

  return infuraProvider;
}

/* CONTEXT CONSUMER ========================================================= */

export function useProviders(): NonNullable<Providers> {
  return useContext(ProviderContext) as Providers;
}
