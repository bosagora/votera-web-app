import { Client, Context, SortType, VoteBallotData } from "votera-sdk-client";
import { Deployments, Helper } from "../helper/Deployments";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({
        ...deployments.getContextParams(),
        signer: deployments.accounts.evaluators[0],
    });
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();

    const length = await client.methods.getVoterLength(proposalId);
    console.log(`getVoterLength: ${length}`);

    const pageSize = 10;
    const ballots: VoteBallotData[] = [];
    for (let idx = 0; idx < length; idx += pageSize) {
        const res = await client.methods.getBallotOfAllMembersList(proposalId, idx, idx + pageSize, SortType.ASC);
        ballots.push(...res);
    }
    for (const ballot of ballots) {
        console.log(`----`);
        console.log(`Address: ${ballot.voter}`);
        console.log(`Validator Key: ${ballot.validatorKey}`);
        console.log(`Timestamp: ${ballot.timestamp}`);
        console.log(`Choice: ${JSON.stringify(ballot.choice)}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
