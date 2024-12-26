import {
  LIVE_CONTRACTS,
  SupportedNetworksArray,
  Client,
  Context as SdkContext,
  ContextParams,
} from 'multisig-wallet-sdk-client';

import {useNetwork} from 'context/network';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {translateToAppNetwork, translateToNetworkishName} from 'utils/library';
import {useWallet} from './useWallet';

interface ClientContext {
  client?: Client;
  context?: SdkContext;
  network?: SupportedNetworks;
}

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      'useClient() can only be used on the descendants of <UseClientProvider />'
    );
  }
  if (client.context) {
    client.network = translateToAppNetwork(client.context.network);
  }
  return client;
};

export const UseClientProvider: React.FC = ({children}) => {
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const {network} = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    const translatedNetwork = translateToNetworkishName(network);

    // when network not supported by the SDK, don't set network
    if (
      translatedNetwork === 'unsupported' ||
      !SupportedNetworksArray.includes(translatedNetwork)
    ) {
      return;
    }

    //console.log('signer :', signer);
    const contextParams: ContextParams = {
      walletFactoryAddress:
        LIVE_CONTRACTS[translatedNetwork].MultiSigWalletFactoryAddress,
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [network, signer]);

  const value: ClientContext = {
    client,
    context,
  };

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
