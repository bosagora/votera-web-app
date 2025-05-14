export enum SupportedNetwork {
    ETHEREUM_MAINNET = "homestead",
    ETHEREUM_GOERLI = "goerli",
    ETHEREUM_SEPOLIA = "sepolia",
    BOSAGORA_MAINNET = "bosagora_mainnet",
    BOSAGORA_TESTNET = "bosagora_testnet",
    BOSAGORA_DEVNET = "bosagora_devnet",
    ACC_SIDECHAIN_MAINNET = "acc_sidechain_mainnet",
    ACC_SIDECHAIN_TESTNET = "acc_sidechain_testnet",
    ACC_SIDECHAIN_DEVNET = "acc_sidechain_devnet"
}

export const SupportedNetworksArray = Object.values(SupportedNetwork);

export type NetworkDeployment = {
    MultiSigWalletFactoryAddress: string;
};

export type GasFeeEstimation = {
    average: bigint;
    max: bigint;
};
