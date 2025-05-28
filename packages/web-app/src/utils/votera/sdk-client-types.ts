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

/* Balances */
type AssetBalanceBase = {
  id: string;
  address: string;
  updateDate: Date;
  logoURI?: string;
};

export enum TokenType {
  NATIVE = 'native',
  ERC20 = 'erc20',
  ERC721 = 'erc721',
  ERC1155 = 'erc1155',
}

type NativeAssetBalance = {
  id: string;
  type: TokenType.NATIVE;
  balance: bigint;
  updateDate: Date;
};
type Erc20AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC20;
  balance: bigint;
  decimals: number;
  name: string;
  symbol: string;
};
type Erc721AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC721;
  tokenIds: bigint[];
  name: string;
  symbol: string;
};

type Erc1155AssetBalance = AssetBalanceBase & {
  type: TokenType.ERC1155;
  balances: {
    id: string;
    tokenId: bigint;
    amount: bigint;
  }[];
  metadataUri: string;
};

export enum AssetBalanceSortBy {
  LAST_UPDATED = 'lastUpdated',
}

export type AssetBalance =
  | NativeAssetBalance
  | Erc20AssetBalance
  | Erc721AssetBalance
  | Erc1155AssetBalance;

export type BalanceMember = {
  balance: number;
};
