import { BOACoin, Client, Context } from "votera-sdk-client";
import { Deployments, Helper } from "../helper/Deployments";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const length = await client.methods.getProposalLength();

    console.log(`Length of proposals: ${length}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
