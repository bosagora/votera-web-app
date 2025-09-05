import { BOACoin, Client, Context } from "votera-sdk-client";
import { Deployments, Helper } from "../helper/Deployments";

async function main() {
    const deployments = new Deployments();
    await deployments.attachAll();

    const ctx = new Context({ ...deployments.getContextParams(), signer: deployments.accounts.voters[0] });
    const client = new Client(ctx);

    const proposalId = Helper.loadProposalId();
    const data = await client.methods.getProposal(proposalId);

    console.log(`유   형: ${Helper.toStringOfProposalType(data.proposalType)}`);
    console.log(`제   목: ${data.title}`);
    console.log(`설   명: ${data.description}`);
    console.log(`제 안 자: ${data.proposer}`);
    console.log(`아 이 디: ${data.proposalId}`);
    console.log(`펀딩금액: ${new BOACoin(data.fundAmount).toDisplayString(true, 2)}`);
    console.log(`문   서: ${data.documentId}`);
    console.log(`사전평가 시작: ${new Date(data.beginAssess * 1000).toString()}`);
    console.log(`사전평가 종료: ${new Date(data.endAssess * 1000).toString()}`);
    console.log(`투표 시작: ${new Date(data.beginVote * 1000).toString()}`);
    console.log(`투표 종료: ${new Date(data.endVote * 1000).toString()}`);
    console.log(`states : ${Helper.toStringOfProposalStates(data.states)}`);
    console.log(`period : ${Helper.toStringOfProposalPeriod(data.period)}`);
    console.log(`사전평가 결과 : ${Helper.toStringOfAssessmentResult(data.assessmentResult)}`);
    console.log(`투표 결과 : ${Helper.toStringOfVoteResult(data.voteResult)}`);
    console.log(`실행 상태 : ${Helper.toStringOfExecutionStates(data.executionStates)}`);
    console.log(`투표비용전송 : ${data.sendVoteCost}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
