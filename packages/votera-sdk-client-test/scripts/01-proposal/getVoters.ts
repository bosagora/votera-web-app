import {
    Amount,
    Client,
    Context,
    ContractUtils,
    NormalSteps,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SystemProposalType,
    SortType,
    AssessmentResult,
    Candidate,
    VoteResult,
    ExecutionStates,
    ContextParams,
} from "votera-sdk-client";
import { Deployments, Helper } from "../helper/Deployments";

import { expect } from "chai";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({
        ...deployments.getContextParams(),
        signer: deployments.accounts.evaluators[0],
    });
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();

    const evaluatorLength = await client.methods.getEvaluatorLength(proposalId);
    console.log(`getEvaluatorLength: ${evaluatorLength}`);

    const voterLength = await client.methods.getVoterLength(proposalId);
    console.log(`getVoterLength: ${voterLength}`);

    const pageSize = 10;
    const voters: string[] = [];
    for (let idx = 0; idx < voterLength; idx += pageSize) {
        const res = await client.methods.getVoterList(proposalId, idx, idx + pageSize, SortType.ASC);
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
