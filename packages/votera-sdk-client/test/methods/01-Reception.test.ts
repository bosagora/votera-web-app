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
import { ParticipantManager } from "votera-contracts-lib";

describe("Test for Reception - Business proposal", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;

    const proposalData = [
        {
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
        },
        {
            proposalType: ProposalType.FUND,
            proposer: "",
            title: "proposal2",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(1000000, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.NORMAL,
            params: []
        },
        {
            proposalType: ProposalType.FUND,
            proposer: "",
            title: "proposal3",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(1000000, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.NORMAL,
            params: []
        }
    ];

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
        proposalData[0].proposer = deployments.accounts.voters[0].address;
        proposalData[1].proposer = deployments.accounts.voters[1].address;
        proposalData[2].proposer = deployments.accounts.voters[2].address;
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
        expect(await client.methods.isAvailableProposalId(proposalData[0].proposalId)).toEqual(true);
    });

    it("addParticipant", async () => {
        const size = 24;
        for (let idx = 0; idx < deployments.accounts.validators.length; idx += size) {
            await participantManager
                .connect(deployments.accounts.deployer)
                .addParticipants(deployments.accounts.validators.slice(idx, idx + size));
        }
    });

    it("createProposal", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.createProposal(
            proposalData[0].proposalType,
            proposalData[0].title,
            proposalData[0].description,
            proposalData[0].proposalId,
            proposalData[0].fundAmount,
            proposalData[0].assessmentPeriod,
            proposalData[0].votePeriod,
            proposalData[0].documentId,
            proposalData[0].systemType,
            proposalData[0].params
        )) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        expect(await client.methods.getStates(proposalData[0].proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData[0].proposalId)).toEqual(ProposalPeriod.ASSESSMENT);
        expect(await client.methods.isAvailableProposalId(proposalData[0].proposalId)).toEqual(false);
    });

    it("getLength", async () => {
        expect(await client.methods.getProposalLength()).toEqual(1);
    });

    it("getProposal", async () => {
        expect((await client.methods.getProposal(proposalData[0].proposalId)).proposalId).toEqual(
            proposalData[0].proposalId
        );
    });

    it("getProposalByIndex", async () => {
        expect((await client.methods.getProposalByIndex(0, SortType.ASC)).proposalId).toEqual(
            proposalData[0].proposalId
        );
    });

    it("not exists item", async () => {
        const notExistId = ContractUtils.getRandomId();
        await expect(client.methods.getProposal(notExistId)).rejects.toThrow(
            "Proposal not found: No data exists for the given proposal ID."
        );
        const notExistIndex = (await client.methods.getProposalLength()) + 1;
        await expect(client.methods.getProposalByIndex(notExistIndex, SortType.ASC)).rejects.toThrow(
            "Index out of bounds: The requested index exceeds array limits."
        );
    });

    it("createProposal others", async () => {
        for (let idx = 1; idx < 3; idx++) {
            client.useSigner(deployments.accounts.voters[idx]);
            for await (const step of client.methods.createProposal(
                proposalData[idx].proposalType,
                proposalData[idx].title,
                proposalData[idx].description,
                proposalData[idx].proposalId,
                proposalData[idx].fundAmount,
                proposalData[idx].assessmentPeriod,
                proposalData[idx].votePeriod,
                proposalData[idx].documentId,
                proposalData[idx].systemType,
                proposalData[idx].params
            )) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
            expect(await client.methods.isAvailableProposalId(proposalData[idx].proposalId)).toEqual(false);
        }
    });

    it("getProposalList", async () => {
        expect((await client.methods.getProposalList(0, 1, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title
        ]);
        expect((await client.methods.getProposalList(0, 2, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title
        ]);
        expect((await client.methods.getProposalList(1, 2, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[1].title
        ]);
        expect((await client.methods.getProposalList(1, 3, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[1].title,
            proposalData[2].title
        ]);
        expect((await client.methods.getProposalList(0, 3, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title,
            proposalData[2].title
        ]);
        expect((await client.methods.getProposalList(0, 4, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title,
            proposalData[2].title
        ]);
    });
});

describe("Test for Reception - System proposal", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;

    const proposalData = [
        {
            proposalType: ProposalType.SYSTEM,
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
        },
        {
            proposalType: ProposalType.SYSTEM,
            proposer: "",
            title: "proposal2",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(1000000, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.NORMAL,
            params: []
        },
        {
            proposalType: ProposalType.SYSTEM,
            proposer: "",
            title: "proposal3",
            description: "This is a sample proposal.\nFor more information, please refer to the document",
            proposalId: ContractUtils.getRandomId(),
            fundAmount: Amount.make(1000000, 18).value,
            assessmentPeriod: 7,
            votePeriod: 14,
            documentId: ContractUtils.getRandomId(),
            systemType: SystemProposalType.NORMAL,
            params: []
        }
    ];

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
        proposalData[0].proposer = deployments.accounts.voters[0].address;
        proposalData[1].proposer = deployments.accounts.voters[1].address;
        proposalData[2].proposer = deployments.accounts.voters[2].address;
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
        expect(await client.methods.isAvailableProposalId(proposalData[0].proposalId)).toEqual(true);
    });

    it("addParticipant", async () => {
        const size = 24;
        for (let idx = 0; idx < deployments.accounts.validators.length; idx += size) {
            await participantManager
                .connect(deployments.accounts.deployer)
                .addParticipants(deployments.accounts.validators.slice(idx, idx + size));
        }

        for (const elem of deployments.accounts.validators) {
            expect(await client.methods.getVoterOf(elem.validatorKey)).toEqual(elem.voter);
            expect(await client.methods.getValidatorKeyOf(elem.voter)).toEqual(elem.validatorKey);
        }
    });

    it("createProposal", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.createProposal(
            proposalData[0].proposalType,
            proposalData[0].title,
            proposalData[0].description,
            proposalData[0].proposalId,
            proposalData[0].fundAmount,
            proposalData[0].assessmentPeriod,
            proposalData[0].votePeriod,
            proposalData[0].documentId,
            proposalData[0].systemType,
            proposalData[0].params
        )) {
            switch (step.key) {
                case NormalSteps.PREPARED:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    break;
                case NormalSteps.SENT:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                    break;
                case NormalSteps.DONE:
                    expect(step.proposalId).toEqual(proposalData[0].proposalId);
                    break;
                default:
                    throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
            }
        }
        expect(await client.methods.getStates(proposalData[0].proposalId)).toEqual(ProposalStates.OPENED);
        expect(await client.methods.getPeriod(proposalData[0].proposalId)).toEqual(ProposalPeriod.VOTE);
        expect(await client.methods.isAvailableProposalId(proposalData[0].proposalId)).toEqual(false);
    });

    it("getLength", async () => {
        expect(await client.methods.getProposalLength()).toEqual(1);
    });

    it("getProposal", async () => {
        expect((await client.methods.getProposal(proposalData[0].proposalId)).proposalId).toEqual(
            proposalData[0].proposalId
        );
    });

    it("getProposalByIndex", async () => {
        expect((await client.methods.getProposalByIndex(0, SortType.ASC)).proposalId).toEqual(
            proposalData[0].proposalId
        );
    });

    it("not exists item", async () => {
        const notExistId = ContractUtils.getRandomId();
        await expect(client.methods.getProposal(notExistId)).rejects.toThrow(
            "Proposal not found: No data exists for the given proposal ID."
        );
        const notExistIndex = (await client.methods.getProposalLength()) + 1;
        await expect(client.methods.getProposalByIndex(notExistIndex, SortType.ASC)).rejects.toThrow(
            "Index out of bounds: The requested index exceeds array limits."
        );
    });

    it("createProposal others", async () => {
        for (let idx = 1; idx < 3; idx++) {
            client.useSigner(deployments.accounts.voters[idx]);
            for await (const step of client.methods.createProposal(
                proposalData[idx].proposalType,
                proposalData[idx].title,
                proposalData[idx].description,
                proposalData[idx].proposalId,
                proposalData[idx].fundAmount,
                proposalData[idx].assessmentPeriod,
                proposalData[idx].votePeriod,
                proposalData[idx].documentId,
                proposalData[idx].systemType,
                proposalData[idx].params
            )) {
                switch (step.key) {
                    case NormalSteps.PREPARED:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        break;
                    case NormalSteps.SENT:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        expect(step.txHash).toMatch(/^0x[A-Fa-f0-9]{64}$/i);
                        break;
                    case NormalSteps.DONE:
                        expect(step.proposalId).toEqual(proposalData[idx].proposalId);
                        break;
                    default:
                        throw new Error("Unexpected step: " + JSON.stringify(step, null, 2));
                }
            }
            expect(await client.methods.isAvailableProposalId(proposalData[idx].proposalId)).toEqual(false);
        }
    });

    it("getProposalList", async () => {
        expect((await client.methods.getProposalList(0, 1, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title
        ]);
        expect((await client.methods.getProposalList(0, 2, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title
        ]);
        expect((await client.methods.getProposalList(1, 2, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[1].title
        ]);
        expect((await client.methods.getProposalList(1, 3, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[1].title,
            proposalData[2].title
        ]);
        expect((await client.methods.getProposalList(0, 3, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title,
            proposalData[2].title
        ]);
        expect((await client.methods.getProposalList(0, 4, SortType.ASC)).map((m) => m.title)).toEqual([
            proposalData[0].title,
            proposalData[1].title,
            proposalData[2].title
        ]);
    });
});
