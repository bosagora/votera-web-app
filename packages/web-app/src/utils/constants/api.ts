import {SupportedNetworks} from './chains';

type SubgraphNetworkUrl = Record<SupportedNetworks, string | undefined>;

export const FEEDBACK_FORM =
  'https://aragonassociation.atlassian.net/servicedesk/customer/portal/3';

export const SUBGRAPH_API_URL: SubgraphNetworkUrl = {
  ethereum:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-mainnet/version/v1.2.1/api',
  goerli:
    'https://subgraph.satsuma-prod.com/qHR2wGfc5RLi6/aragon/osx-goerli/version/v1.2.2/api',
  sepolia: undefined,
  bosagora_mainnet: undefined,
  bosagora_testnet: undefined,
  bosagora_devnet: undefined,
  acc_sidechain_mainnet: undefined,
  acc_sidechain_testnet: undefined,
  acc_sidechain_devnet: undefined,
  unsupported: undefined,
};

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

export const ARAGON_RPC = 'mainnet.eth.aragon.network';

type AlchemyApiKeys = Record<SupportedNetworks, string | undefined>;
export const alchemyApiKeys: AlchemyApiKeys = {
  ethereum: import.meta.env.VITE_ALCHEMY_KEY_MAINNET as string,
  goerli: import.meta.env.VITE_ALCHEMY_KEY_GOERLI as string,
  sepolia: undefined,
  bosagora_mainnet: undefined,
  bosagora_testnet: undefined,
  bosagora_devnet: undefined,
  acc_sidechain_mainnet: undefined,
  acc_sidechain_testnet: undefined,
  acc_sidechain_devnet: undefined,
  unsupported: undefined,
};

export const infuraApiKey = import.meta.env
  .VITE_INFURA_MAINNET_PROJECT_ID as string;

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const COVALENT_API_KEY = import.meta.env.VITE_COVALENT_API_KEY as string;

// Coingecko Api specific asset platform keys
export const ASSET_PLATFORMS: Record<SupportedNetworks, string | null> = {
  ethereum: 'ethereum',
  goerli: null,
  sepolia: null,
  bosagora_mainnet: 'boa',
  bosagora_testnet: null,
  bosagora_devnet: null,
  acc_sidechain_mainnet: null,
  acc_sidechain_testnet: null,
  acc_sidechain_devnet: null,
  unsupported: null,
};

export const NATIVE_TOKEN_ID = {
  default: 'ethereum',
  bosagora: 'bosagora',
};
