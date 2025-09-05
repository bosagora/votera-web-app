import { Client, Context, SortType } from "votera-sdk-client";
import { Deployments } from "../helper/Deployments";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({
        ...deployments.getContextParams(),
        signer: deployments.accounts.evaluators[0],
    });
    const client = new Client(ctx);

    const length = await client.methods.getVoterLengthOfManager();
    console.log(`Voter Length: ${length}`);

    const pageSize = 10;
    const voters: string[] = [];
    for (let idx = 0; idx < length; idx += pageSize) {
        const res = await client.methods.getVoterListOfManager(idx, idx + pageSize, SortType.ASC);
        voters.push(...res);
    }
    let idx = 0;
    for (const voter of voters) {
        console.log(`Voter ${idx.toString(10).padStart(3, " ")}: ${voter}`);
        idx++;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
