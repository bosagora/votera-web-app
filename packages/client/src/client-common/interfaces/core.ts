// This file contains the definition of the low level network clients

import { Signer } from "@ethersproject/abstract-signer";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { GasFeeEstimation } from "./common";

export interface IClientWeb3Core {
    useSigner: (signer: Signer) => void;
    shiftProvider: () => void;
    getSigner: () => Signer | null;
    getConnectedSigner: () => Signer;
    getProvider: () => JsonRpcProvider | null;
    getMaxFeePerGas: () => Promise<bigint>;
    isUp: () => Promise<boolean>;
    ensureOnline: () => Promise<void>;
    attachContract: <T>(address: string, abi: ContractInterface) => Contract & T;
    getWalletFactoryAddress: () => string;
    getApproximateGasFee: (estimatedFee: bigint) => Promise<GasFeeEstimation>;
}

export interface IClientCore {
    web3: IClientWeb3Core;
}
