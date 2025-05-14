import { IClientCore } from "../client-common";
import { BigNumber } from "@ethersproject/bignumber";
import { SubmitTransaction, ConfirmTransaction, RevokeTransaction, ContractTransactionData } from "../interfaces";
import { BigNumberish } from "ethers";

export interface IMultiSigWallet {
    multiSigWallet: IMultiSigWalletMethods;
}

/** Defines the shape of the general purpose Client class */
export interface IMultiSigWalletMethods extends IClientCore {
    attach: (walletAddress: string) => void;
    getMembers: () => Promise<string[]>;
    getRequired: () => Promise<number>;

    isOwner: (account: string) => Promise<boolean>;

    getTransactionCount: () => Promise<number>;
    getTransaction: (transactionId: BigNumber) => Promise<ContractTransactionData>;
    getTransactionsInRange: (from: number, to: number) => Promise<ContractTransactionData[]>;

    getConfirmationCount: (transactionId: BigNumber) => Promise<number>;
    getConfirmations: (transactionId: BigNumber) => Promise<string[]>;

    submitTransaction: (
        title: string,
        description: string,
        destination: string,
        value: BigNumberish,
        data: string
    ) => AsyncGenerator<SubmitTransaction>;
    confirmTransaction: (transactionId: BigNumber) => AsyncGenerator<ConfirmTransaction>;
    revokeConfirmation: (transactionId: BigNumber) => AsyncGenerator<RevokeTransaction>;

    getTransactionCountInCondition: (from: number, to: number, pending: boolean, executed: boolean) => Promise<number>;
    getTransactionIdsInCondition: (
        from: number,
        to: number,
        pending: boolean,
        executed: boolean
    ) => Promise<BigNumber[]>;

    submitTransactionAddMember: (
        title: string,
        description: string,
        owner: string
    ) => AsyncGenerator<SubmitTransaction>;
    submitTransactionRemoveMember: (
        title: string,
        description: string,
        owner: string
    ) => AsyncGenerator<SubmitTransaction>;
    submitTransactionReplaceMember: (
        title: string,
        description: string,
        owner: string,
        newOwner: string
    ) => AsyncGenerator<SubmitTransaction>;

    submitTransactionChangeMember: (
        title: string,
        description: string,
        additionalMembers: string[],
        removalMembers: string[]
    ) => AsyncGenerator<SubmitTransaction>;

    submitTransactionChangeRequirement: (
        title: string,
        description: string,
        required: number
    ) => AsyncGenerator<SubmitTransaction>;

    submitTransactionChangeMetadata: (
        title: string,
        description: string,
        walletName: string,
        walletDescription: string
    ) => AsyncGenerator<SubmitTransaction>;

    submitTransactionNativeTransfer: (
        title: string,
        description: string,
        to: string,
        amount: BigNumber
    ) => AsyncGenerator<SubmitTransaction>;
    submitTransactionTokenTransfer: (
        title: string,
        description: string,
        destination: string,
        to: string,
        amount: BigNumber
    ) => AsyncGenerator<SubmitTransaction>;
    submitTransactionTokenApprove: (
        title: string,
        description: string,
        destination: string,
        spender: string,
        amount: BigNumber
    ) => AsyncGenerator<SubmitTransaction>;
}
