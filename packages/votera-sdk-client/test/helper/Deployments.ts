import { GanacheServer } from "./GanacheServer";
import { Wallet } from "@ethersproject/wallet";
import { Amount, BOACoin, ContextParams } from "../../src";

import { BaseContract, ContractFactory } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import * as fs from "fs";

import {
    AddressStorage,
    AddressStorage__factory,
    AssessmentController,
    AssessmentController__factory,
    AssessmentStorage,
    AssessmentStorage__factory,
    BudgetManager,
    BudgetManager__factory,
    IssuedContract,
    IssuedContract__factory,
    ExecutionManager,
    ExecutionManager__factory,
    ParamStorage,
    ParamStorage__factory,
    ParticipantManager,
    ParticipantManager__factory,
    ParticipantStorage,
    ParticipantStorage__factory,
    ProposalStorage,
    ProposalStorage__factory,
    ReceptionController,
    ReceptionController__factory,
    VoteStorage,
    VoteStorage__factory,
    VoteController,
    VoteController__factory
} from "votera-contracts-lib";
import { AddressZero } from "@ethersproject/constants";
import { TEST_WALLET } from "./constants";

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
    deployer: Wallet;
    owner: Wallet;
    users: Wallet[];
    voters: Wallet[];
    validators: IParticipantData[];
}

type FnDeployer = (accounts: IAccount, deployments: Deployments) => Promise<any>;

export class Deployments {
    public deployments: Map<string, IDeployedContract>;
    public accounts: IAccount;
    public provider: JsonRpcProvider;

    constructor() {
        this.deployments = new Map<string, IDeployedContract>();
        this.provider = GanacheServer.createTestProvider();

        let raws = GanacheServer.accounts();
        const [deployer, owner, user01, user02, user03, user04, user05, user06, user07, user08, user09, user10] = raws;
        const voters: any = JSON.parse(fs.readFileSync("./test/data/votes.json", "utf8"));
        this.accounts = {
            deployer,
            owner,
            users: [user01, user02, user03, user04, user05, user06, user07, user08, user09, user10],
            voters: voters.map((m: any) => new Wallet(m.privateKey, this.provider)),
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

    public async doDeployAll() {
        const deployers: FnDeployer[] = [
            transferToVoter,
            deployAddressStorage,
            deployIssuedContract,
            deployBudgetManager,
            deployParamStorage,
            deployParticipantStorage,
            deployProposalStorage,
            deployAssessmentStorage,
            deployVoteStorage,
            deployReceptionController,
            deployAssessmentController,
            deployVoteController,
            deployParticipantManager,
            deployExecutionManager
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
            signer: new Wallet(TEST_WALLET),
            web3Providers: ["http://localhost:7545"],
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

async function transferToVoter(accounts: IAccount, _: Deployments) {
    for (const target of accounts.voters) {
        await accounts.owner.sendTransaction({
            to: target.address,
            value: Amount.make("1000000", 18).value
        });
    }
}

async function deployAddressStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "AddressStorage";
    console.log(`Deploy ${contractName}...`);

    const factory = new ContractFactory(AddressStorage__factory.abi, AddressStorage__factory.bytecode);
    const contract = (await factory.connect(accounts.deployer).deploy()) as AddressStorage;
    await contract.deployed();
    await contract.deployTransaction.wait();

    deployments.addContract(contractName, contract.address, contract);
    console.log(`Deployed ${contractName} to ${contract.address}`);
}

async function deployIssuedContract(accounts: IAccount, deployments: Deployments) {
    const contractName = "IssuedContract";
    console.log(`Deploy ${contractName}...`);

    const factory = new ContractFactory(IssuedContract__factory.abi, IssuedContract__factory.bytecode);
    const contract = (await factory.connect(accounts.deployer).deploy()) as IssuedContract;
    await contract.deployed();
    await contract.deployTransaction.wait();

    deployments.addContract(contractName, contract.address, contract);
    console.log(`Deployed ${contractName} to ${contract.address}`);
    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        await addressStorage.connect(accounts.deployer).setAddress("IssuedContract", contract.address);
    }
    await accounts.owner.sendTransaction({
        to: contract.address,
        value: Amount.make("100000000", 18).value
    });

    const balance = new BOACoin(await deployments.provider.getBalance(contract.address));
    console.log(`Balance of Issued Contract: ${balance.toDisplayString(true, 2)}`);
}

async function deployBudgetManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "BudgetManager";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(BudgetManager__factory.abi, BudgetManager__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as BudgetManager;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);

        const issuedContract = deployments.getContract("IssuedContract") as IssuedContract;
        if (issuedContract !== undefined) {
            await issuedContract.connect(accounts.deployer).setCommonsBudgetAddress(contract.address);
        }
    }
}

async function deployParamStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParamStorage";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParamStorage__factory.abi, ParamStorage__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ParamStorage;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployParticipantStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParticipantStorage";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParticipantStorage__factory.abi, ParticipantStorage__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ParticipantStorage;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployProposalStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "ProposalStorage";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ProposalStorage__factory.abi, ProposalStorage__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ProposalStorage;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address, {
            minAssessmentDays: 7,
            maxAssessmentDays: 14,
            minVoteDays: 14,
            maxVoteDays: 28,
            units: 86400
        });

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployAssessmentStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "AssessmentStorage";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(AssessmentStorage__factory.abi, AssessmentStorage__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as AssessmentStorage;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployVoteStorage(accounts: IAccount, deployments: Deployments) {
    const contractName = "VoteStorage";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(VoteStorage__factory.abi, VoteStorage__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as VoteStorage;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployReceptionController(accounts: IAccount, deployments: Deployments) {
    const contractName = "ReceptionController";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ReceptionController__factory.abi, ReceptionController__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ReceptionController;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployAssessmentController(accounts: IAccount, deployments: Deployments) {
    const contractName = "AssessmentController";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(AssessmentController__factory.abi, AssessmentController__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as AssessmentController;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployVoteController(accounts: IAccount, deployments: Deployments) {
    const contractName = "VoteController";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(VoteController__factory.abi, VoteController__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as VoteController;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployParticipantManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "ParticipantManager";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ParticipantManager__factory.abi, ParticipantManager__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ParticipantManager;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}

async function deployExecutionManager(accounts: IAccount, deployments: Deployments) {
    const contractName = "ExecutionManager";
    console.log(`Deploy ${contractName}...`);

    const addressStorage = deployments.getContract("AddressStorage") as AddressStorage;
    if (addressStorage !== undefined) {
        const factory = new ContractFactory(ExecutionManager__factory.abi, ExecutionManager__factory.bytecode);
        const contract = (await factory.connect(accounts.deployer).deploy()) as ExecutionManager;
        await contract.deployed();
        await contract.deployTransaction.wait();
        await contract.connect(accounts.deployer).initialize(addressStorage.address);

        deployments.addContract(contractName, contract.address, contract);
        console.log(`Deployed ${contractName} to ${contract.address}`);
    }
}
