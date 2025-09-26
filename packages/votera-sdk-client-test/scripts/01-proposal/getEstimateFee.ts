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

    const proposalData = {
        proposalType: ProposalType.FUND,
        proposer: "",
        title: "BOSagora Mainnet",
        description: "ZeroOne",
        proposalId: ContractUtils.getRandomId(),
        fundAmount: Amount.make(150000000, 18).value,
        assessmentPeriod: 7,
        votePeriod: 14,
        documentId: "0x6427f8f5c0eaa2f4cb4b2916c04d173387d44cc55138faac4baa450f758ba1f6",
        systemType: SystemProposalType.NORMAL,
        params: [],
    };

    const ctx = new Context({
        ...deployments.getContextParams(),
        signer: deployments.accounts.voters[0],
    });
    const client = new Client(ctx);

    const address = deployments.accounts.voters[0].address;
    console.log(`address of voters: ${address}`);
    console.log(`address of client: ${await client.web3.getSigner()?.getAddress()}`);

    console.log(`is participant: ${await client.methods.isParticipant(address)}`);
    const provider = client.web3.getProvider();
    if (provider !== undefined) {
        const balance = await provider.getBalance(address);
        console.log(`balance of participant: ${new BOACoin(balance).toDisplayString(true, 2)}`);
    }

    const proposalFee = await client.estimation.getProposalFee(proposalData.proposalType, proposalData.fundAmount);
    console.log(`proposalFee: ${new BOACoin(proposalFee).toDisplayString(true, 6)}`);

    try {
        const feeValue = await client.estimation.createProposal(
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
        );
        console.log(`feeValue - max: ${feeValue.max}, average: ${feeValue.average}`);
    } catch (e) {
        console.error(e);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
