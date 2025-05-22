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

export const UseClientProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const {network} = useNetwork();
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    if (!network || !signer) return;

    const translatedNetwork = translateToNetworkishName(network);
    if (translatedNetwork === 'unsupported') return;

    const contracts = LIVE_CONTRACTS[translatedNetwork];

    console.log('contracts :', contracts);

    const contextParams: ContextParams = {
      network: translatedNetwork,
      signer,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      AddressStorage: contracts.AddressStorage,
      BudgetManager: contracts.BudgetManager,
      ParamStorage: contracts.ParamStorage,
      ParticipantStorage: contracts.ParticipantStorage,
      ProposalStorage: contracts.ProposalStorage,
      AssessmentStorage: contracts.AssessmentStorage,
      VoteStorage: contracts.VoteStorage,
      ReceptionController: contracts.ReceptionController,
      AssessmentController: contracts.AssessmentController,
      VoteController: contracts.VoteController,
      ParticipantManager: contracts.ParticipantManager,
      ExecutionManager: contracts.ExecutionManager,
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
