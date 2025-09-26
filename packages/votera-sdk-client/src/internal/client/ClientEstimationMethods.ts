import { ClientCore, Context, GasFeeEstimation } from "../../client-common";
import { IClientEstimationMethods } from "../../interface/IClientEstimation";

import {
    AssessmentController,
    AssessmentController__factory,
    ExecutionManager,
    ExecutionManager__factory,
    ParamStorage,
    ParamStorage__factory,
    ReceptionControllerV2,
    ReceptionControllerV2__factory,
    VoteControllerV2,
    VoteControllerV2__factory,
} from "votera-contracts-lib";
import { NoProviderError, NoSignerError } from "votera-sdk-common";

import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Candidate, SystemProposalParam, ProposalType, SystemProposalType, ParamValue } from "../../interfaces";
import { BytesLike } from "@ethersproject/bytes";
import { ResponseMessage } from "../../utils/ResponseMessage";
import { EVMException } from "../../utils/errors";
import { Provider } from "@ethersproject/providers";

export class ClientEstimationMethods extends ClientCore implements IClientEstimationMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ClientEstimationMethods.prototype);
        Object.freeze(this);
    }

    private getReceptionControllerWithSigner(): ReceptionControllerV2 {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ReceptionControllerV2__factory.connect(this.web3.getReceptionControllerAddress(), signer);
    }

    private getExecutionControllerWithSigner(): ExecutionManager {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ExecutionManager__factory.connect(this.web3.getExecutionManagerAddress(), signer);
    }

    private getParamStorage(): ParamStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ParamStorage__factory.connect(this.web3.getParamStorageAddress(), provider);
    }

    public async getFundProposalFee(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getFundProposalFee();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getSystemProposalFee(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getSystemProposalFee();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getProposalFee(proposalType: ProposalType, fundAmount: BigNumberish): Promise<BigNumber> {
        if (proposalType === ProposalType.FUND) {
            const param = await this.getFundProposalFee();
            return BigNumber.from(fundAmount).mul(param.value).div(param.multiple);
        } else {
            const param = await this.getSystemProposalFee();
            return param.value.div(param.multiple);
        }
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
        params: SystemProposalParam[]
    ): Promise<GasFeeEstimation> {
        const fee = await this.getProposalFee(proposalType, fundAmount);
        const contract = this.getReceptionControllerWithSigner();
        const gasEstimation = await contract.estimateGas.createProposal(
            {
                proposalType,
                title,
                description,
                proposalId,
                fundAmount,
                assessmentPeriod,
                votePeriod,
                documentId,
                systemType,
                params,
            },
            { value: fee }
        );
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

    private getVoteControllerWithSigner(): VoteControllerV2 {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return VoteControllerV2__factory.connect(this.web3.getVoteControllerAddress(), signer);
    }

    public async postBallot(proposalId: BytesLike, choice: Candidate): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getVoteControllerWithSigner().estimateGas.postBallot(proposalId, choice);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async sendVoteCost(proposalId: BytesLike): Promise<GasFeeEstimation> {
        const gasEstimation = await this.getVoteControllerWithSigner().estimateGas.sendVoteCost(proposalId);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }
}
