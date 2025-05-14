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

describe("Test for Vote", () => {
    const [, owner] = GanacheServer.accounts();
    let deployments: Deployments;
    let server: Server;
    let participantManager: ParticipantManager;

    const proposalData = {
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
    };

    beforeAll(async () => {
        server = await GanacheServer.start();
        GanacheServer.setTestWeb3Signer(owner);
        deployments = new Deployments();
        await deployments.doDeployAll();
        participantManager = deployments.getContract("ParticipantManager") as ParticipantManager;
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
        expect(await client.methods.getPeriod(proposalData.proposalId)).toEqual(ProposalPeriod.VOTE);
        expect(await client.methods.isAvailableProposalId(proposalData.proposalId)).toEqual(false);
    });

    it("getLength", async () => {
        expect(await client.methods.getProposalLength()).toEqual(1);
    });

    it("getVoterLength", async () => {
        expect(await client.methods.getVoterLength(proposalData.proposalId)).toEqual(
            deployments.accounts.voters.length
        );
    });

    it("getVoterByIndex", async () => {
        expect(await client.methods.getVoterByIndex(proposalData.proposalId, 0, SortType.ASC)).toEqual(
            deployments.accounts.voters[0].address
        );
        expect(await client.methods.getVoterByIndex(proposalData.proposalId, 1, SortType.ASC)).toEqual(
            deployments.accounts.voters[1].address
        );
        expect(await client.methods.getVoterByIndex(proposalData.proposalId, 2, SortType.ASC)).toEqual(
            deployments.accounts.voters[2].address
        );
    });

    it("getVoterList", async () => {
        expect(await client.methods.getVoterList(proposalData.proposalId, 0, 1, SortType.ASC)).toEqual([
            deployments.accounts.voters[0].address
        ]);
        expect(await client.methods.getVoterList(proposalData.proposalId, 0, 2, SortType.ASC)).toEqual([
            deployments.accounts.voters[0].address,
            deployments.accounts.voters[1].address
        ]);
        expect(await client.methods.getVoterList(proposalData.proposalId, 1, 2, SortType.ASC)).toEqual([
            deployments.accounts.voters[1].address
        ]);
        expect(await client.methods.getVoterList(proposalData.proposalId, 1, 3, SortType.ASC)).toEqual([
            deployments.accounts.voters[1].address,
            deployments.accounts.voters[2].address
        ]);
        expect(await client.methods.getVoterList(proposalData.proposalId, 0, 3, SortType.ASC)).toEqual([
            deployments.accounts.voters[0].address,
            deployments.accounts.voters[1].address,
            deployments.accounts.voters[2].address
        ]);
        expect(await client.methods.getVoterList(proposalData.proposalId, 0, 4, SortType.ASC)).toEqual([
            deployments.accounts.voters[0].address,
            deployments.accounts.voters[1].address,
            deployments.accounts.voters[2].address,
            deployments.accounts.voters[3].address
        ]);
    });

    it("isVoter", async () => {
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.voters[3].address)).toEqual(
            true
        );
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.voters[4].address)).toEqual(
            true
        );
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.voters[5].address)).toEqual(
            true
        );
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.users[0].address)).toEqual(
            false
        );
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.users[1].address)).toEqual(
            false
        );
        expect(await client.methods.isVoter(proposalData.proposalId, deployments.accounts.users[2].address)).toEqual(
            false
        );
    });

    it("postBallot", async () => {
        client.useSigner(deployments.accounts.voters[0]);
        for await (const step of client.methods.postBallot(proposalData.proposalId, 0)) {
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
        for await (const step of client.methods.postBallot(proposalData.proposalId, 1)) {
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
        for await (const step of client.methods.postBallot(proposalData.proposalId, 2)) {
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

    it("getBallot", async () => {
        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[0].address)).voter
        ).toEqual(deployments.accounts.voters[0].address);
        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[1].address)).voter
        ).toEqual(deployments.accounts.voters[1].address);
        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[2].address)).voter
        ).toEqual(deployments.accounts.voters[2].address);

        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[0].address)).choice
        ).toEqual(0);
        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[1].address)).choice
        ).toEqual(1);
        expect(
            (await client.methods.getBallot(proposalData.proposalId, deployments.accounts.voters[2].address)).choice
        ).toEqual(2);
    });

    it("getVoteSummary", async () => {
        expect((await client.methods.getVoteSummary(proposalData.proposalId)).map((m) => m)).toEqual([1, 1, 1]);
    });

    it("getBallotLength", async () => {
        expect(await client.methods.getBallotLength(proposalData.proposalId)).toEqual(3);
    });

    it("getBallotList", async () => {
        expect(
            (await client.methods.getBallotList(proposalData.proposalId, 0, 1, SortType.ASC)).map((m) => m.voter)
        ).toEqual([deployments.accounts.voters[0].address]);

        expect(
            (await client.methods.getBallotList(proposalData.proposalId, 0, 2, SortType.ASC)).map((m) => m.voter)
        ).toEqual([deployments.accounts.voters[0].address, deployments.accounts.voters[1].address]);
        expect(
            (await client.methods.getBallotList(proposalData.proposalId, 1, 3, SortType.ASC)).map((m) => m.voter)
        ).toEqual([deployments.accounts.voters[1].address, deployments.accounts.voters[2].address]);
        expect(
            (await client.methods.getBallotList(proposalData.proposalId, 0, 3, SortType.ASC)).map((m) => m.voter)
        ).toEqual([
            deployments.accounts.voters[0].address,
            deployments.accounts.voters[1].address,
            deployments.accounts.voters[2].address
        ]);
        expect(
            (await client.methods.getBallotList(proposalData.proposalId, 0, 4, SortType.ASC)).map((m) => m.voter)
        ).toEqual([
            deployments.accounts.voters[0].address,
            deployments.accounts.voters[1].address,
            deployments.accounts.voters[2].address
        ]);
    });
});
