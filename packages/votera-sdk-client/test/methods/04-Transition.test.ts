import { Server } from "ganache";
import { GanacheServer } from "../helper/GanacheServer";
import {
    Amount,
    AssessmentResult,
    Candidate,
    Client,
    Context,
    ContractUtils,
    ExecutionStates,
    NormalSteps,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SystemProposalType,
    VoteResult
} from "../../src";
import { Deployments } from "../helper/Deployments";

import { EvaluatorManager, ParticipantManager } from "votera-contracts-lib";

describe("Test for Transition", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;
    let endAssessTimeStamp: number;
    let endVoteTimeStamp: number;
    let evaluatorManager: EvaluatorManager;

    const proposalData = {
        proposalType: ProposalType.FUND,
        proposer: "",
        title: "proposal1",
        description: "This is a sample proposal.\nFor more information, please refer to the document",
        proposalId: ContractUtils.getRandomId(),
        fundAmount: Amount.make(1000000, 18).value,
        assessmentPeriod: 7,
        votePeriod: 14,
        documentId: ContractUtils.getRandomId(),
        systemType: SystemProposalType.NORMAL,
        params: []
    };

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
        evaluatorManager = deployments.getContract("EvaluatorManager") as EvaluatorManager;
        proposalData.proposer = deployments.accounts.voters[0].address;
    });

    afterAll(async () => {
        await server.close();
    });

    let client: Client;
    beforeAll(async () => {
        const ctx = new Context(deployments.getContextParams());
        client = new Client(ctx);
        client.useSigner(deployments.accounts.voters[0]);
    });

    it("Web3 Health Checking", async () => {
        const isUp = await client.methods.web3.isUp();
        expect(isUp).toEqual(true);
    });

    it("addParticipant", async () => {
        const size = 24;
        for (let idx = 0; idx < deployments.accounts.validators.length; idx += size) {
            await participantManager
                .connect(deployments.accounts.deployer)
                .addParticipants(deployments.accounts.validators.slice(idx, idx + size));
        }
    });

    it("addEvaluator", async () => {
        const size = 24;
        for (let idx = 0; idx < deployments.accounts.evaluators.length; idx += size) {
            await evaluatorManager
                .connect(deployments.accounts.owner)
                .addMembers(deployments.accounts.evaluators.slice(idx, idx + size).map((m) => m.address));
        }
    });

    it("createProposal", async () => {
        for await (const step of client.methods.createProposal(
            proposalData.proposalType,
            proposalData.title,
            proposalData.description,
            proposalData.proposalId,
            proposalData.fundAmount,
            proposalData.assessmentPeriod,
            proposalData.votePeriod,
            proposalData.documentId,
            proposalData.systemType,
            proposalData.params
        )) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.ASSESSMENT);
        const data = await client.methods.getProposal(proposalData.proposalId);
        endAssessTimeStamp = data.endAssess;
        endVoteTimeStamp = data.endVote;
    });

    it("postScore", async () => {
        for (const evaluator of deployments.accounts.evaluators) {
            client.useSigner(evaluator);
            for await (const step of client.methods.postScore(proposalData.proposalId, [10, 10, 5, 5, 5])) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
        }
    });

    it("getAssessmentSummary", async () => {
        expect(await client.methods.getScoreLength(proposalData.proposalId)).toEqual(
            deployments.accounts.evaluators.length
        );
        const summary = await client.methods.getAssessmentSummary(proposalData.proposalId);
        expect(summary).toEqual([
            10 * deployments.accounts.evaluators.length,
            10 * deployments.accounts.evaluators.length,
            5 * deployments.accounts.evaluators.length,
            5 * deployments.accounts.evaluators.length,
            5 * deployments.accounts.evaluators.length
        ]);
    });

    it("Increase time to end of assessment + 10", async () => {
        await deployments.blockTimestampIncreaseTo(endAssessTimeStamp + 10);
    });

    it("transition", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.transition(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }

        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
        expect(await client.methods.getAssessmentResult(proposalData.proposalId)).toEqual(AssessmentResult.APPROVED);
    });

    it("postBallot", async () => {
        for (const voter of deployments.accounts.voters) {
            client.useSigner(voter);
            for await (const step of client.methods.postBallot(proposalData.proposalId, Candidate.YES)) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData.proposalId);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
        }
    });

    it("getVoteSummary", async () => {
        expect(await client.methods.getVoteSummary(proposalData.proposalId)).toEqual([
            0,
            deployments.accounts.voters.length,
            0
        ]);
    });

    it("getBallotLength", async () => {
        expect(await client.methods.getBallotLength(proposalData.proposalId)).toEqual(
            deployments.accounts.voters.length
        );
    });

    it("Increase time to end of vote - 10", async () => {
        await deployments.blockTimestampIncreaseTo(endVoteTimeStamp - 10);
    });

    it("transition", async () => {
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
        for await (const step of client.methods.transition(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
        expect(await client.methods.canBeWithdrawn(proposalData.proposalId)).toEqual(false);
    });

    it("Increase time to end of vote + 10", async () => {
        await deployments.blockTimestampIncreaseTo(endVoteTimeStamp + 10);
    });

    it("transition", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.transition(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }

        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.EXECUTION);
        expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
        expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.NONE);
    });

    it("execution", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        expect(await client.methods.canBeWithdrawn(proposalData.proposalId)).toEqual(true);
        const balance1 = await deployments.provider.getBalance(deployments.accounts.voters[0].address);
        for await (const step of client.methods.execute(proposalData.proposalId)) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData.proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        const balance2 = await deployments.provider.getBalance(deployments.accounts.voters[0].address);
        expect(
            balance1
                .add(proposalData.fundAmount)
                .sub(balance2)
                .toNumber()
        ).toBeLessThan(1e18);
        expect(await client.methods.canBeWithdrawn(proposalData.proposalId)).toEqual(false);
    });

    it("getStates", async () => {
        expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.CLOSED);
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.FINISHED);
        expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.FINISHED);
    });
});
