import { BOACoin, Client, Context } from "votera-sdk-client";
import { Deployments } from "../helper/Deployments";

import { IssuedContract } from "votera-contracts-lib";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({
        ...deployments.getContextParams(),
        signer: deployments.accounts.evaluators[0],
    });
    const client = new Client(ctx);
    const contract = deployments.getContract("IssuedContract") as IssuedContract;
    const provider = client.web3.getProvider();
    if (provider !== undefined) {
        console.log(`Address: ${contract.address}`);
        const balance = await provider.getBalance(contract.address);
        console.log(`Balance: ${new BOACoin(balance).toDisplayString(true, 2)}`);
        console.log(`Owner: ${await contract.connect(provider).getOwner()}`);
        console.log(`CommonsBudgetAddress: ${await contract.connect(provider).getCommonsBudgetAddress()}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
