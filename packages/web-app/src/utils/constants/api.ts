import {SupportedNetworks} from './chains';

export const BASE_URL = 'https://api.coingecko.com/api/v3';
export const DEFAULT_CURRENCY = 'usd';

export const IPFS_ENDPOINT =
  import.meta.env.VITE_APP_IPFS_ENDPOINT ||
  'https://votera-testnet.s3.ap-northeast-2.amazonaws.com/';
export const IPFS_ENDPOINT_UPLOAD =
  import.meta.env.VITE_APP_IPFS_ENDPOINT_UPLOAD ||
  'https://votera-api.testnet.bosagora.org/upload';
type AlchemyApiKeys = Record<SupportedNetworks, string | undefined>;
export const alchemyApiKeys: AlchemyApiKeys = {
  ethereum: undefined,
  goerli: undefined,
  sepolia: undefined,
  bosagora_mainnet: undefined,
  bosagora_testnet: undefined,
  bosagora_devnet: undefined,
  unsupported: undefined,
};

export const infuraApiKey = import.meta.env
  .VITE_INFURA_MAINNET_PROJECT_ID as string;

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;

export const COVALENT_API_KEY = import.meta.env.VITE_COVALENT_API_KEY as string;

// Coingecko Api specific asset platform keys
export const ASSET_PLATFORMS: Record<SupportedNetworks, string | null> = {
  ethereum: null,
  goerli: null,
  sepolia: null,
  bosagora_mainnet: 'boa',
  bosagora_testnet: null,
  bosagora_devnet: null,
  unsupported: null,
};

export const NATIVE_TOKEN_ID = {
  default: 'ethereum',
  bosagora: 'bosagora',
};
