/* SUPPORTED NETWORK TYPES ================================================== */

import {infuraApiKey} from './api';

export const SUPPORTED_CHAIN_ID = [
  1, 5, 2151, 2019, 24600, 24680, 215110, 215115, 11155111,
] as const;
export type SupportedChainID = typeof SUPPORTED_CHAIN_ID[number];

export function isSupportedChainId(
  chainId: number
): chainId is SupportedChainID {
  return SUPPORTED_CHAIN_ID.some(id => id === chainId);
}

export const ENS_SUPPORTED_NETWORKS = [];

const SUPPORTED_NETWORKS = [
  'ethereum',
  'goerli',
  'sepolia',
  'bosagora_mainnet',
  'bosagora_testnet',
  'bosagora_devnet',
  'acc_sidechain_mainnet',
  'acc_sidechain_testnet',
  'acc_sidechain_devnet',
] as const;

export type availableNetworks =
  | 'mainnet'
  | 'goerli'
  | 'sepolia'
  | 'bosagora_devnet'
  | 'acc_sidechain_devnet';

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

export type NetworkDomain = 'Main Chain' | 'Side Chain';

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
  etherscanApi: string;
  etherscanApiKey?: string;
  covalentApi?: string;
  alchemyApi: string;
  supportsEns: boolean;
  ipfs?: string;
};

const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

export type ChainList = Record<SupportedNetworks, ChainData>;
export const CHAIN_METADATA: ChainList = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://etherscan.io/',
    testnet: false,
    rpc: [
      `https://mainnet.infura.io/v3/${infuraApiKey}`,
      `wss://mainnet.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api.etherscan.io/api',
    etherscanApiKey: etherscanApiKey,
    covalentApi: 'https://api.covalenthq.com/v1/eth-mainnet',
    alchemyApi: 'https://eth-mainnet.g.alchemy.com/v2',
    supportsEns: false,
    ipfs: 'https://prod.ipfs.aragon.network',
  },
  goerli: {
    id: 5,
    name: 'Goerli',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://goerli.etherscan.io/',
    testnet: true,
    rpc: [
      `https://goerli.infura.io/v3/${infuraApiKey}`,
      `wss://goerli.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api-goerli.etherscan.io/api',
    etherscanApiKey: etherscanApiKey,
    covalentApi: 'https://api.covalenthq.com/v1/eth-goerli',
    alchemyApi: 'https://eth-goerli.g.alchemy.com/v2',
    supportsEns: false,
    ipfs: 'https://test.ipfs.aragon.network',
  },
  bosagora_mainnet: {
    id: 2151,
    name: 'bosagora_mainnet',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://boascan.io/',
    testnet: false,
    rpc: ['https://mainnet.bosagora.org'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
  bosagora_testnet: {
    id: 2019,
    name: 'bosagora_testnet',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://testnet.boascan.io/',
    testnet: true,
    rpc: ['https://testnet.bosagora.org'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
  bosagora_devnet: {
    id: 24600,
    name: 'bosagora_devnet',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://testnet.boascan.io/',
    testnet: true,
    rpc: ['http://localhost:8540'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },

  acc_sidechain_mainnet: {
    id: 215110,
    name: 'acc_sidechain_mainnet',
    domain: 'Side Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://boascan.io/',
    testnet: false,
    rpc: ['https://rpc.main.acccoin.io'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
  acc_sidechain_testnet: {
    id: 215115,
    name: 'acc_sidechain_testnet',
    domain: 'Side Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'https://testnet.boascan.io/',
    testnet: true,
    rpc: ['https://rpc.test.acccoin.io'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
  acc_sidechain_devnet: {
    id: 24680,
    name: 'acc_sidechain_devnet',
    domain: 'Side Chain',
    logo: 'https://assets.coingecko.com/coins/images/9202/standard/Picture1.png?1696509320',
    explorer: 'http://localhost:14000/',
    testnet: true,
    rpc: ['http://localhost:8545'],
    nativeCurrency: {
      name: 'BOA',
      symbol: 'BOA',
      decimals: 18,
    },
    etherscanApi: '',
    etherscanApiKey: '',
    covalentApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
  sepolia: {
    id: 11155111,
    name: 'Ethereum Sepolia',
    domain: 'Main Chain',
    logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    explorer: 'https://sepolia.etherscan.io/',
    testnet: true,
    rpc: [
      `https://sepolia.infura.io/v3/${infuraApiKey}`,
      `wss://sepolia.infura.io/ws/v3/${infuraApiKey}`,
    ],
    nativeCurrency: {
      name: 'SepoliaETH',
      symbol: 'ETH',
      decimals: 18,
    },
    etherscanApi: 'https://api-sepolia.etherscan.io/api',
    etherscanApiKey: etherscanApiKey,
    alchemyApi: 'https://eth-sepolia.g.alchemy.com/v2',
    supportsEns: false,
    ipfs: 'https://test.ipfs.aragon.network',
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
    etherscanApi: '',
    alchemyApi: '',
    supportsEns: false,
    ipfs: '',
  },
};

export const chainExplorerAddressLink = (
  network: SupportedNetworks,
  address: string
) => {
  return `${CHAIN_METADATA[network].explorer}address/${address}`;
};
