import { Wallet } from "@ethersproject/wallet";
import { Amount, BOACoin, ContextParams, LIVE_CONTRACTS, SupportedNetwork, ProposalStates, ProposalPeriod, AssessmentResult, VoteResult, ExecutionStates, ProposalType } from "votera-sdk-client";

import {
    AddressStorage,
    AddressStorage__factory,
    AssessmentController__factory,
    AssessmentStorage__factory,
    BudgetManager__factory,
    ExecutionManager__factory,
    ParamStorage__factory,
    ParticipantManager__factory,
    ParticipantStorage__factory,
    ProposalStorage__factory,
    ReceptionController__factory,
    VoteStorage__factory,
    VoteController__factory
} from "votera-contracts-lib";

import { AddressZero } from "@ethersproject/constants";
import { BaseContract, ContractFactory } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import * as fs from "fs";

interface IDeployedContract {
    name: string;
    address: string;
    contract: BaseContract;
}

interface IParticipantData {
    voter: string;
    validatorKey: string;
}

export interface IAccount {
    users: Wallet[];
    voters: Wallet[];
    evaluators: Wallet[];
    validators: IParticipantData[];
}

type FnDeployer = (accounts: IAccount, deployments: Deployments) => Promise<any>;

export class Deployments {
    public deployments: Map<string, IDeployedContract>;
    public accounts: IAccount;
    public provider: JsonRpcProvider;

    constructor(url: string) {
        this.deployments = new Map<string, IDeployedContract>();
        this.provider = new JsonRpcProvider(url);

        const voters: any = JSON.parse(fs.readFileSync("./data/votes.json", "utf8"));
        const evaluators: any = JSON.parse(fs.readFileSync("./data/evaluator.json", "utf8"));
        const users: any = JSON.parse(fs.readFileSync("./data/accounts.json", "utf8"));
        this.accounts = {
            users: users.map((m: any) => new Wallet(m.privateKey, this.provider)),
            voters: voters.map((m: any) => new Wallet(m.privateKey, this.provider)),
            evaluators: evaluators.map((m: any) => new Wallet(m.privateKey, this.provider)),
            validators: voters.map((m: any) => {
                return { voter: m.address, validatorKey: m.validatorKey };
            })
        };
    }

    public addContract(name: string, address: string, contract: BaseContract) {
        this.deployments.set(name, {
            name,
            address,
            contract
        });
    }

    public getContract(name: string): BaseContract | undefined {
        const info = this.deployments.get(name);
        if (info !== undefined) {
            return info.contract;
        } else {
            return undefined;
        }
    }

    public getContractAddress(name: string): string {
        const info = this.deployments.get(name);
        if (info !== undefined) {
            return info.address;
        } else {
            return AddressZero;
        }
    }

    public async attachAll() {
        const deployers: FnDeployer[] = [
            attachAddressStorage,
            attachBudgetManager,
            attachParamStorage,
            attachParticipantStorage,
            attachProposalStorage,
            attachAssessmentStorage,
            attachVoteStorage,
            attachReceptionController,
            attachAssessmentController,
            attachVoteController,
            attachParticipantManager,
            attachExecutionManager
        ];
        for (const elem of deployers) {
            try {
                await elem(this.accounts, this);
            } catch (error) {
                console.log(error);
            }
        }
    }

    public getContextParams(): ContextParams {
        return {
            network: 24680,
            signer: this.accounts.users[0],
            web3Providers: [this.provider],
            AddressStorage: this.getContractAddress("AddressStorage"),
            BudgetManager: this.getContractAddress("BudgetManager"),
            ParamStorage: this.getContractAddress("ParamStorage"),
            ParticipantStorage: this.getContractAddress("ParticipantStorage"),
            ProposalStorage: this.getContractAddress("ProposalStorage"),
            AssessmentStorage: this.getContractAddress("AssessmentStorage"),
            VoteStorage: this.getContractAddress("VoteStorage"),
            ReceptionController: this.getContractAddress("ReceptionController"),
            AssessmentController: this.getContractAddress("AssessmentController"),
            VoteController: this.getContractAddress("VoteController"),
            ParticipantManager: this.getContractAddress("ParticipantManager"),
            ExecutionManager: this.getContractAddress("ExecutionManager")
        };
    }

    public async blockTimestampIncreaseTo(timestamp: number): Promise<void> {
        await this.provider.send("evm_mine", [timestamp]);
    }
}

async function attachAddressStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "AddressStorage";
    // console.log(`Attach ${contractName}...`);

    const factory = new ContractFactory(AddressStorage__factory.abi, AddressStorage__factory.bytecode);
    const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].AddressStorage)

    deployments.addContract(contractName, contract.address, contract);
    // console.log(`Attached ${contractName} to ${contract.address}`);
}

async function attachBudgetManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "BudgetManager";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(BudgetManager__factory.abi, BudgetManager__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].BudgetManager)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachParamStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParamStorage";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParamStorage__factory.abi, ParamStorage__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ParamStorage)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachParticipantStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParticipantStorage";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParticipantStorage__factory.abi, ParticipantStorage__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ParticipantStorage)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachProposalStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ProposalStorage";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ProposalStorage__factory.abi, ProposalStorage__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ProposalStorage)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachAssessmentStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "AssessmentStorage";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(AssessmentStorage__factory.abi, AssessmentStorage__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].AssessmentStorage)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachVoteStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "VoteStorage";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(VoteStorage__factory.abi, VoteStorage__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].VoteStorage)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachReceptionController(accounts: IAccount, deployments: Deployments) {
    const contractName = "ReceptionController";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ReceptionController__factory.abi, ReceptionController__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ReceptionController)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachAssessmentController(accounts: IAccount, deployments: Deployments) {
    const contractName = "AssessmentController";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(AssessmentController__factory.abi, AssessmentController__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].AssessmentController)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachVoteController(accounts: IAccount, deployments: Deployments) {
    const contractName = "VoteController";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(VoteController__factory.abi, VoteController__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].VoteController)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachParticipantManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParticipantManager";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParticipantManager__factory.abi, ParticipantManager__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ParticipantManager)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

async function attachExecutionManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "ExecutionManager";
    // console.log(`Attach ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ExecutionManager__factory.abi, ExecutionManager__factory.bytecode);
        const contract = factory.attach(LIVE_CONTRACTS[SupportedNetwork.DEVNET].ExecutionManager)

        deployments.addContract(contractName, contract.address, contract);
        // console.log(`Attached ${contractName} to ${contract.address}`);
    }
}

export class Helper {

    public static loadProposalId(): string {
        const data = JSON.parse(fs.readFileSync("./data/proposal.json", "utf-8"));
        if (data.proposalId !== undefined) return data.proposalId;
        else throw new Error("이전의 ProposalId 를 찾을 수 없습니다.");
    }

    public static storeProposalId(proposalId: string) {
        const data = {
            proposalId,
        };
        fs.writeFileSync("./data/proposal.json", JSON.stringify(data), "utf-8");
    }

    public static delay(interval: number): Promise<void> {
        return new Promise<void>((resolve, _) => {
            setTimeout(resolve, interval);
        });
    }

    public static getTimeStamp(): number {
        return Math.floor(new Date().getTime() / 1000);
    }

    public static toStringOfProposalStates(value: ProposalStates): string {
        switch (value) {
            case ProposalStates.INVALID: return "ProposalStates.INVALID";
            case ProposalStates.OPENED: return "ProposalStates.OPENED";
            case ProposalStates.CLOSED: return "ProposalStates.CLOSED";
        }
    }

    public static toStringOfProposalPeriod(value: ProposalPeriod): string {
        switch (value) {
            case ProposalPeriod.NONE: return "ProposalPeriod.NONE";
            case ProposalPeriod.ASSESSMENT: return "ProposalPeriod.ASSESSMENT";
            case ProposalPeriod.VOTE: return "ProposalPeriod.VOTE";
            case ProposalPeriod.EXECUTION: return "ProposalPeriod.EXECUTION";
            case ProposalPeriod.FINISHED: return "ProposalPeriod.FINISHED";
        }
    }

    public static toStringOfAssessmentResult(value: AssessmentResult): string {
        switch (value) {
            case AssessmentResult.NONE: return "AssessmentResult.NONE";
            case AssessmentResult.APPROVED: return "AssessmentResult.APPROVED";
            case AssessmentResult.REJECTED: return "AssessmentResult.REJECTED";
        }
    }

    public static toStringOfVoteResult(value: VoteResult): string {
        switch (value) {
            case VoteResult.NONE: return "VoteResult.NONE";
            case VoteResult.APPROVED: return "VoteResult.APPROVED";
            case VoteResult.REJECTED: return "VoteResult.REJECTED";
            case VoteResult.INVALID_QUORUM: return "VoteResult.INVALID_QUORUM";
        }
    }

    public static toStringOfExecutionStates(value: ExecutionStates): string {
        switch (value) {
            case ExecutionStates.NONE: return "ExecutionStates.NONE";
            case ExecutionStates.IN_PROCESS: return "ExecutionStates.IN_PROCESS";
            case ExecutionStates.FINISHED: return "ExecutionStates.FINISHED";
        }
    }

    public static toStringOfProposalType(value: ProposalType): string {
        switch (value) {
            case ProposalType.SYSTEM: return "ProposalType.SYSTEM";
            case ProposalType.FUND: return "ProposalType.FUND";
        }
    }
}