import {useMemo, useEffect} from 'react';
import {JsonRpcSigner, Web3Provider} from '@ethersproject/providers';
import {useAccount, useDisconnect, useBalance, useNetwork as useWagmiNetwork, useConnect} from 'wagmi';

import {useWeb3Modal} from '@web3modal/react';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {useBOSagoraSigner, useEthersSigner} from './useEthersSigner';
import {BigNumber} from 'ethers';

export interface IUseWallet {
  connectorName: string;
  balance: BigNumber | null;
  isConnected: boolean;
  isModalOpen: boolean;
  /**
   * Returns true iff the wallet is connected and it is on the wrong network
   * (i.e., the chainId returned by the useSigner context does not agree with
   * the network name returned by the useNetwork context).
   */
  isOnWrongNetwork: boolean;
  network: string;
  provider: Web3Provider | null;
  signer: JsonRpcSigner | null;
  status: 'connecting' | 'reconnecting' | 'connected' | 'disconnected';
  address: string | null;
  chainId: number;
  methods: {
    selectWallet: (
      cacheProvider?: boolean,
      networkId?: string
    ) => Promise<void>;
    disconnect: () => Promise<void>;
  };
}

export const useWallet = (): IUseWallet => {
  const {network} = useNetwork();

  const {chain} = useWagmiNetwork();
  const {address, status: wagmiStatus, isConnected, connector} = useAccount();
  const {disconnect} = useDisconnect();
  const {connect, connectors} = useConnect();
  const {open: openWeb3Modal, isOpen} = useWeb3Modal();
  const chainId = chain?.id || 0;
  const chainName = chain?.name || '';
  const signer1 = useEthersSigner(chainId);
  const signer2 = useBOSagoraSigner(chainId, chainName);
  const signer = [
    'bosagora_mainnet',
    'bosagora_testnet',
    'bosagora_devnet',
  ].includes(network)
    ? signer2
    : signer1;

  // 메타마스크 계정 변경 이벤트 처리 (wagmi가 상태를 자동 갱신하므로 강제 새로고침 금지)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // 계정이 완전히 분리된 경우에만 수동 disconnect
          disconnect();
          return;
        }

        // 앱이 현재 disconnected 상태이지만, 메타마스크에서 계정이 선택되었다면
        // 사용자 편의상 인젝티드 커넥터로 즉시 재연결을 시도한다.
        if (wagmiStatus === 'disconnected') {
          try {
            const injected = connectors.find(
              c => c.id === 'injected' || c.name.toLowerCase().includes('meta')
            );
            if (injected) await connect({connector: injected});
          } catch (_e) {
            // 무시: 사용자가 거절하면 그대로 둔다
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
      };
    }
  }, [connect, connectors, disconnect, wagmiStatus]);

  if (signer !== undefined) {
    signer.getAddress().then((address: string) => {});
  } else {
  }

  const provider = useMemo(() => {
    return signer?.provider;
  }, [network, signer?.provider]);

  const {data: wagmiBalance} = useBalance({
    address,
  });

  const balance: bigint | null = wagmiBalance?.value || null;
  const isOnWrongNetwork: boolean =
    isConnected && CHAIN_METADATA[network].id !== chainId;

  const methods = {
    selectWallet: async (cacheProvider?: boolean, networkId?: string) => {
      try {
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          const injected = connectors.find(
            c => c.id === 'injected' || c.name.toLowerCase().includes('meta')
          );
          if (injected) {
            await connect({connector: injected});
            return;
          }
        }
        await new Promise(resolve => {
          openWeb3Modal();
          resolve({
            networkId,
            cacheProvider,
          });
        });
      } catch (e) {
        // fallback to modal on any error
        await openWeb3Modal();
      }
    },
    disconnect: async () => {
      await new Promise(resolve => {
        disconnect();
        resolve(true);
      });
    },
  };

  return {
    connectorName: connector?.name || '',
    provider: provider as Web3Provider,
    signer: signer as JsonRpcSigner,
    status: wagmiStatus,
    address: address as string,
    chainId,
    balance: BigNumber.from(balance || 0n),
    isConnected,
    isModalOpen: isOpen,
    isOnWrongNetwork,
    methods,
    network,
  };
};
