import ganache, { Server } from "ganache";
import * as dotenv from "dotenv";
import { contextParamsLocalChain } from "./constants";
import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";

dotenv.config({ path: "env/.env" });

export enum AccountIndex {
    DEPLOYER,
    OWNER1,
    OWNER2,
    OWNER3,
    USER1,
    USER2,
    USER3,
    USER4,
    USER5,
    USER6,
    USER7,
    USER8,
    USER9
}

export class GanacheServer {
    public static instance: Server;
    public static initialAccounts: any[];
    public static CHAIN_ID = 24680;
    public static PORT = 7545;

    public static async start() {
        if (GanacheServer.initialAccounts === undefined) {
            GanacheServer.initialAccounts = GanacheServer.CreateInitialAccounts();
        }

        GanacheServer.instance = ganache.server({
            chain: {
                chainId: GanacheServer.CHAIN_ID
            },
            miner: {
                blockGasLimit: 80000000,
                defaultGasPrice: 800
            },
            logging: {
                quiet: true
            },
            wallet: {
                accounts: GanacheServer.initialAccounts
            }
        });
        await GanacheServer.instance.listen(GanacheServer.PORT);
        return GanacheServer.instance;
    }

    public static CreateInitialAccounts(): any[] {
        const accounts: string[] = [];
        const reg_bytes64: RegExp = /^(0x)[0-9a-f]{64}$/i;

        // 0
        if (
            process.env.DEPLOYER !== undefined &&
            process.env.DEPLOYER.trim() !== "" &&
            reg_bytes64.test(process.env.DEPLOYER)
        ) {
            accounts.push(process.env.DEPLOYER);
        } else {
            process.env.DEPLOYER = Wallet.createRandom().privateKey;
            accounts.push(process.env.DEPLOYER);
        }

        // 1
        if (
            process.env.OWNER1 !== undefined &&
            process.env.OWNER1.trim() !== "" &&
            reg_bytes64.test(process.env.OWNER1)
        ) {
            accounts.push(process.env.OWNER1);
        } else {
            process.env.OWNER1 = Wallet.createRandom().privateKey;
            accounts.push(process.env.OWNER1);
        }

        // 2
        if (
            process.env.OWNER2 !== undefined &&
            process.env.OWNER2.trim() !== "" &&
            reg_bytes64.test(process.env.OWNER2)
        ) {
            accounts.push(process.env.OWNER2);
        } else {
            process.env.OWNER2 = Wallet.createRandom().privateKey;
            accounts.push(process.env.OWNER2);
        }

        // 3
        if (
            process.env.OWNER3 !== undefined &&
            process.env.OWNER3.trim() !== "" &&
            reg_bytes64.test(process.env.OWNER3)
        ) {
            accounts.push(process.env.OWNER3);
        } else {
            process.env.OWNER3 = Wallet.createRandom().privateKey;
            accounts.push(process.env.OWNER3);
        }

        while (accounts.length < 50) {
            accounts.push(Wallet.createRandom().privateKey);
        }

        return accounts.map((m) => {
            return {
                balance: "0x100000000000000000000",
                secretKey: m
            };
        });
    }

    public static accounts(): Wallet[] {
        if (GanacheServer.initialAccounts === undefined) {
            GanacheServer.initialAccounts = GanacheServer.CreateInitialAccounts();
        }
        return GanacheServer.initialAccounts.map((m) =>
            new Wallet(m.secretKey).connect(GanacheServer.createTestProvider())
        );
    }

    public static createTestProvider(): JsonRpcProvider {
        return new JsonRpcProvider(`http://localhost:${GanacheServer.PORT}`, GanacheServer.CHAIN_ID);
    }

    public static setTestProvider(provider: JsonRpcProvider) {
        contextParamsLocalChain.web3Providers = provider;
    }

    public static setTestWeb3Signer(signer: Signer) {
        contextParamsLocalChain.signer = signer;
    }
}
