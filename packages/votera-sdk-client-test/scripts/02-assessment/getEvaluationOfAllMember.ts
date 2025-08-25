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

  const ctx = new Context({
    ...deployments.getContextParams(),
    signer: deployments.accounts.evaluators[0],
  });
  const client = new Client(ctx);

  const proposalId = Helper.loadProposalId();

  const length = await client.methods.getEvaluatorLength(proposalId);
  console.log(`getEvaluatorLength: ${length}`);

  const evaluations = await client.methods.getEvaluationOfAllMembersList(
    proposalId,
    0,
    length,
    SortType.DSC
  );
  for (const evaluation of evaluations) {
    console.log(`----`);
    console.log(`Evaluator: ${evaluation.evaluator}`);
    console.log(`isEvaluated: ${evaluation.isEvaluated}`);
    console.log(`timestamp: ${evaluation.timestamp}`);
    console.log(`items: ${JSON.stringify(evaluation.items)}`);
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
