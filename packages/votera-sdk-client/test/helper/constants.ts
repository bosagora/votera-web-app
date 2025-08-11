import * as dotenv from "dotenv";

import { ContextParams } from "../../src";

import { AddressZero } from "@ethersproject/constants";
import { Wallet } from "@ethersproject/wallet";
dotenv.config({ path: "env/.env" });

export const web3EndpointsMainnet = {
    working: ["https://mainnet.bosagora.org/"],
    failing: ["https://bad-url-gateway.io/"]
};

export const web3EndpointsTestnet = {
    working: ["https://testnet.bosagora.org/"],
    failing: ["https://bad-url-gateway.io/"]
};

export const TEST_WALLET = "0xd09672244a06a32f74d051e5adbbb62ae0eda27832a973159d475da6d53ba5c0";

export const contextParamsMainnet: ContextParams = {
    network: 2151,
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsMainnet.working,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    EvaluatorStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    EvaluatorManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsTestnet: ContextParams = {
    network: 2019,
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsTestnet.working,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    EvaluatorStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    EvaluatorManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsLocalChain: ContextParams = {
    network: 24680,
    signer: new Wallet(TEST_WALLET),
    web3Providers: ["http://localhost:7545"],
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    EvaluatorStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    EvaluatorManager: AddressZero,
    ExecutionManager: AddressZero
};

export const contextParamsFailing: ContextParams = {
    network: 24680,
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsMainnet.failing,
    AddressStorage: AddressZero,
    BudgetManager: AddressZero,
    ParamStorage: AddressZero,
    ParticipantStorage: AddressZero,
    EvaluatorStorage: AddressZero,
    ProposalStorage: AddressZero,
    AssessmentStorage: AddressZero,
    VoteStorage: AddressZero,
    ReceptionController: AddressZero,
    AssessmentController: AddressZero,
    VoteController: AddressZero,
    ParticipantManager: AddressZero,
    EvaluatorManager: AddressZero,
    ExecutionManager: AddressZero
};
