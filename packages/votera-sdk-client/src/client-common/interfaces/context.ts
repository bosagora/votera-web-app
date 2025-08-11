// This file defines the interfaces of the context object holding client settings

import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider, Network, Networkish } from "@ethersproject/providers";

// Context input parameters
type Web3ContextParams = {
    network: Networkish;
    signer?: Signer;
    web3Providers?: string | JsonRpcProvider | (string | JsonRpcProvider)[];
    gasFeeEstimationFactor?: number;

    AddressStorage: string;
    BudgetManager: string;
    ParamStorage: string;
    ParticipantStorage: string;
    EvaluatorStorage?: string;
    ProposalStorage: string;
    AssessmentStorage: string;
    VoteStorage: string;
    ReceptionController: string;
    AssessmentController: string;
    VoteController: string;
    ParticipantManager: string;
    EvaluatorManager?: string;
    ExecutionManager: string;
};

export type ContextParams = Web3ContextParams;

// Context state data
type Web3ContextState = {
    network: Network;
    signer?: Signer;
    web3Providers: JsonRpcProvider[];
    gasFeeEstimationFactor: number;

    AddressStorage?: string;
    BudgetManager?: string;
    ParamStorage?: string;
    ParticipantStorage?: string;
    EvaluatorStorage?: string;
    ProposalStorage?: string;
    AssessmentStorage?: string;
    VoteStorage?: string;
    ReceptionController?: string;
    AssessmentController?: string;
    VoteController?: string;
    ParticipantManager?: string;
    EvaluatorManager?: string;
    ExecutionManager?: string;
};

export type ContextState = Web3ContextState;
