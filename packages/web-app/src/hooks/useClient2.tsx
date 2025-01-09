import {
  LIVE_CONTRACTS,
  SupportedNetworksArray,
  Client,
  Context as SdkContext,
  ContextParams,
} from 'votera-sdk-client';

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

const UseClient2Context = createContext<ClientContext>({} as ClientContext);

export const useClient2 = () => {
  const client = useContext(UseClient2Context);
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

export const UseClient2Provider: React.FC = ({children}) => {
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
      network: translatedNetwork,
      signer: signer ?? undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      AddressStorage: LIVE_CONTRACTS[translatedNetwork].AddressStorage,
      BudgetManager: LIVE_CONTRACTS[translatedNetwork].BudgetManager,
      ParamStorage: LIVE_CONTRACTS[translatedNetwork].ParamStorage,
      ParticipantStorage: LIVE_CONTRACTS[translatedNetwork].ParticipantStorage,
      ProposalStorage: LIVE_CONTRACTS[translatedNetwork].ProposalStorage,
      AssessmentStorage: LIVE_CONTRACTS[translatedNetwork].AssessmentStorage,
      VoteStorage: LIVE_CONTRACTS[translatedNetwork].VoteStorage,
      ReceptionController: LIVE_CONTRACTS[translatedNetwork].ReceptionController,
      AssessmentController: LIVE_CONTRACTS[translatedNetwork].AssessmentController,
      VoteController: LIVE_CONTRACTS[translatedNetwork].VoteController,
      ParticipantManager: LIVE_CONTRACTS[translatedNetwork].ParticipantManager,
      ExecutionManager: LIVE_CONTRACTS[translatedNetwork].ExecutionManager
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
    <UseClient2Context.Provider value={value}>
      {children}
    </UseClient2Context.Provider>
  );
};
