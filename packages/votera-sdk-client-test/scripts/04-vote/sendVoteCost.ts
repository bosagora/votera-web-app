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

    const voterLengthOfManager = await client.methods.getVoterLengthOfManager();
    console.log(`getVoterLengthOfManager: ${voterLengthOfManager}`);

    const size = 30;
    let page = 0;
    const maxPage = Math.round(Math.ceil(voterLengthOfManager / size));
    for (let idx = 0; idx < voterLengthOfManager; idx += size) {
        for await (const step of await client.methods.sendVoteCostPart(
            proposalId,
            idx,
            Math.min(idx + size, deployments.accounts.validators.length)
        )) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).equal(proposalId);
                    break;
                case NormalSteps.SENT:
                    console.log(`sendVoteCostPart: ${page + 1}/${maxPage} - ${step.txHash}...`);
                    expect(step.proposalId).equal(proposalId);
                    expect(step.txHash).match(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).equal(proposalId);
                    Helper.storeProposalId(proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        page++;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
