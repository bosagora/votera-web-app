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
} from 'votera-sdk-client';
import {Deployments, Helper} from '../helper/Deployments';

import {expect} from 'chai';

async function main() {
  const deployments = new Deployments('http://127.0.0.1:8545');
  await deployments.attachAll();

  const proposalData = {
    proposalType: ProposalType.FUND,
    proposer: '',
    title: 'proposal1',
    description:
      'This is a sample proposal.\nFor more information, please refer to the document',
    proposalId: ContractUtils.getRandomId(),
    fundAmount: Amount.make(1000000, 18).value,
    assessmentPeriod: 20,
    votePeriod: 100,
    documentId: ContractUtils.getRandomId(),
    systemType: SystemProposalType.NORMAL,
    params: [],
  };

  const ctx = new Context({
    ...deployments.getContextParams(),
    signer: deployments.accounts.voters[0],
  });
  const client = new Client(ctx);

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
        expect(step.proposalId).equal(proposalData.proposalId);
        break;
      case NormalSteps.SENT:
        expect(step.proposalId).equal(proposalData.proposalId);
        expect(step.txHash).match(/^0x[A-Fa-f0-9]{64}$/i);
        break;
      case NormalSteps.DONE:
        expect(step.proposalId).equal(proposalData.proposalId);
        Helper.storeProposalId(proposalData.proposalId);
        break;
      default:
        throw new Error('Unexpected step: ' + JSON.stringify(step, null, 2));
    }
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
