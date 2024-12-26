import { Server } from "ganache";
import { GanacheServer } from "../helper/GanacheServer";
import { contextParamsLocalChain } from "../helper/constants";
import { BOACoin, ABIStorage, Client, Context, NormalSteps } from "../../src";
import { ContractDeployer, Deployment } from "../helper/ContractDeployer";
import { TestMultiSigToken } from "multisig-wallet-contracts-lib";

import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";

import * as assert from "assert";

describe("SDK Client", () => {
    const [deployer, owner1, owner2, owner3, owner4, owner5, user1, user2] = GanacheServer.accounts();
    const owners: Wallet[][] = [
        [owner1, owner2, owner3],
        [owner1, owner2, owner4],
        [owner1, owner4, owner5]
    ];
    const required = 2;
    const walletAddresses: string[] = [];
    let tokenContracts: TestMultiSigToken[] = [];
    let deployment: Deployment;

    const walletInfos = [
        {
            name: "My Wallet 1",
            description: "My first multi-sign wallet"
        },
        {
            name: "My Wallet 2",
            description: "My second multi-sign wallet"
        },
        {
            name: "My Wallet 3",
            description: "My third multi-sign wallet"
        },
        {
            name: "Fund",
            description: "Fund of develop"
        }
    ];
    let server: Server;

    beforeAll(async () => {
        server = await GanacheServer.start();
        deployment = await ContractDeployer.deploy();
        GanacheServer.setTestWeb3Signer(owner1);
    });

    afterAll(async () => {
        await server.close();
    });

    let client: Client;
    beforeAll(async () => {
        const ctx = new Context(contextParamsLocalChain);
        client = new Client(ctx);
    });

    it("Web3 Health Checking", async () => {
        const isUp = await client.multiSigWalletFactory.web3.isUp();
        expect(isUp).toEqual(true);
    });

    it("create", async () => {
        for (let idx = 0; idx < 3; idx++) {
            for await (const step of client.multiSigWalletFactory.create(
                walletInfos[idx].name,
                walletInfos[idx].description,
                owners[idx].map((m) => m.address),
                required,
                1
            )) {
                switch (step.key) {
                    case NormalSteps.SENT:
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.SUCCESS:
                        walletAddresses.push(step.address);
                        //console.log(`Address of MultiSigWallet: ${step.address}`);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
        }
    });

    it("deploy token", async () => {
        for (let idx = 0; idx < 3; idx++) {
            const contract = await ContractDeployer.deployToken(deployer, walletAddresses[idx]);
            //console.log(`Address of MultiSigToken: ${contract.address}`);
            tokenContracts.push(contract);
        }
    });

    it("Get number of wallet", async () => {
        const n1 = await client.multiSigWalletFactory.getNumberOfWalletsForMember(owner1.address);
        assert.deepStrictEqual(n1, 3);
        const n2 = await client.multiSigWalletFactory.getNumberOfWalletsForMember(owner2.address);
        assert.deepStrictEqual(n2, 2);
        const n3 = await client.multiSigWalletFactory.getNumberOfWalletsForMember(owner3.address);
        assert.deepStrictEqual(n3, 1);
    });

    it("Get wallet", async () => {
        const w1 = await client.multiSigWalletFactory.getWalletsForMember(owner1.address, 0, 3);
        assert.deepStrictEqual(
            w1.map((m) => m.address),
            [walletAddresses[0], walletAddresses[1], walletAddresses[2]]
        );
        const w2 = await client.multiSigWalletFactory.getWalletsForMember(owner2.address, 0, 2);
        assert.deepStrictEqual(
            w2.map((m) => m.address),
            [walletAddresses[0], walletAddresses[1]]
        );
        const w3 = await client.multiSigWalletFactory.getWalletsForMember(owner3.address, 0, 1);
        assert.deepStrictEqual(
            w3.map((m) => m.address),
            [walletAddresses[0]]
        );
    });

    it("getWalletInfo", async () => {
        const res = await client.multiSigWalletFactory.getWalletDetail(walletAddresses[0]);
        assert.deepStrictEqual(res.address, walletAddresses[0]);
        assert.deepStrictEqual(res.metadata.name, walletInfos[0].name);
        assert.deepStrictEqual(res.metadata.description, walletInfos[0].description);
    });

    it("initial mint", async () => {
        const amount = BigNumber.from("10000000000").mul(BigNumber.from(10).pow(BigNumber.from(18)));
        const encodedData = ABIStorage.encodeFunctionData("MultiSigToken", "mint", [amount]);
        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);
        for await (const step of client.multiSigWallet.submitTransaction(
            "",
            "",
            tokenContracts[0].address,
            0,
            encodedData
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);
    });

    it("transfer", async () => {
        const amount = BigNumber.from(10).pow(BigNumber.from(18));

        const encodedData = ABIStorage.encodeFunctionData("MultiSigToken", "transfer", [user1.address, amount]);

        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);

        for await (const step of client.multiSigWallet.submitTransaction(
            "",
            "",
            tokenContracts[0].address,
            0,
            encodedData
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        // Check balance of target
        assert.deepStrictEqual(await tokenContracts[0].balanceOf(user1.address), amount);
    });

    it("mint", async () => {
        const oldBalance = await tokenContracts[0].balanceOf(walletAddresses[0])

        const amount = BigNumber.from(100).mul(BigNumber.from(10).pow(BigNumber.from(18)));

        const encodedData = ABIStorage.encodeFunctionData("MultiSigToken", "mint", [amount]);

        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);

        for await (const step of client.multiSigWallet.submitTransaction(
            "",
            "",
            tokenContracts[0].address,
            0,
            encodedData
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        const newBalance = await tokenContracts[0].balanceOf(walletAddresses[0])
        // Check balance of target
        assert.deepStrictEqual(newBalance.sub(oldBalance), amount);
    });

    it("addMember", async () => {
        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[2]);

        for await (const step of client.multiSigWallet.submitTransactionAddMember("", "", owner2.address)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner4);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        // Check balance of target
        assert.deepStrictEqual(await client.multiSigWallet.getMembers(), [
            owner1.address,
            owner4.address,
            owner5.address,
            owner2.address
        ]);
    });

    it("removeMember", async () => {
        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[2]);

        for await (const step of client.multiSigWallet.submitTransactionRemoveMember("", "", owner5.address)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        // Check balance of target
        assert.deepStrictEqual(await client.multiSigWallet.getMembers(), [
            owner1.address,
            owner4.address,
            owner2.address
        ]);
    });

    it("replaceMember", async () => {
        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[2]);

        for await (const step of client.multiSigWallet.submitTransactionReplaceMember(
            "",
            "",
            owner4.address,
            owner3.address
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        // Check balance of target
        assert.deepStrictEqual(await client.multiSigWallet.getMembers(), [
            owner1.address,
            owner3.address,
            owner2.address
        ]);
    });

    it("transfer BOA", async () => {
        const deposit = BOACoin.make("100").value;
        await deployer.sendTransaction({
            to: walletAddresses[0],
            value: deposit
        });
        assert.deepStrictEqual(await deployment.provider.getBalance(walletAddresses[0]), deposit);

        const account = Wallet.createRandom();
        const amount = BOACoin.make("1").value;
        assert.deepStrictEqual(await deployment.provider.getBalance(account.address), BigNumber.from(0));

        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);

        for await (const step of client.multiSigWallet.submitTransactionNativeTransfer(
            "",
            "",
            account.address,
            amount
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        assert.deepStrictEqual(await deployment.provider.getBalance(account.address), amount);
    });

    it("transfer token", async () => {
        const account = Wallet.createRandom();
        const amount = BOACoin.make("1").value;
        assert.deepStrictEqual(await tokenContracts[0].balanceOf(account.address), BigNumber.from(0));

        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);

        for await (const step of client.multiSigWallet.submitTransactionTokenTransfer(
            "",
            "",
            tokenContracts[0].address,
            account.address,
            amount
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        assert.deepStrictEqual(await tokenContracts[0].balanceOf(account.address), amount);
    });

    it("approve token", async () => {
        const account = Wallet.createRandom();
        const amount = BOACoin.make("1").value;
        assert.deepStrictEqual(await tokenContracts[0].balanceOf(account.address), BigNumber.from(0));

        let transactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner1);
        client.multiSigWallet.attach(walletAddresses[0]);

        for await (const step of client.multiSigWallet.submitTransactionTokenApprove(
            "",
            "",
            tokenContracts[0].address,
            account.address,
            amount
        )) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    transactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(transactionId !== undefined);

        let executedTransactionId: BigNumber = BigNumber.from(-1);
        client.multiSigWallet.web3.useSigner(owner2);
        for await (const step of client.multiSigWallet.confirmTransaction(transactionId)) {
            switch (step.key) {
                case NormalSteps.SENT:
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.SUCCESS:
                    executedTransactionId = step.transactionId;
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        assert.ok(executedTransactionId !== undefined);

        // Check that transaction has been executed
        assert.deepStrictEqual(transactionId, executedTransactionId);

        assert.deepStrictEqual(await tokenContracts[0].allowance(walletAddresses[0], account.address), amount);
    });
});
