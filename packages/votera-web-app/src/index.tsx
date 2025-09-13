import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';

import {AlertProvider} from 'context/alert';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {walletConnectProjectID} from 'utils/constants';
import App from './app';

import {EthereumClient, w3mConnectors, w3mProvider} from '@web3modal/ethereum';
import {Web3Modal} from '@web3modal/react';
import {configureChains, createConfig, WagmiConfig} from 'wagmi';
import {mainnet, goerli, polygon, polygonMumbai} from 'wagmi/chains';

const chains = [mainnet, goerli, polygon, polygonMumbai];

// Wallet detection shim:
// Some browsers/extensions set window.ethereum.providers to null/undefined.
// Web3Modal/wagmi expect an array and may call Array.prototype.some on it.
// Ensure it's a valid array to avoid runtime errors and enable detection.
if (typeof window !== 'undefined') {
  const eth = (window as any).ethereum;
  if (eth && (eth.providers === undefined || eth.providers === null)) {
    eth.providers = [eth];
  }

  // EIP-6963: discover multi-injected providers (MetaMask, etc.)
  try {
    const discovered: any[] = [];
    window.addEventListener('eip6963:announceProvider' as any, (event: any) => {
      const provider = event?.detail?.provider;
      if (provider && !discovered.includes(provider)) discovered.push(provider);
    });
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    // Merge discovered providers into ethereum.providers if available
    setTimeout(() => {
      const wEth = (window as any).ethereum;
      if (wEth) {
        const base: any[] = Array.isArray(wEth.providers)
          ? wEth.providers
          : wEth
          ? [wEth]
          : [];
        const merged = [...new Set([...base, ...discovered])];
        (window as any).ethereum.providers = merged;
      }
    }, 0);
  } catch (e) {
    // ignore
  }
}

const {publicClient} = configureChains(chains, [
  w3mProvider({projectId: walletConnectProjectID}),
]);

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({
    projectId: walletConnectProjectID,
    chains,
    // Disable WalletConnect Explorer recommendations to avoid null .some crashes
  }),

  publicClient,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiConfig, chains);

// React-Query client
export const queryClient = new QueryClient();

const CACHE_VERSION = 1;
const onLoad = () => {
  const cacheVersion = localStorage.getItem('VoteraCacheVersion');
  const retainKeys = ['privacy-policy-preferences', 'uselang'];
  if (!cacheVersion || parseInt(cacheVersion) < CACHE_VERSION) {
    for (let i = 0; i < localStorage.length; i++) {
      if (!retainKeys.includes(localStorage.key(i)!)) {
        localStorage.removeItem(localStorage.key(i)!);
      }
    }
    localStorage.setItem('VoteraCacheVersion', CACHE_VERSION.toString());
  }

  // 언어 설정이 없는 경우 기본값 설정
  if (!localStorage.getItem('uselang')) {
    localStorage.setItem('uselang', 'ko');
  }
};
onLoad();

ReactDOM.render(
  <>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <PrivacyContextProvider>
          <Router>
            <AlertProvider>
              <WagmiConfig config={wagmiConfig}>
                <NetworkProvider>
                  <UseClientProvider>
                    <UseCacheProvider>
                      <ProvidersProvider>
                        <TransactionDetailProvider>
                          <WalletMenuProvider>
                            <GlobalModalsProvider>
                              <App />
                              <ReactQueryDevtools initialIsOpen={false} />
                            </GlobalModalsProvider>
                          </WalletMenuProvider>
                        </TransactionDetailProvider>
                      </ProvidersProvider>
                    </UseCacheProvider>
                  </UseClientProvider>
                </NetworkProvider>
              </WagmiConfig>
            </AlertProvider>
          </Router>
        </PrivacyContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
    <Web3Modal
      projectId={walletConnectProjectID}
      ethereumClient={ethereumClient}
      themeMode="light"
      explorerRecommendedWalletIds="NONE"
    />
  </>,
  document.getElementById('root')
);
