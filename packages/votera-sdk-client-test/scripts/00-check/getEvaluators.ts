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

    const length = await client.methods.getEvaluatorLengthOfManager();
    console.log(`Evaluator Length: ${length}`);

    const pageSize = 10;
    const evaluators: string[] = [];
    for (let idx = 0; idx < length; idx += pageSize) {
        const res = await client.methods.getEvaluatorListOfManager(idx, idx + pageSize, SortType.ASC);
        evaluators.push(...res);
    }
    let idx = 0;
    for (const evaluator of evaluators) {
        console.log(`Evaluator ${idx.toString(10).padStart(3, " ")}: ${evaluator}`);
        idx++;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
