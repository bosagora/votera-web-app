import {BigNumber} from '@ethersproject/bignumber';
import {
  AssessmentResult,
  ExecutionStates,
  SystemProposalParam,
  ProposalPeriod,
  ProposalStates,
  ProposalType,
  SystemProposalType,
  VoteResult,
} from 'votera-sdk-client';
import {SupportedChainID} from '../constants';

export interface VoteraProposalData {
  proposalType: ProposalType;
  title: string;
  description: string;
  proposer: string;
  proposalId: string;
  fundAmount?: BigNumber;
  documentId?: string;
  beginAssess?: number;
  endAssess?: number;
  beginVote?: number;
  endVote?: number;
  systemType?: SystemProposalType;
  params?: SystemProposalParam[];
  states?: ProposalStates;
  period?: ProposalPeriod;
  assessmentResult?: AssessmentResult;
  voteResult?: VoteResult;
  executionStates?: ExecutionStates;
  sendVoteCost?: boolean;
  chain: SupportedChainID;
}
