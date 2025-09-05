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

    console.log(`Post Ballot`);
    for (const voter of deployments.accounts.voters) {
        client.useSigner(voter);
        console.log(`voter is ${voter.address}`);
        for await (const step of client.methods.postBallot(proposalId, Candidate.YES)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).equal(proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).equal(proposalId);
                    expect(step.txHash).match(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).equal(proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
    }
    const length = await client.methods.getBallotLength(proposalId);
    const summary = await client.methods.getVoteSummary(proposalId);
    console.log(`getBallotLength: ${length}`);
    console.log(`getVoteSummary: ${summary}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
