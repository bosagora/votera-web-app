import {
  LIVE_CONTRACTS,
  Client,
  Context as SdkContext,
  ContextParams,
} from 'votera-sdk-client';

import {useNetwork} from 'context/network';
import React, {createContext, useContext, useEffect, useState} from 'react';

import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {translateToAppNetwork, translateToNetworkishName} from 'utils/library';
import {useWallet} from './useWallet';
import { Signer } from 'ethers';

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
  const {signer, address} = useWallet();
  const [client, setClient] = useState<Client>();
  const [context, setContext] = useState<SdkContext>();
  const [resolvedSignerAddress, setResolvedSignerAddress] = useState<
    string | undefined
  >(undefined);

  // Keep an internal copy of the signer address; this eliminates races where
  // address has changed but signer still points to the previous account.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const current = signer ? await signer.getAddress() : undefined;
        if (!cancelled) setResolvedSignerAddress(current);
      } catch (_e) {
        if (!cancelled) setResolvedSignerAddress(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [signer]);

  useEffect(() => {
    if (!network) return;

    const translatedNetwork = translateToNetworkishName(network);
    if (translatedNetwork === 'unsupported') return;

    const contracts = LIVE_CONTRACTS[translatedNetwork];

    // If signer exists but its bound address is stale, rebind it to the
    // latest address using the same provider to avoid race conditions.
    let signerForContext : Signer | undefined = signer as Signer;
    if (
      signer &&
      resolvedSignerAddress &&
      address &&
      resolvedSignerAddress.toLowerCase() !== address.toLowerCase()
    ) {
      const provider: any = (signer as any).provider;
      if (provider?.getSigner) {
        signerForContext = provider.getSigner(address);
      } else {
        signerForContext = undefined;
      }
    }

    const contextParams: ContextParams = {
      network: translatedNetwork,
      signer: signerForContext,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      IssuedContract: contracts.IssuedContract,
      AddressStorage: contracts.AddressStorage,
      BudgetManager: contracts.BudgetManager,
      ParamStorage: contracts.ParamStorage,
      ParticipantStorage: contracts.ParticipantStorage,
      EvaluatorStorage: contracts.EvaluatorStorage,
      ProposalStorage: contracts.ProposalStorage,
      AssessmentStorage: contracts.AssessmentStorage,
      VoteStorage: contracts.VoteStorage,
      ReceptionController: contracts.ReceptionController,
      AssessmentController: contracts.AssessmentController,
      VoteController: contracts.VoteController,
      ParticipantManager: contracts.ParticipantManager,
      EvaluatorManager: contracts.EvaluatorManager,
      ExecutionManager: contracts.ExecutionManager,
    };

    const sdkContext = new SdkContext(contextParams);

    // signerForContext?.getAddress().then(signerAddress => {
    //   console.log(`UseClientProvider - address: ${address} - ${signerAddress}`);
    // });

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [network, signer, address, resolvedSignerAddress]);

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
