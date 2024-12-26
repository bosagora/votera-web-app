import * as React from 'react';
import {WalletClient, useWalletClient} from 'wagmi';
import {providers} from 'ethers';

export function walletClientToSigner(walletClient: WalletClient) {
  const {account, chain, transport} = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}

/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useEthersSigner(chainId: number) {
  const {data: walletClient} = useWalletClient({chainId});
  return React.useMemo(
    () => (walletClient ? walletClientToSigner(walletClient) : undefined),
    [walletClient]
  );
}

export function walletClientToBOSagoraSigner(
  walletClient: WalletClient,
  chainId: number,
  chainName: string
) {
  const {account, transport} = walletClient;
  const network = {
    chainId: chainId,
    name: chainName,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
}
/** Hook to convert a viem Wallet Client to an ethers.js Signer. */
export function useBOSagoraSigner(chainId: number, chainName: string) {
  if (chainId === 2019) {
    chainName = 'bosagora_testnet';
  } else if (chainId === 2151) {
    chainName = 'bosagora_mainnet';
  } else if (chainId === 24600) {
    chainName = 'bosagora_devnet';
  } else if (chainId === 215110) {
    chainName = 'acc_sidechain_mainnet';
  } else if (chainId === 215115) {
    chainName = 'acc_sidechain_testnet';
  } else if (chainId === 24680) {
    chainName = 'acc_sidechain_devnet';
  }

  const {data: walletClient} = useWalletClient({chainId});
  return React.useMemo(
    () =>
      walletClient
        ? walletClientToBOSagoraSigner(walletClient, chainId, chainName)
        : undefined,
    [chainId, chainName, walletClient]
  );
}
