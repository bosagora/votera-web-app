import { Server } from "ganache";
import { GanacheServer } from "../helper/GanacheServer";
import {
    Amount,
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

import { ParticipantManager } from "votera-contracts-lib";

import { BigNumber } from "@ethersproject/bignumber";

describe("Test for System Params", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;
    let endVoteTimeStamp: number;

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
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

    describe("VoteCost", () => {
        const proposalData = {
            proposalType: ProposalType.SYSTEM,
            title: "proposal1",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(0, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.PARAMETER,
            params: [
                {
                    name: "VoteCost",
                    value: BigNumber.from(10).pow(BigNumber.from(18)),
                    multiple: BigNumber.from(1)
                }
            ]
        };

        it("Web3 Health Checking", async () => {
            const isUp = await client.methods.web3.isUp();
            expect(isUp).toEqual(true);
        });

        it("addParticipant", async () => {
            const size = 12;
            for (let idx = 0; idx < deployments.accounts.validators.length; idx += size) {
                await participantManager
                    .connect(deployments.accounts.deployer)
                    .addParticipants(deployments.accounts.validators.slice(idx, idx + size));
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
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
            const data = await client.methods.getProposal(proposalData.proposalId);
            endVoteTimeStamp = data.endVote;
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
        });

        it("check proposal", async () => {
            expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.CLOSED);
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.FINISHED);
            expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
            expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.FINISHED);
        });

        it("check param", async () => {
            const paramValue = await client.methods.getVoteCost();
            expect(paramValue.value).toEqual(BigNumber.from(10).pow(BigNumber.from(18)));
            expect(paramValue.multiple).toEqual(BigNumber.from(1));
        });
    });

    describe("AssessmentAverage / AssessmentIndividual", () => {
        const proposalData = {
            proposalType: ProposalType.SYSTEM,
            title: "proposal1",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(0, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.PARAMETER,
            params: [
                {
                    name: "AssessmentAverage",
                    value: BigNumber.from(6),
                    multiple: BigNumber.from(1)
                },
                {
                    name: "AssessmentIndividual",
                    value: BigNumber.from(4),
                    multiple: BigNumber.from(1)
                }
            ]
        };

        it("Web3 Health Checking", async () => {
            const isUp = await client.methods.web3.isUp();
            expect(isUp).toEqual(true);
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
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
            const data = await client.methods.getProposal(proposalData.proposalId);
            endVoteTimeStamp = data.endVote;
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
        });

        it("check proposal", async () => {
            expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.CLOSED);
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.FINISHED);
            expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
            expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.FINISHED);
        });

        it("check param", async () => {
            const paramValue1 = await client.methods.getAssessmentAverage();
            expect(paramValue1.value).toEqual(BigNumber.from(6));
            expect(paramValue1.multiple).toEqual(BigNumber.from(1));
            const paramValue2 = await client.methods.getAssessmentIndividual();
            expect(paramValue2.value).toEqual(BigNumber.from(4));
            expect(paramValue2.multiple).toEqual(BigNumber.from(1));
        });
    });

    describe("VoteQuorumFactor / ApprovalDiffPercen", () => {
        const proposalData = {
            proposalType: ProposalType.SYSTEM,
            title: "proposal1",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(0, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.PARAMETER,
            params: [
                {
                    name: "VoteQuorumFactor",
                    value: BigNumber.from(500),
                    multiple: BigNumber.from(1000)
                },
                {
                    name: "ApprovalDiffPercent",
                    value: BigNumber.from(15),
                    multiple: BigNumber.from(100)
                }
            ]
        };

        it("Web3 Health Checking", async () => {
            const isUp = await client.methods.web3.isUp();
            expect(isUp).toEqual(true);
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
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
            const data = await client.methods.getProposal(proposalData.proposalId);
            endVoteTimeStamp = data.endVote;
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
        });

        it("check proposal", async () => {
            expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.CLOSED);
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.FINISHED);
            expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
            expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.FINISHED);
        });

        it("check param", async () => {
            const paramValue1 = await client.methods.getVoteQuorumFactor();
            expect(paramValue1.value).toEqual(BigNumber.from(500));
            expect(paramValue1.multiple).toEqual(BigNumber.from(1000));
            const paramValue2 = await client.methods.getApprovalDiffPercent();
            expect(paramValue2.value).toEqual(BigNumber.from(15));
            expect(paramValue2.multiple).toEqual(BigNumber.from(100));
        });
    });

    describe("FundProposalFee / SystemProposalFee", () => {
        const proposalData = {
            proposalType: ProposalType.SYSTEM,
            title: "proposal1",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(0, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.PARAMETER,
            params: [
                {
                    name: "FundProposalFee",
                    value: BigNumber.from(1),
                    multiple: BigNumber.from(100)
                },
                {
                    name: "SystemProposalFee",
                    value: BigNumber.from(1000).mul(BigNumber.from(10).pow(BigNumber.from(18))),
                    multiple: BigNumber.from(1)
                }
            ]
        };

        it("Web3 Health Checking", async () => {
            const isUp = await client.methods.web3.isUp();
            expect(isUp).toEqual(true);
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
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
            const data = await client.methods.getProposal(proposalData.proposalId);
            endVoteTimeStamp = data.endVote;
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
        });

        it("check proposal", async () => {
            expect(await client.methods.getStates(proposalData.proposalId)).toEqual(ProposalStates.CLOSED);
            expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.FINISHED);
            expect(await client.methods.getVoteResult(proposalData.proposalId)).toEqual(VoteResult.APPROVED);
            expect(await client.methods.getExecutionStates(proposalData.proposalId)).toEqual(ExecutionStates.FINISHED);
        });

        it("check param", async () => {
            const paramValue1 = await client.methods.getFundProposalFee();
            expect(paramValue1.value).toEqual(BigNumber.from(1));
            expect(paramValue1.multiple).toEqual(BigNumber.from(100));
            const paramValue2 = await client.methods.getSystemProposalFee();
            expect(paramValue2.value).toEqual(BigNumber.from(1000).mul(BigNumber.from(10).pow(BigNumber.from(18))));
            expect(paramValue2.multiple).toEqual(BigNumber.from(1));
        });
    });
});
