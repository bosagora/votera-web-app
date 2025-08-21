import {
    Client,
    Context,
} from "votera-sdk-client";
import {Deployments, Helper} from "../helper/Deployments";

const beautify = require("beautify");

async function main() {
    const deployments= new Deployments("http://127.0.0.1:8545");
    await deployments.attachAll();

    const ctx = new Context({...deployments.getContextParams(), signer: deployments.accounts.voters[0]});
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();
    const data = await client.methods.getProposal(proposalId);

    console.log(`type : ${Helper.toStringOfProposalType(data.proposalType)}`);
    console.log(`states : ${Helper.toStringOfProposalStates(data.states)}`);
    console.log(`period : ${Helper.toStringOfProposalPeriod(data.period)}`);
    console.log(`assessmentResult : ${Helper.toStringOfAssessmentResult(data.assessmentResult)}`);
    console.log(`voteResult : ${Helper.toStringOfVoteResult(data.voteResult)}`);
    console.log(`executionStates : ${Helper.toStringOfExecutionStates(data.executionStates)}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

