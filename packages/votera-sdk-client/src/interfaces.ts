import { BigNumber } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";

export enum ProposalStates {
    INVALID,
    OPENED,
    CLOSED,
}

export enum ProposalPeriod {
    NONE,
    ASSESSMENT,
    VOTE,
    EXECUTION,
    FINISHED,
}

export enum AssessmentResult {
    NONE,
    APPROVED,
    REJECTED,
}

export enum VoteResult {
    NONE,
    APPROVED,
    REJECTED,
    INVALID_QUORUM,
}

export enum ExecutionStates {
    NONE,
    IN_PROCESS,
    FINISHED,
}

export enum ProposalType {
    SYSTEM,
    FUND,
}

export enum Candidate {
    BLANK,
    YES,
    NO,
}

export enum VoteraComponentID {
    ASSESSMENT_CONTROLLER = "AssessmentController",
    RECEPTION_CONTROLLER = "ReceptionController",
    VOTE_CONTROLLER = "VoteController",
    BUDGET_MANAGER = "BudgetManager",
    ASSESSMENT_STORAGE = "AssessmentStorage",
    PARAM_STORAGE = "ParamStorage",
    PARTICIPANT_STORAGE = "ParticipantStorage",
    PROPOSAL_STORAGE = "ProposalStorage",
    VOTE_STORAGE = "VoteStorage",
    PARTICIPANT_MANAGER = "ParticipantManager",
}

export enum SystemProposalType {
    NORMAL,
    PARAMETER,
}

export enum SortType {
    ASC,
    DSC,
}

export type ParamValue = {
    value: BigNumber;
    multiple: BigNumber;
};

export type SystemProposalParam = {
    name: string;
    value: BigNumber;
    multiple: BigNumber;
};

export type ProposalData = {
    proposalType: ProposalType;
    title: string;
    description: string;
    proposer: string;
    proposalId: string;
    fundAmount: BigNumber;
    documentId: string;
    beginAssess: number;
    endAssess: number;
    beginVote: number;
    endVote: number;
    systemType: SystemProposalType;
    params: SystemProposalParam[];
    states: ProposalStates;
    period: ProposalPeriod;
    assessmentResult: AssessmentResult;
    voteResult: VoteResult;
    executionStates: ExecutionStates;
    sendVoteCost: boolean;
    chain: number;
};

export type ScoreData = {
    voter: string;
    timestamp: number;
    items: [number, number, number, number, number];
};

export type CommentData = {
    writer: string;
    timestamp: number;
    message: string;
};

export type VoteBallotData = {
    voter: string;
    timestamp: number;
    choice: Candidate;
};

export enum NormalSteps {
    PREPARED = "prepare",
    SENT = "sent",
    DONE = "done",
}

export type ExecutionStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };

export type CreateProposalStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };

export type AssessmentPostScoreStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };

export type AssessmentPostCommentStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };

export type VotePostBallotStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };
export type TransitionStepValue =
    | {
          key: NormalSteps.PREPARED;
          proposalId: BytesLike;
      }
    | { key: NormalSteps.SENT; proposalId: BytesLike; txHash: BytesLike }
    | {
          key: NormalSteps.DONE;
          proposalId: BytesLike;
      };

export type Pagination = {
    skip?: number;
    limit?: number;
    direction?: SortDirection;
};

export enum SortDirection {
    ASC = "asc",
    DESC = "desc",
}

export type QueryOption = {
    limit: number;
    skip: number;
    direction: SortDirection;
};
