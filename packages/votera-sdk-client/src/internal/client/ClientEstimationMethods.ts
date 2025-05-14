import { ClientCore, Context, GasFeeEstimation } from "../../client-common";
import { IClientEstimationMethods } from "../../interface/IClientEstimation";

import {
    AssessmentController,
    AssessmentController__factory,
    ExecutionManager,
    ExecutionManager__factory,
    ReceptionController,
    ReceptionController__factory,
    VoteController,
    VoteController__factory
} from "votera-contracts-lib";
import { NoSignerError } from "votera-sdk-common";

import { BigNumberish } from "@ethersproject/bignumber";
import { Candidate, ISystemProposalParam, ProposalType, SystemProposalType } from "../../interfaces";
import { BytesLike } from "@ethersproject/bytes";

export class ClientEstimationMethods extends ClientCore implements IClientEstimationMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ClientEstimationMethods.prototype);
        Object.freeze(this);
    }

    private getReceptionControllerWithSigner(): ReceptionController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ReceptionController__factory.connect(this.web3.getReceptionControllerAddress(), signer);
    }

    private getExecutionControllerWithSigner(): ExecutionManager {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ExecutionManager__factory.connect(this.web3.getExecutionManagerAddress(), signer);
    }

    public async createProposal(
        proposalType: ProposalType,
        title: string,
        description: string,
        proposalId: BytesLike,
        fundAmount: BigNumberish,
        assessmentPeriod: number,
        votePeriod: number,
        documentId: BytesLike,
        systemType: SystemProposalType,
        params: ISystemProposalParam[]
    ): Promise<GasFeeEstimation> {
        const contract = this.getReceptionControllerWithSigner();
        const gasEstimation = await contract.estimateGas.createProposal({
            proposalType,
            title,
            description,
            proposalId,
            fundAmount,
            assessmentPeriod,
            votePeriod,
            documentId,
            systemType,
            params
        });
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async transition(proposalId: BytesLike): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getReceptionControllerWithSigner().estimateGas.transition(proposalId);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async execute(proposalId: BytesLike): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getExecutionControllerWithSigner().estimateGas.execute(proposalId);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    private getAssessmentControllerWithSigner(): AssessmentController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return AssessmentController__factory.connect(this.web3.getAssessmentControllerAddress(), signer);
    }

    public async postScore(
        proposalId: BytesLike,
        items: [number, number, number, number, number]
    ): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getAssessmentControllerWithSigner().estimateGas.postScore(proposalId, items);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async postComment(proposalId: BytesLike, message: string): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getAssessmentControllerWithSigner().estimateGas.postComment(
            proposalId,
            message
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    private getVoteControllerWithSigner(): VoteController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return VoteController__factory.connect(this.web3.getVoteControllerAddress(), signer);
    }

    public async postBallot(proposalId: BytesLike, choice: Candidate): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getVoteControllerWithSigner().estimateGas.postBallot(proposalId, choice);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }
}
