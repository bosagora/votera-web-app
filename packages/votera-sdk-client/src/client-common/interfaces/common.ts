export enum SupportedNetwork {
    MAINNET = "bosagora_mainnet",
    TESTNET = "bosagora_testnet",
    DEVNET = "bosagora_devnet",
    LOCAL = "localhost"
}

export const SupportedNetworksArray = Object.values(SupportedNetwork);

export type NetworkDeployment = {
    AddressStorage: string;
    BudgetManager: string;
    ParamStorage: string;
    ParticipantStorage: string;
    ProposalStorage: string;
    AssessmentStorage: string;
    VoteStorage: string;
    ReceptionController: string;
    AssessmentController: string;
    VoteController: string;
    ParticipantManager: string;
    ExecutionManager: string;
};
export type GenericRecord = Record<string, string | number | boolean | null | undefined>;

export type GasFeeEstimation = {
    average: bigint;
    max: bigint;
};
