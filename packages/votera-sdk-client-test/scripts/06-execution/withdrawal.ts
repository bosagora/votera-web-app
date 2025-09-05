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
    BOACoin,
} from "votera-sdk-client";
import { Deployments, Helper } from "../helper/Deployments";

import { expect } from "chai";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();
    const withdrawal = await client.methods.canBeWithdrawn(proposalId);
    console.log(`인출가능여부 : ${withdrawal}`);

    const balance1 = await deployments.provider.getBalance(deployments.accounts.voters[0].address);
    console.log(`인출전 제안자의 잔고: ${new BOACoin(balance1).toDisplayString(true, 2)}`);
    for await (const step of client.methods.execute(proposalId)) {
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
    const balance2 = await deployments.provider.getBalance(deployments.accounts.voters[0].address);
    console.log(`인출후 제안자의 잔고: ${new BOACoin(balance2).toDisplayString(true, 2)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
