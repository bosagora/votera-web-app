import * as dotenv from "dotenv";

import { ContextParams } from "../../src";

import { Wallet } from "@ethersproject/wallet";

dotenv.config({ path: "env/.env" });

export const web3EndpointsMainnet = {
    working: ["https://mainnet.bosagora.org/"],
    failing: ["https://bad-url-gateway.io/"]
};

export const web3EndpointsDevnet = {
    working: ["http://rpc.devnet.bosagora.org:8545/"],
    failing: ["https://bad-url-gateway.io/"]
};

export const TEST_WALLET = "d09672244a06a32f74d051e5adbbb62ae0eda27832a973159d475da6d53ba5c0";

export const contextParamsMainnet: ContextParams = {
    network: 2151,
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsMainnet.working
};

export const contextParamsDevnet: ContextParams = {
    network: 24680,
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsDevnet.working
};

export const contextParamsLocalChain: ContextParams = {
    network: 24680,
    signer: new Wallet(TEST_WALLET),
    web3Providers: ["http://localhost:8545"]
};

export const contextParamsFailing: ContextParams = {
    network: "mainnet",
    signer: new Wallet(TEST_WALLET),
    web3Providers: web3EndpointsMainnet.failing
};
