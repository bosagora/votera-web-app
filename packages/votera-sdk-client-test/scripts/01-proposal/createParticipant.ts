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

    const size = 30;
    let page = 0;
    const maxPage = Math.round(Math.ceil(deployments.accounts.validators.length / size));
    for (let idx = 0; idx < deployments.accounts.validators.length; idx += size) {
        console.log(`createParticipantPart: ${page + 1}/${maxPage}...`);
        await receptionController
            .connect(deployments.accounts.voters[0])
            .createParticipantPart(
                proposalCreateData[0].proposalId,
                idx,
                Math.min(idx + size, deployments.accounts.validators.length)
            );
        page++;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
