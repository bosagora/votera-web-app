import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { GasFeeEstimation } from "./common";

export interface IClientWeb3Core {
    useSigner: (signer: Signer) => void;
    shiftProvider: () => void;
    getSigner: () => Signer | undefined;
    getConnectedSigner: () => Signer;
    getProvider: () => JsonRpcProvider | undefined;
    getMaxFeePerGas: () => Promise<bigint>;
    isUp: () => Promise<boolean>;
    ensureOnline: () => Promise<void>;
    attachContract: <T>(address: string, abi: ContractInterface) => Contract & T;
    getApproximateGasFee: (estimatedFee: bigint) => Promise<GasFeeEstimation>;

    getAddressStorageAddress: () => string;
    getBudgetManagerAddress: () => string;
    getParamStorageAddress: () => string;
    getParticipantStorageAddress: () => string;
    getEvaluatorStorageAddress: () => string;
    getProposalStorageAddress: () => string;
    getAssessmentStorageAddress: () => string;
    getVoteStorageAddress: () => string;
    getReceptionControllerAddress: () => string;
    getAssessmentControllerAddress: () => string;
    getVoteControllerAddress: () => string;
    getParticipantManagerAddress: () => string;
    getEvaluatorManagerAddress: () => string;
    getExecutionManagerAddress: () => string;
}

export interface IClientCore {
    web3: IClientWeb3Core;
}
