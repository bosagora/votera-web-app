import { Client, Context, SortType } from "votera-sdk-client";
import { Deployments } from "../helper/Deployments";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const length = await client.methods.getProposalLength();
    console.log(`Length of proposals: ${length}`);

    const res = await client.methods.getProposalList(0, 10, SortType.DSC);
    console.log(`Length of list: ${res.length}`);
    console.log(`List of proposals: ${JSON.stringify(res)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
