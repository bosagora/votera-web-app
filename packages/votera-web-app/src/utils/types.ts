import {BigNumber} from 'ethers';

import {TransferTypes} from './constants';
import {Web3Address} from './library';

/*************************************************
 *                   Finance types               *
 *************************************************/
/** The balance for a token */
export type TokenBalance = {
  token: {
    id: string;
    name: string;
    symbol: string;
    decimals: number;
    price?: number;
  };
  balance: bigint;
};

/**
 * Token with basic information populated from external api and/or blockchain
 * Market information is not included
 */
export type TokenWithMetadata = {
  balance: bigint;
  metadata: TokenBalance['token'] & {
    apiId?: string;
    imgUrl: string;
  };
};

/**
 * Token current price, and price change percentage for given filter
 * @property {number} price - current market price
 * @property {number} balanceValue - current balance value in USD
 * @property {number} priceChangeDuringInterval - change in market price from interval time in past until now
 * @property {number} valueChangeDuringInterval - change in balance value from interval time in past until now
 * @property {number} percentageChangedDuringInterval - percentage change from market price interval time ago to current market price
 */
export interface MarketData {
  price: number;
  balanceValue: number;
  priceChangeDuringInterval: number;
  valueChangeDuringInterval?: number;
  percentageChangedDuringInterval: number;
}

export type TokenWithMarketData = TokenWithMetadata & {
  marketData?: MarketData;
};

// Transfers
/** A transfer transaction */
export type BaseTransfer = {
  id: string;
  title: string;
  tokenAmount: string;
  tokenSymbol: string;
  transferDate: string;
  transferTimestamp?: string | number;
  usdValue: string;
  isPending?: boolean;
  tokenImgUrl: string;
  tokenName: string;
  reference?: string;
  transaction: string;
  tokenAddress: string;
};

export type Deposit = BaseTransfer & {
  sender: string;
  transferType: TransferTypes.Deposit;
};
export type Withdraw = BaseTransfer & {
  proposalId: ProposalId;
  to: string;
  transferType: TransferTypes.Withdraw;
};

export type Transfer = Deposit | Withdraw;

/*************************************************
 *                  Proposal types               *
 *************************************************/

type Seconds = string;

type ProposalMetadata = {
  title: string;
  description: string;
  resources?: ProposalResource[];
  published?: BlockChainInteraction;
  executed?: BlockChainInteraction;
};

export type ProposalResource = {
  name: string;
  url: string;
};

type BlockChainInteraction = {
  date: Seconds;
  block: string;
};

export type VotingData = {
  start: Seconds;
  end: Seconds;
  total: number;
  results: Record<string, number>; // e.g. option -> amount of votes
  tokenSymbol: string;
};

type ExecutionData = {
  from: string;
  to: string;
  amount: number;
};

export enum ProposalPhase {
  NONE = 'NONE',
  ASSESSMENT = 'ASSESSMENT', // 평가 단계
  VOTE = 'VOTE', // 투표 단계
  EXECUTION = 'EXECUTION', // 실행 단계
  FINISHED = 'FINISHED', // 종료 단계
  EXPIRED = 'EXPIRED', // 만료 단계
}

/**
 * All available types of action for DAOs
 */
// TODO: rename actions types and names to be consistent
// either update or modify
export type ActionsTypes =
  | 'add_address'
  | 'remove_address'
  | 'withdraw_assets'
  | 'mint_tokens'
  | 'external_contract_modal'
  | 'external_contract_action'
  | 'wallet_connect_modal'
  | 'wallet_connect_action'
  | 'modify_token_voting_settings'
  | 'modify_metadata'
  | 'modify_multisig_voting_settings'
  | 'update_minimum_approval';

export type ActionWithdraw = {
  amount: number;
  name: 'withdraw_assets';
  to: Web3Address;
  tokenAddress: string;
  tokenBalance: number;
  tokenDecimals: number;
  tokenImgUrl: string;
  tokenName: string;
  tokenPrice: number;
  tokenSymbol: string;
  isCustomToken: boolean;
};

// TODO: merge these types
export type ActionAddAddress = {
  name: 'add_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionRemoveAddress = {
  name: 'remove_address';
  inputs: {
    memberWallets: Array<{
      address: string;
      ensName: string;
    }>;
  };
};

export type ActionUpdateMinimumApproval = {
  name: 'update_minimum_approval';
  inputs: {
    minimumApproval: number;
  };
  summary: {
    addedWallets: number;
    removedWallets: number;
    totalWallets?: number;
  };
};

export type ActionSCC = {
  name: 'external_contract_action';
  contractName: string;
  contractAddress: string;
  functionName: string;
  inputs: Array<ExternalActionInput>;
  value?: string;
};

// Alias
export type ActionExternalContract = ActionWC;
export type ExternalActionInput = {
  name: string;
  type: string;
  notice?: string;
  value: object | string | BigNumber;
};

export type ActionWC = Omit<ActionSCC, 'name'> & {
  name: 'wallet_connect_action';
  notice?: string;
  verified: boolean;
  decoded: boolean;
  // considering we have the raw action directly from WC, there
  // is no need to decode it, re-encode it, only to decode it again
  // when displaying on the proposal details page
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any;
};

// TODO: Consider making this a generic type that take other types of the form
// like ActionAddAddress (or more generically, ActionItem...?) instead taking the
// union of those subtypes. [VR 11-08-2022]
export type Action =
  | ActionWithdraw
  | ActionAddAddress
  | ActionRemoveAddress
  | ActionUpdateMinimumApproval
  | ActionSCC
  | ActionWC;

export type ParamType = {
  type: string;
  name?: string;
  value: string;
};

/**
 *  Inputs prop is using for custom smart contract methods that have unknown fields
 */
export type ActionItem = {
  name: ActionsTypes;
  inputs?: ParamType[];
};

export type TransactionItem = {
  type: TransferTypes;
  data: {
    sender: string;
    amount: number;
    tokenContract: string;
  };
};

/* MISCELLANEOUS TYPES ======================================================= */
export type VoteraProposal = {
  address: string;
};

/* UTILITY TYPES ============================================================ */

/** Return type for data hooks */
export type HookData<T> = {
  data: T;
  isLoading: boolean;
  isInitialLoading?: boolean;
  isLoadingMore?: boolean;
  error?: Error;
};

export type Nullable<T> = T | null;

export type StrictlyExclude<T, U> = T extends U ? (U extends T ? never : T) : T;

export type StringIndexed = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface Input {
  name: string;
  type: string;
  indexed?: boolean;
  components?: Input[];
  internalType?: string;
  notice?: string;
  value?: string;
}

/**
 * Opaque class encapsulating a proposal id, which can
 * be globally unique or just unique per plugin address
 */
export class ProposalId {
  private id: string;

  constructor(val: string) {
    this.id = val.toString();
  }

  /** The proposal id as a string */
  toString() {
    return this.id;
  }
}
