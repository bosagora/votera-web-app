import { GasFeeEstimation, IClientCore } from "../client-common";
import { BytesLike } from "@ethersproject/bytes";
import {
    AssessmentPostScoreStepValue,
    AssessmentPostCommentStepValue,
    Candidate,
    CreateProposalStepValue,
    ExecutionStepValue,
    ScoreData,
    CommentData,
    ProposalData,
    SystemProposalParam,
    VoteBallotData,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SendVoteCostStepValue,
    SortType,
    SystemProposalType,
    TransitionStepValue,
    VotePostBallotStepValue,
    VoteResult,
    ParamValue,
    EvaluationData,
} from "../interfaces";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export interface IClient {
    methods: IClientMethods;
}

export interface IClientMethods extends IClientCore {
    getAccount: () => Promise<string>;

    /**
     * 사용가능한 proposal ID 인지 확인한다.
     * proposalId 는 랜덤하게 생성한 후 이 메소드를 통해 사용되지 않는지를 반드시 확인해야 한다.
     * 랜덤하게 생성하는 함수는 ContractUtils.getRandomId() 를 사용하면 됩니다.
     * @param proposalId
     */
    isAvailableProposalId: (proposalId: BytesLike) => Promise<boolean>;

    /**
     * 컨트랙트에 제안을 등록한다
     * @param proposalType 제안유형 ( 시스템제안, 사업제안 )
     * @param title 제목
     * @param description 설명
     * @param proposalId 아이디
     * @param fundAmount 펀딩금액(BOA)
     * @param assessmentPeriod 사전평가기간
     * @param votePeriod 투펴기간
     * @param documentId 문서 아이디
     * @param systemType 시스템 제안일 경우 두가지 세부 유형이 존재한다. (시스템 파라메타, 시스템 개선 )
     * @param params 시스템 파라메타 변경제안일 경우 해당함
     */
    createProposal: (
        proposalType: ProposalType,
        title: string,
        description: string,
        proposalId: BytesLike,
        fundAmount: BigNumberish,
        assessmentPeriod: number,
        votePeriod: number,
        documentId: BytesLike,
        systemType: SystemProposalType,
        params: SystemProposalParam[]
    ) => AsyncGenerator<CreateProposalStepValue>;

    createParticipantPart: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number
    ) => AsyncGenerator<CreateProposalStepValue>;

    /**
     * 등록된 제안의 정보를 요청한다
     * @param proposalId
     */
    getProposal: (proposalId: BytesLike) => Promise<ProposalData>;
    /**
     * 등록된 제안의 정보를 저장된 인덱스로 요청한다
     * @param proposalId
     */
    getProposalByIndex: (idx: number, sortType: SortType) => Promise<ProposalData>;

    /**
     * 등록된 제안의 리스트를 요청한다.
     * @param startIndex 시작 인덱스
     * @param endIndex 마지막 인덱스 (포함되지 않음)
     * @param sortType 정렬방식
     */
    getProposalList: (startIndex: number, endIndex: number, sortType: SortType) => Promise<ProposalData[]>;

    /**
     * 전체 제안의 갯수를 리턴한다
     */
    getProposalLength: () => Promise<number>;

    /**
     * 제안의 상태를 다음 단계로 이동시킬대 사용한다.
     * 다음 단계로 이동해야한 시기가 된 경우 현재 단계를 마무리 하고 다음으로 이동한다
     * @param proposalId
     */
    transition: (proposalId: BytesLike) => AsyncGenerator<TransitionStepValue>;

    /**
     * 현재의 상태를 요청한다
     * @param proposalId
     */
    getStates: (proposalId: BytesLike) => Promise<ProposalStates>;

    /**
     * 현재의 단계를 요청한다
     * @param proposalId
     */
    getPeriod: (proposalId: BytesLike) => Promise<ProposalPeriod>;

    /**
     * 초기설정에 따른 단계를 요청한다.
     * 아직 투표기간은 종료되었으나, 아무도 transition 를 호출하지 않아 투표기간에 머무러고 있다면,
     * ProposalPeriod.EXECUTION 를 리턴한다.
     * @param proposalId
     */
    getPeriodToTransition: (proposalId: BytesLike) => Promise<ProposalPeriod>;

    /**
     * 투표결과를 요청한다
     * @param proposalId
     */
    getVoteResult: (proposalId: BytesLike) => Promise<VoteResult>;

    /**
     * 사전평가 결과를 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    getAssessmentResult: (proposalId: BytesLike) => Promise<VoteResult>;

    /**
     * 실행 결과를 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    getExecutionStates: (proposalId: BytesLike) => Promise<VoteResult>;

    /**
     * 인출할 수 있는 금액정보를을 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    getWithdrawalAmount: (proposalId: BytesLike) => Promise<BigNumber>;

    // ---

    /**
     * 인출이 가능한지 확인한다. 사업제안의 투표가 종료되었고, 승인된 경우에만 true
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    canBeWithdrawn: (proposalId: BytesLike) => Promise<boolean>;

    /**
     * 실행이 가능이 확인한다. 시스템 제안의 투표가 종료되었고, 승인된 경우에만 true
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    canBeExecute: (proposalId: BytesLike) => Promise<boolean>;

    /**
     * 사용제안이면 인출을 하고, 시스템제안중 파라메타 변경이 파라메타를 변경한다.
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    execute: (proposalId: BytesLike) => AsyncGenerator<ExecutionStepValue>;

    // ---

    /**
     * 사전평가의 투표결과를 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    getAssessmentSummary: (proposalId: BytesLike) => Promise<[number, number, number, number, number]>;

    /**
     * 사전평가에 참여한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param items
     */
    postScore: (
        proposalId: BytesLike,
        items: [number, number, number, number, number]
    ) => AsyncGenerator<AssessmentPostScoreStepValue>;

    /**
     * 참영한 사전평가에서 제출한 점수를 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param voter
     */
    getScore: (proposalId: BytesLike, voter: string) => Promise<ScoreData>;

    /**
     * 사전평가의 점수들을 요청한다.
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param startIndex
     * @param endIndex
     * @param sortType
     */
    getScoreList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<ScoreData[]>;

    /**
     * 사전평가의 갯수를 리턴한다.
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    getScoreLength: (proposalId: BytesLike) => Promise<number>;

    /**
     * 하나의 게시물을 작성한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param message
     */
    postComment: (proposalId: BytesLike, message: string) => AsyncGenerator<AssessmentPostCommentStepValue>;

    /**
     * 게시물의 리스트를 요청한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param message
     */
    getCommentList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<CommentData[]>;

    /**
     * 게시물의 갯수를 리턴한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param message
     */
    getCommentLength: (proposalId: BytesLike) => Promise<number>;
    //---

    /**
     * 투표집계 결과 요청한다
     * @param proposalId
     */
    getVoteSummary: (proposalId: BytesLike) => Promise<[number, number, number]>;

    /**
     * 투표용지를 제출한다
     * @param proposalId
     * @param choice
     */
    postBallot: (proposalId: BytesLike, choice: Candidate) => AsyncGenerator<VotePostBallotStepValue>;

    /**
     * 투표용지를 요청한다
     * @param proposalId
     * @param voter
     */
    getBallot: (proposalId: BytesLike, voter: string) => Promise<VoteBallotData>;

    /**
     * 정해진 범위의 투표용지들을 요청한다
     * @param proposalId
     * @param startIndex
     * @param endIndex
     * @param sortType
     */
    getBallotList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<VoteBallotData[]>;

    /**
     * 전체 투표용지의 갯수를 요청한다
     * @param proposalId
     */
    getBallotLength: (proposalId: BytesLike) => Promise<number>;

    /**
     * 특정한 순번에 위치한 유권자의 정보를 요청한다.
     * @param proposalId
     * @param idx
     * @param sortType
     */
    getVoterByIndex: (proposalId: BytesLike, idx: number, sortType: SortType) => Promise<string>;

    /**
     * 특정범위의 유권자들의 정보를 요청한다
     * @param proposalId
     * @param startIndex
     * @param endIndex
     * @param sortType
     */
    getVoterList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<string[]>;

    /**
     * 전체 유권자들의 갯수를 요청한다
     * @param proposalId
     */
    getVoterLength: (proposalId: BytesLike) => Promise<number>;

    /**
     * 유권자의 지갑주소인지 요청한다
     * @param proposalId
     * @param item
     */
    isVoter: (proposalId: BytesLike, item: string) => Promise<boolean>;
    // --

    /**
     * 사업제안에 필요한 수수료정보를 요청한다
     */
    getFundProposalFee: () => Promise<ParamValue>;

    /**
     * 시스템 제안에 필요한 수수료정보를 요청한다
     */
    getSystemProposalFee: () => Promise<ParamValue>;

    /**
     * 투표에 필요한 최소한의 참여자의 정보를 요청한다
     */
    getVoteQuorumFactor: () => Promise<ParamValue>;

    /**
     * 투표가 가결되기 위해 필요한 찬성과 반대의 차이에 대한 정보를 요청한다
     */
    getApprovalDiffPercent: () => Promise<ParamValue>;

    /**
     * 투표비용을 요청한다
     */
    getVoteCost: () => Promise<ParamValue>;

    /**
     * 사전평가가 통과되기 위한 평균점수를 요청한다
     */
    getAssessmentAverage: () => Promise<ParamValue>;

    /**
     * 사전평가가 통과되기 위한 개발점수의 최저점을 요청한다
     */
    getAssessmentIndividual: () => Promise<ParamValue>;

    //--

    /**
     * 검증자키에 해당하는 검증자의 지갑주소를 리턴한다
     * @param validatorKey
     */
    getVoterOf: (validatorKey: BytesLike) => Promise<string>;

    /**
     * 검증자의 지갑주소에 해당한는 검증자 키를 리턴한다.
     * @param voter
     */
    getValidatorKeyOf: (voter: string) => Promise<string>;

    /**
     * 인덱스에 해당하는 사전평가 구성원의 지갑주소를 제공한다
     * @param proposalId
     * @param idx
     * @param sortType
     */
    getEvaluatorByIndex: (proposalId: BytesLike, idx: number, sortType: SortType) => Promise<string>;

    /**
     * 전체 사전평가 구성원들 중 지정된 범위에 존재하는 사전평가 구성원들을 제공한다
     * @param proposalId 제안아이디
     * @param startIndex 시작 인덱스
     * @param endIndex 마지막 인덱스
     * @param sortType 정렬방식
     */
    getEvaluatorList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<string[]>;

    /**
     * 전체 사전평가 구성원들의 갯수를 제공한다
     * @param proposalId 제안아이디
     */
    getEvaluatorLength: (proposalId: BytesLike) => Promise<number>;

    /**
     * 사전평가 구성원인지 체크한다
     * @param proposalId 제안아이디
     * @param item 검사할 지갑의 주소
     */
    isEvaluator: (proposalId: BytesLike, item: string) => Promise<boolean>;
    // --

    sendVoteCost: (proposalId: BytesLike) => AsyncGenerator<SendVoteCostStepValue>;

    sendVoteCostPart: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number
    ) => AsyncGenerator<SendVoteCostStepValue>;

    canSendVoteCost: (proposalId: BytesLike) => Promise<boolean>;

    getEvaluationOfAllMembersList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<EvaluationData[]>;

    getBallotOfAllMembersList: (
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ) => Promise<VoteBallotData[]>;

    /**
     * 특정범위의 유권자들의 정보를 요청한다
     * @param startIndex
     * @param endIndex
     * @param sortType
     */
    getVoterListOfManager: (startIndex: number, endIndex: number, sortType: SortType) => Promise<string[]>;

    /**
     * 전체 유권자들의 갯수를 요청한다
     */
    getVoterLengthOfManager: () => Promise<number>;

    /**
     * 전체 사전평가 구성원들 중 지정된 범위에 존재하는 사전평가 구성원들을 제공한다
     * @param startIndex 시작 인덱스
     * @param endIndex 마지막 인덱스
     * @param sortType 정렬방식
     */
    getEvaluatorListOfManager: (startIndex: number, endIndex: number, sortType: SortType) => Promise<string[]>;

    /**
     * 전체 사전평가 구성원들의 갯수를 제공한다
     */
    getEvaluatorLengthOfManager: () => Promise<number>;

    isParticipant: (voter: string) => Promise<boolean>;
}
