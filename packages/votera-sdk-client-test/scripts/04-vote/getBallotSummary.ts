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

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();

    const length = await client.methods.getBallotLength(proposalId);
    const summary = await client.methods.getVoteSummary(proposalId);
    console.log(`getBallotLength: ${length}`);
    console.log(`getVoteSummary: ${summary}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
