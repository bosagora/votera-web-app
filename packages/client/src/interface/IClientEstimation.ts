import { GasFeeEstimation } from "../client-common/interfaces/common";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface IClientEstimation {
    estimation: IClientEstimationMethods;
}

export interface IClientEstimationMethods {
    create: (
        name: string,
        description: string,
        owners: string[],
        required: number,
        seed: number
    ) => Promise<GasFeeEstimation>;
    submitTransaction: (
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        value: BigNumberish,
        data: string
    ) => Promise<GasFeeEstimation>;
    confirmTransaction: (walletAddress: string, transactionId: BigNumber) => Promise<GasFeeEstimation>;
    revokeConfirmation: (walletAddress: string, transactionId: BigNumber) => Promise<GasFeeEstimation>;
    submitTransactionAddOwner: (
        walletAddress: string,
        title: string,
        description: string,
        owner: string
    ) => Promise<GasFeeEstimation>;
    submitTransactionRemoveOwner: (
        walletAddress: string,
        title: string,
        description: string,
        owner: string
    ) => Promise<GasFeeEstimation>;
    submitTransactionReplaceOwner: (
        walletAddress: string,
        title: string,
        description: string,
        owner: string,
        newOwner: string
    ) => Promise<GasFeeEstimation>;
    submitTransactionNativeTransfer: (
        walletAddress: string,
        title: string,
        description: string,
        to: string,
        amount: BigNumber
    ) => Promise<GasFeeEstimation>;
    submitTransactionTokenTransfer: (
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        to: string,
        amount: BigNumber
    ) => Promise<GasFeeEstimation>;
    submitTransactionTokenApprove: (
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        spender: string,
        amount: BigNumber
    ) => Promise<GasFeeEstimation>;
}
