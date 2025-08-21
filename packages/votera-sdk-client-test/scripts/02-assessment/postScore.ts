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
    ExecutionStates, ContextParams
} from "votera-sdk-client";
import {Deployments, Helper} from "../helper/Deployments";

import { expect } from "chai";

async function main() {
    const deployments= new Deployments("http://127.0.0.1:8545");
    await deployments.attachAll();

    const ctx = new Context({...deployments.getContextParams(), signer: deployments.accounts.evaluators[0]});
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();

    console.log(`Post Score`);
    for (const evaluator of deployments.accounts.evaluators) {
        client.useSigner(evaluator);
        console.log(`evaluator is ${evaluator.address}`);
        for await (const step of client.methods.postScore(proposalId, [10, 10, 5, 5, 5])) {
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

    const length = await client.methods.getScoreLength(proposalId);
    const summary = await client.methods.getAssessmentSummary(proposalId);
    console.log(`getScoreLength: ${length}`);
    console.log(`getAssessmentSummary: ${summary}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

