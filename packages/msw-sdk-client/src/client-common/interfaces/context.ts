// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Network, Networkish } from "@ethersproject/providers";

// Context input parameters
type Web3ContextParams = {
    network: Networkish;
    signer?: Signer;
    walletFactoryAddress?: string;
    web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
    gasFeeEstimationFactor?: number;
};

export type ContextParams = Web3ContextParams;

// Context state data
type Web3ContextState = {
    network: Network;
    signer?: Signer;
    walletFactoryAddress?: string;
    web3Providers: JsonRpcProvider[];
    gasFeeEstimationFactor: number;
};

export type ContextState = Web3ContextState;
