import { GasFeeEstimation } from "../client-common/interfaces/common";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { Candidate, SystemProposalParam, ProposalType, SystemProposalType, SendVoteCostStepValue } from "../interfaces";

export interface IClientEstimation {
    estimation: IClientEstimationMethods;
}

export interface IClientEstimationMethods {
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
    ) => Promise<GasFeeEstimation>;

    getProposalFee: (proposalType: ProposalType, fundAmount: BigNumberish) => Promise<BigNumber>;

    /**
     * 제안의 상태를 다음 단계로 이동시킬대 사용한다.
     * 다음 단계로 이동해야한 시기가 된 경우 현재 단계를 마무리 하고 다음으로 이동한다
     * @param proposalId
     */
    transition: (proposalId: BytesLike) => Promise<GasFeeEstimation>;

    /**
     * 사용제안이면 인출을 하고, 시스템제안중 파라메타 변경이 파라메타를 변경한다.
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     */
    execute: (proposalId: BytesLike) => Promise<GasFeeEstimation>;

    /**
     * 사전평가에 참여한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param items
     */
    postScore: (proposalId: BytesLike, items: [number, number, number, number, number]) => Promise<GasFeeEstimation>;

    /**
     * 하나의 게시물을 작성한다
     * 이는 하나의 제안에 대해서만 진행된다
     * @param proposalId
     * @param message
     */
    postComment: (proposalId: BytesLike, message: string) => Promise<GasFeeEstimation>;

    /**
     * 투표용지를 제출한다
     * @param proposalId
     * @param choice
     */
    postBallot: (proposalId: BytesLike, choice: Candidate) => Promise<GasFeeEstimation>;

    sendVoteCost: (proposalId: BytesLike) => Promise<GasFeeEstimation>;

    sendVoteCostPart: (proposalId: BytesLike, startIndex: number, endIndex: number) => Promise<GasFeeEstimation>;

    createParticipantPart: (proposalId: BytesLike, startIndex: number, endIndex: number) => Promise<GasFeeEstimation>;
}
