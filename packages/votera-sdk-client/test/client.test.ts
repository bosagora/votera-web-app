import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Client, Context } from "../src";
import { contextParamsTestnet, web3EndpointsTestnet } from "./helper/constants";

describe("Client", () => {
    describe("Client instances", () => {
        it("Should create a working client", async () => {
            const ctx = new Context(contextParamsTestnet);
            const client = new Client(ctx);

            expect(client).toBeInstanceOf(Client);
            expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
            expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

            const web3Status = await client.web3.isUp();
            expect(web3Status).toEqual(true);
        });

        it("Should create a failing client", async () => {
            contextParamsTestnet.web3Providers = web3EndpointsTestnet.failing;
            const context = new Context(contextParamsTestnet);
            const client = new Client(context);

            expect(client).toBeInstanceOf(Client);
            expect(client.web3.getProvider()).toBeInstanceOf(JsonRpcProvider);
            expect(client.web3.getConnectedSigner()).toBeInstanceOf(Wallet);

            const web3Status = await client.web3.isUp();
            expect(web3Status).toEqual(false);
        });
    });
});
