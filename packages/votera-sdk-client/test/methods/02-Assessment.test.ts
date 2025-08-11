import { Server } from "ganache";
import { GanacheServer } from "../helper/GanacheServer";

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
    SortType
} from "../../src";
import { Deployments } from "../helper/Deployments";
import { EvaluatorManager, ParticipantManager } from "votera-contracts-lib";

describe("Test for Assessment", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;
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

    it("isAvailableProposalId", async () => {
        expect(await client.methods.isAvailableProposalId(proposalData.proposalId)).toEqual(true);
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
        client.useSigner(deployments.accounts.voters[0]);
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
        expect(await client.methods.isAvailableProposalId(proposalData.proposalId)).toEqual(false);
    });

    it("getLength", async () => {
        expect(await client.methods.getProposalLength()).toEqual(1);
    });

    it("postScore", async () => {
        client.useSigner(deployments.accounts.evaluators[0]);
        for await (const step of client.methods.postScore(proposalData.proposalId, [5, 5, 5, 5, 5])) {
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

        client.useSigner(deployments.accounts.evaluators[1]);
        for await (const step of client.methods.postScore(proposalData.proposalId, [6, 6, 6, 6, 6])) {
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
        client.useSigner(deployments.accounts.evaluators[2]);
        for await (const step of client.methods.postScore(proposalData.proposalId, [7, 7, 7, 7, 7])) {
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
    });

    it("getScore", async () => {
        expect(
            (await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[0].address))
                .evaluator
        ).toEqual(deployments.accounts.evaluators[0].address);
        expect(
            (await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[1].address))
                .evaluator
        ).toEqual(deployments.accounts.evaluators[1].address);
        expect(
            (await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[2].address))
                .evaluator
        ).toEqual(deployments.accounts.evaluators[2].address);

        expect(
            (
                await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[0].address)
            ).items.map((m) => m)
        ).toEqual([5, 5, 5, 5, 5]);
        expect(
            (
                await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[1].address)
            ).items.map((m) => m)
        ).toEqual([6, 6, 6, 6, 6]);
        expect(
            (
                await client.methods.getScore(proposalData.proposalId, deployments.accounts.evaluators[2].address)
            ).items.map((m) => m)
        ).toEqual([7, 7, 7, 7, 7]);
    });
    it("getAssessmentSummary", async () => {
        const summary = await client.methods.getAssessmentSummary(proposalData.proposalId);
        expect(summary.map((m) => m)).toEqual([18, 18, 18, 18, 18]);
    });

    it("getScoreLength", async () => {
        expect(await client.methods.getScoreLength(proposalData.proposalId)).toEqual(3);
    });

    it("getScoreList", async () => {
        expect(
            (await client.methods.getScoreList(proposalData.proposalId, 0, 1, SortType.ASC)).map((m) => m.evaluator)
        ).toEqual([deployments.accounts.evaluators[0].address]);
        expect(
            (await client.methods.getScoreList(proposalData.proposalId, 0, 2, SortType.ASC)).map((m) => m.evaluator)
        ).toEqual([deployments.accounts.evaluators[0].address, deployments.accounts.evaluators[1].address]);
        expect(
            (await client.methods.getScoreList(proposalData.proposalId, 1, 3, SortType.ASC)).map((m) => m.evaluator)
        ).toEqual([deployments.accounts.evaluators[1].address, deployments.accounts.evaluators[2].address]);
        expect(
            (await client.methods.getScoreList(proposalData.proposalId, 0, 3, SortType.ASC)).map((m) => m.evaluator)
        ).toEqual([
            deployments.accounts.evaluators[0].address,
            deployments.accounts.evaluators[1].address,
            deployments.accounts.evaluators[2].address
        ]);
        expect(
            (await client.methods.getScoreList(proposalData.proposalId, 0, 4, SortType.ASC)).map((m) => m.evaluator)
        ).toEqual([
            deployments.accounts.evaluators[0].address,
            deployments.accounts.evaluators[1].address,
            deployments.accounts.evaluators[2].address
        ]);
    });

    it("postComment", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.postComment(proposalData.proposalId, "0")) {
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

        client.useSigner(deployments.accounts.voters[1]);
        for await (const step of client.methods.postComment(proposalData.proposalId, "1")) {
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

        client.useSigner(deployments.accounts.voters[2]);
        for await (const step of client.methods.postComment(proposalData.proposalId, "2")) {
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
    });

    it("getCommentLength", async () => {
        expect(await client.methods.getCommentLength(proposalData.proposalId)).toEqual(3);
    });

    it("getCommentList", async () => {
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 0, 1, SortType.ASC)).map((m) => m.message)
        ).toEqual(["0"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 1, 2, SortType.ASC)).map((m) => m.message)
        ).toEqual(["1"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 2, 3, SortType.ASC)).map((m) => m.message)
        ).toEqual(["2"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 0, 2, SortType.ASC)).map((m) => m.message)
        ).toEqual(["0", "1"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 1, 3, SortType.ASC)).map((m) => m.message)
        ).toEqual(["1", "2"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 0, 3, SortType.ASC)).map((m) => m.message)
        ).toEqual(["0", "1", "2"]);
        expect(
            (await client.methods.getCommentList(proposalData.proposalId, 0, 4, SortType.ASC)).map((m) => m.message)
        ).toEqual(["0", "1", "2"]);
    });
});
