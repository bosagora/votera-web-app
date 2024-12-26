import { NetworkDeployment, SupportedNetwork } from "./interfaces/common";
import { activeContractsList } from "multisig-wallet-contracts-lib";
import { Network } from "@ethersproject/networks";

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
    [SupportedNetwork.ETHEREUM_MAINNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.ethereum_mainnet.MultiSigWalletFactory
    },
    [SupportedNetwork.ETHEREUM_GOERLI]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_testnet.MultiSigWalletFactory
    },
    [SupportedNetwork.ETHEREUM_SEPOLIA]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_testnet.MultiSigWalletFactory
    },
    [SupportedNetwork.BOSAGORA_MAINNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_mainnet.MultiSigWalletFactory
    },
    [SupportedNetwork.BOSAGORA_TESTNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_testnet.MultiSigWalletFactory
    },
    [SupportedNetwork.BOSAGORA_DEVNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.bosagora_devnet.MultiSigWalletFactory
    },
    [SupportedNetwork.ACC_SIDECHAIN_MAINNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.acc_sidechain_mainnet.MultiSigWalletFactory
    },
    [SupportedNetwork.ACC_SIDECHAIN_TESTNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.acc_sidechain_testnet.MultiSigWalletFactory
    },
    [SupportedNetwork.ACC_SIDECHAIN_DEVNET]: {
        MultiSigWalletFactoryAddress: activeContractsList.acc_sidechain_devnet.MultiSigWalletFactory
    }
};

export const ADDITIONAL_NETWORKS: Network[] = [
    {
        name: SupportedNetwork.BOSAGORA_MAINNET,
        chainId: 2151
    },
    {
        name: SupportedNetwork.BOSAGORA_TESTNET,
        chainId: 2019
    },
    {
        name: SupportedNetwork.BOSAGORA_DEVNET,
        chainId: 24600
    },
    {
        name: SupportedNetwork.ACC_SIDECHAIN_MAINNET,
        chainId: 215110
    },
    {
        name: SupportedNetwork.ACC_SIDECHAIN_TESTNET,
        chainId: 215115
    },
    {
        name: SupportedNetwork.ACC_SIDECHAIN_DEVNET,
        chainId: 24680
    }
];
