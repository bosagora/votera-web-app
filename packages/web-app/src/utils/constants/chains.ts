/* SUPPORTED NETWORK TYPES ================================================== */

export const SUPPORTED_CHAIN_ID = [1, 2019, 2151, 24680, 11155111] as const;
export type SupportedChainID = typeof SUPPORTED_CHAIN_ID[number];

export function isSupportedChainId(
  chainId: number
): chainId is SupportedChainID {
  return SUPPORTED_CHAIN_ID.some(id => id === chainId);
}

export const ENS_SUPPORTED_NETWORKS = [];

const SUPPORTED_NETWORKS = [
  'ethereum',
  'sepolia',
  'bosagora_mainnet',
  'bosagora_testnet',
  'bosagora_devnet',
] as const;

export type availableNetworks =
  | 'mainnet'
  | 'goerli'
  | 'sepolia'
  | 'bosagora_mainnet'
  | 'bosagora_testnet'
  | 'bosagora_devnet';

export type SupportedNetworks =
  | typeof SUPPORTED_NETWORKS[number]
  | 'unsupported';

export function isSupportedNetwork(
  network: string
): network is SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network);
}

export function toSupportedNetwork(network: string): SupportedNetworks {
  return SUPPORTED_NETWORKS.some(n => n === network)
    ? (network as SupportedNetworks)
    : 'unsupported';
}

/**
 * Get the network name with given chain id
 * @param chainId Chain id
 * @returns the name of the supported network or undefined if network is unsupported
 */
export function getSupportedNetworkByChainId(
  chainId: number
): SupportedNetworks | undefined {
  if (isSupportedChainId(chainId)) {
    return Object.entries(CHAIN_METADATA).find(
      entry => entry[1].id === chainId
    )?.[0] as SupportedNetworks;
  }
}

export type NetworkDomain = 'Main Chain' | 'Test Chain' | 'Dev Chain';

/* CHAIN DATA =============================================================== */

export type NativeTokenData = {
  name: string;
  symbol: string;
  decimals: number;
};

export type ChainData = {
  id: SupportedChainID;
  name: string;
  domain: NetworkDomain;
  testnet: boolean;
  explorer: string;
  logo: string;
  rpc: string[];
  nativeCurrency: NativeTokenData;
  supportsEns: boolean;
};

export type ChainList = Record<SupportedNetworks, ChainData>;
export const CHAIN_METADATA: ChainList = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    testnet: false,
    rpc: [`https://eth.llamarpc.com`],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    supportsEns: false,
  },
  sepolia: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://sepolia.etherscan.io/',
    testnet: true,
    rpc: [`https://eth-sepolia.public.blastapi.io`],
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    supportsEns: false,
  },
  bosagora_mainnet: {
    id: 2151,
    name: 'bosagora_mainnet',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://boascan.io/',
    testnet: false,
    rpc: ['https://mainnet.bosagora.org', 'https://rpc.bosagora.org'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    supportsEns: false,
  },
  bosagora_testnet: {
    id: 2019,
    name: 'bosagora_testnet',
    domain: 'Test Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://testnet.boascan.io/',
    testnet: true,
    rpc: ['https://testnet.bosagora.org'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    supportsEns: false,
  },
  bosagora_devnet: {
    id: 24680,
    name: 'bosagora_devnet',
    domain: 'Dev Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'http://localhost:14000/',
    testnet: true,
    rpc: ['http://localhost:8545'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    supportsEns: false,
  },
  unsupported: {
    id: 1,
    name: 'Unsupported',
    domain: 'Main Chain',
    logo: '',
    explorer: '',
    testnet: false,
    rpc: [],
    nativeCurrency: {
      name: '',
      symbol: '',
      decimals: 18,
    },
    supportsEns: false,
  },
};

export const chainExplorerAddressLink = (
  network: SupportedNetworks,
  address: string
) => {
  return `${CHAIN_METADATA[network].explorer}address/${address}`;
};
