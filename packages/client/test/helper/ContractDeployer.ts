import { GanacheServer } from "./GanacheServer";
import { Wallet } from "@ethersproject/wallet";
import { LIVE_CONTRACTS } from "../../src";
import { contextParamsLocalChain } from "./constants";

import {
    TestMultiSigToken,
    TestMultiSigToken__factory,
    MultiSigWalletFactory,
    MultiSigWalletFactory__factory
} from "multisig-wallet-contracts-lib";

import { ContractFactory } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";

export interface Deployment {
    provider: JsonRpcProvider;
    walletFactory: MultiSigWalletFactory;
}

export class ContractDeployer {
    public static async deploy(): Promise<Deployment> {
        const provider = GanacheServer.createTestProvider();
        GanacheServer.setTestProvider(provider);

        let accounts = GanacheServer.accounts();
        const [deployer] = accounts;

        try {
            //console.log("Start Deploy");

            //console.log("Deploy MultiSigWalletFactory");
            const walletFactory: MultiSigWalletFactory = await ContractDeployer.deployMultiSigWalletFactory(deployer);

            LIVE_CONTRACTS.bosagora_devnet.MultiSigWalletFactoryAddress = walletFactory.address;

            contextParamsLocalChain.walletFactoryAddress = walletFactory.address;

            //console.log("Complete Deploy");
            return {
                provider: provider,
                walletFactory: walletFactory
            };
        } catch (e) {
            throw e;
        }
    }

    public static async deployToken(deployer: Wallet, owner: string): Promise<TestMultiSigToken> {
        const factory = new ContractFactory(TestMultiSigToken__factory.abi, TestMultiSigToken__factory.bytecode);
        const contract = (await factory.connect(deployer).deploy(owner)) as TestMultiSigToken;
        await contract.deployed();
        await contract.deployTransaction.wait();
        return contract;
    }

    private static async deployMultiSigWalletFactory(deployer: Wallet): Promise<MultiSigWalletFactory> {
        const factory = new ContractFactory(
            MultiSigWalletFactory__factory.abi,
            MultiSigWalletFactory__factory.bytecode
        );
        const contract = (await factory.connect(deployer).deploy()) as MultiSigWalletFactory;
        await contract.deployed();
        await contract.deployTransaction.wait();
        return contract;
    }
}
