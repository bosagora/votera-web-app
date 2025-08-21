import {
    Client,
    Context,
} from "votera-sdk-client";
import {Deployments} from "../helper/Deployments";

async function main() {
    const deployments= new Deployments("http://127.0.0.1:8545");
    await deployments.attachAll();

    const ctx = new Context({...deployments.getContextParams(), signer: deployments.accounts.voters[0]});
    const client = new Client(ctx);

    const isUp = await client.methods.web3.isUp();
    console.log(`web3.isUp : ${isUp}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
