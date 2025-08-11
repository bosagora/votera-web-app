import { NetworkDeployment, SupportedNetwork } from "./interfaces/common";
import { activeContractsList } from "votera-contracts-lib";
import { Network } from "@ethersproject/networks";

export const LIVE_CONTRACTS: { [K in SupportedNetwork]: NetworkDeployment } = {
    [SupportedNetwork.MAINNET]: {
        AddressStorage: activeContractsList.mainnet.AddressStorage,
        BudgetManager: activeContractsList.mainnet.BudgetManager,
        ParamStorage: activeContractsList.mainnet.ParamStorage,
        ParticipantStorage: activeContractsList.mainnet.ParticipantStorage,
        EvaluatorStorage: activeContractsList.mainnet.EvaluatorStorage,
        EvaluatorManager: activeContractsList.mainnet.EvaluatorManager,
        ProposalStorage: activeContractsList.mainnet.ProposalStorage,
        AssessmentStorage: activeContractsList.mainnet.AssessmentStorage,
        VoteStorage: activeContractsList.mainnet.VoteStorage,
        ReceptionController: activeContractsList.mainnet.ReceptionController,
        AssessmentController: activeContractsList.mainnet.AssessmentController,
        VoteController: activeContractsList.mainnet.VoteController,
        ParticipantManager: activeContractsList.mainnet.ParticipantManager,
        ExecutionManager: activeContractsList.mainnet.ExecutionManager
    },
    [SupportedNetwork.TESTNET]: {
        AddressStorage: activeContractsList.testnet.AddressStorage,
        BudgetManager: activeContractsList.testnet.BudgetManager,
        ParamStorage: activeContractsList.testnet.ParamStorage,
        ParticipantStorage: activeContractsList.testnet.ParticipantStorage,
        EvaluatorStorage: activeContractsList.mainnet.EvaluatorStorage,
        EvaluatorManager: activeContractsList.mainnet.EvaluatorManager,
        ProposalStorage: activeContractsList.testnet.ProposalStorage,
        AssessmentStorage: activeContractsList.testnet.AssessmentStorage,
        VoteStorage: activeContractsList.testnet.VoteStorage,
        ReceptionController: activeContractsList.testnet.ReceptionController,
        AssessmentController: activeContractsList.testnet.AssessmentController,
        VoteController: activeContractsList.testnet.VoteController,
        ParticipantManager: activeContractsList.testnet.ParticipantManager,
        ExecutionManager: activeContractsList.testnet.ExecutionManager
    },
    [SupportedNetwork.DEVNET]: {
        AddressStorage: activeContractsList.devnet.AddressStorage,
        BudgetManager: activeContractsList.devnet.BudgetManager,
        ParamStorage: activeContractsList.devnet.ParamStorage,
        ParticipantStorage: activeContractsList.devnet.ParticipantStorage,
        EvaluatorStorage: activeContractsList.mainnet.EvaluatorStorage,
        EvaluatorManager: activeContractsList.mainnet.EvaluatorManager,
        ProposalStorage: activeContractsList.devnet.ProposalStorage,
        AssessmentStorage: activeContractsList.devnet.AssessmentStorage,
        VoteStorage: activeContractsList.devnet.VoteStorage,
        ReceptionController: activeContractsList.devnet.ReceptionController,
        AssessmentController: activeContractsList.devnet.AssessmentController,
        VoteController: activeContractsList.devnet.VoteController,
        ParticipantManager: activeContractsList.devnet.ParticipantManager,
        ExecutionManager: activeContractsList.devnet.ExecutionManager
    },
    [SupportedNetwork.LOCAL]: {
        AddressStorage: activeContractsList.devnet.AddressStorage,
        BudgetManager: activeContractsList.devnet.BudgetManager,
        ParamStorage: activeContractsList.devnet.ParamStorage,
        ParticipantStorage: activeContractsList.devnet.ParticipantStorage,
        EvaluatorStorage: activeContractsList.mainnet.EvaluatorStorage,
        EvaluatorManager: activeContractsList.mainnet.EvaluatorManager,
        ProposalStorage: activeContractsList.devnet.ProposalStorage,
        AssessmentStorage: activeContractsList.devnet.AssessmentStorage,
        VoteStorage: activeContractsList.devnet.VoteStorage,
        ReceptionController: activeContractsList.devnet.ReceptionController,
        AssessmentController: activeContractsList.devnet.AssessmentController,
        VoteController: activeContractsList.devnet.VoteController,
        ParticipantManager: activeContractsList.devnet.ParticipantManager,
        ExecutionManager: activeContractsList.devnet.ExecutionManager
    }
};

export const ADDITIONAL_NETWORKS: Network[] = [
    {
        name: SupportedNetwork.MAINNET,
        chainId: 2151
    },
    {
        name: SupportedNetwork.TESTNET,
        chainId: 2019
    },
    {
        name: SupportedNetwork.DEVNET,
        chainId: 24680
    }
];
