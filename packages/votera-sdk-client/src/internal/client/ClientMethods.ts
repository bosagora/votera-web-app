import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { Provider } from "@ethersproject/providers";

import { getNetwork } from "../../utils/Utilty";

import {
    AssessmentController,
    AssessmentController__factory,
    AssessmentStorage,
    AssessmentStorage__factory,
    BudgetManager,
    BudgetManager__factory,
    ExecutionManager,
    ExecutionManager__factory,
    ParamStorage,
    ParamStorage__factory,
    ParticipantStorage,
    ProposalStorage,
    ProposalStorage__factory,
    ReceptionController,
    ReceptionController__factory,
    VoteController,
    VoteController__factory,
    VoteStorage,
    VoteStorage__factory,
    ParticipantStorage__factory,
} from "votera-contracts-lib";

import {
    ExecutionError,
    NoProviderError,
    NoSignerError,
    PostBallotError,
    PostCommentError,
    PostSendVoteCostError,
    ProposalCreationError,
} from "votera-sdk-common";

import { ClientCore, Context } from "../../client-common";
import { IClientMethods } from "../../interface/IClientMethods";
import {
    AssessmentPostCommentStepValue,
    AssessmentPostScoreStepValue,
    AssessmentResult,
    Candidate,
    CreateProposalStepValue,
    ExecutionStepValue,
    CommentData,
    ParamValue,
    ProposalData,
    ScoreData,
    SystemProposalParam,
    VoteBallotData,
    NormalSteps,
    ProposalPeriod,
    ProposalStates,
    ProposalType,
    SendVoteCostStepValue,
    SortType,
    SystemProposalType,
    TransitionStepValue,
    VotePostBallotStepValue,
    VoteResult,
} from "../../interfaces";
import { ContractUtils } from "../../utils/ContractUtils";
import { ResponseMessage } from "../../utils/ResponseMessage";
import { EVMException } from "../../utils/errors";

export class ClientMethods extends ClientCore implements IClientMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ClientMethods.prototype);
        Object.freeze(this);
    }

    public async getAccount(): Promise<string> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();
        return await signer.getAddress();
    }

    private getProposalStorage(): ProposalStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ProposalStorage__factory.connect(this.web3.getProposalStorageAddress(), provider);
    }

    private getParticipantStorage(): ParticipantStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ParticipantStorage__factory.connect(this.web3.getParticipantStorageAddress(), provider);
    }

    private getReceptionController(): ReceptionController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ReceptionController__factory.connect(this.web3.getReceptionControllerAddress(), provider);
    }

    private getReceptionControllerWithSigner(): ReceptionController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ReceptionController__factory.connect(this.web3.getReceptionControllerAddress(), signer);
    }

    public async isAvailableProposalId(proposalId: BytesLike): Promise<boolean> {
        return this.getReceptionController().isAvailableProposalId(proposalId);
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

    public async *createProposal(
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
    ): AsyncGenerator<CreateProposalStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        const fee = await this.getProposalFee(proposalType, fundAmount);
        const contract = this.getReceptionControllerWithSigner();
        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await contract.createProposal(
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

            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };
            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }

        const storage = this.getProposalStorage();
        const log = ContractUtils.findLog(cr, storage.interface, "UpdatedProposalPeriod");
        if (!log) {
            throw new ProposalCreationError();
        }

        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    private async toProposalData(res: any): Promise<ProposalData> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();
        const network = getNetwork((await provider.getNetwork()).chainId);
        return {
            proposalType: res.proposalType,
            title: res.title,
            description: res.description,
            proposer: res.proposer,
            proposalId: res.proposalId,
            fundAmount: res.fundAmount,
            documentId: res.documentId,
            beginAssess: res.beginAssess.toNumber(),
            endAssess: res.endAssess.toNumber(),
            beginVote: res.beginVote.toNumber(),
            endVote: res.endVote.toNumber(),
            systemType: res.systemType,
            params: res.params.map((m: SystemProposalParam) => {
                return {
                    name: m.name,
                    value: m.value,
                    multiple: m.multiple,
                };
            }),
            states: res.states,
            period: res.period,
            assessmentResult: res.assessmentResult,
            voteResult: res.voteResult,
            executionStates: res.executionStates,
            sendVoteCost: res.sendVoteCost,
            chain: network.chainId,
        };
    }

    public async getProposal(proposalId: BytesLike): Promise<ProposalData> {
        try {
            const res = await this.getReceptionController().getProposal(proposalId);
            return await this.toProposalData(res);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getProposalByIndex(idx: number, sortType: SortType): Promise<ProposalData> {
        try {
            const res = await this.getReceptionController().getProposalByIndex(idx, sortType);
            return await this.toProposalData(res);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getProposalList(startIndex: number, endIndex: number, sortType: SortType): Promise<ProposalData[]> {
        try {
            const res = await this.getReceptionController().getProposalList(startIndex, endIndex, sortType);
            return await Promise.all(res.map(async (m) => await this.toProposalData(m)));
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async *transition(proposalId: BytesLike): AsyncGenerator<TransitionStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let tx: ContractTransaction;
        try {
            tx = await this.getReceptionControllerWithSigner().transition(proposalId);

            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    public async getProposalLength(): Promise<number> {
        try {
            return (await this.getReceptionController().getLength()).toNumber();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getStates(proposalId: BytesLike): Promise<ProposalStates> {
        try {
            return await this.getReceptionController().getStates(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getPeriod(proposalId: BytesLike): Promise<ProposalPeriod> {
        try {
            return await this.getReceptionController().getPeriod(proposalId);
        } catch (error) {
            const message = ContractUtils.cacheEVMError(error);
            throw new Error(message);
        }
    }

    public async getPeriodToTransition(proposalId: BytesLike): Promise<ProposalPeriod> {
        try {
            return await this.getReceptionController().getPeriodToTransition(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getVoteResult(proposalId: BytesLike): Promise<VoteResult> {
        try {
            const res = await this.getReceptionController().getProposal(proposalId);
            return res.voteResult;
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getAssessmentResult(proposalId: BytesLike): Promise<VoteResult> {
        try {
            const res = await this.getReceptionController().getProposal(proposalId);
            return res.assessmentResult;
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getExecutionStates(proposalId: BytesLike): Promise<VoteResult> {
        try {
            const res = await this.getReceptionController().getProposal(proposalId);
            return res.executionStates;
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getWithdrawalAmount(proposalId: BytesLike): Promise<BigNumber> {
        try {
            const res = await this.getReceptionController().getProposal(proposalId);
            return res.fundAmount;
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    //--

    private getAssessmentStorage(): AssessmentStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return AssessmentStorage__factory.connect(this.web3.getAssessmentStorageAddress(), provider);
    }

    private getAssessmentController(): AssessmentController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return AssessmentController__factory.connect(this.web3.getAssessmentControllerAddress(), provider);
    }

    private getAssessmentControllerWithSigner(): AssessmentController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return AssessmentController__factory.connect(this.web3.getAssessmentControllerAddress(), signer);
    }

    public async getAssessmentSummary(proposalId: BytesLike): Promise<[number, number, number, number, number]> {
        const res = await this.getAssessmentController().getAssessmentSummary(proposalId);
        return [res[0].toNumber(), res[1].toNumber(), res[2].toNumber(), res[3].toNumber(), res[4].toNumber()];
    }

    public async *postScore(
        proposalId: BytesLike,
        items: [number, number, number, number, number]
    ): AsyncGenerator<AssessmentPostScoreStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getAssessmentControllerWithSigner().postScore(proposalId, items);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
        const log = ContractUtils.findLog(cr, this.getAssessmentStorage().interface, "PostScore");
        if (!log) {
            throw new PostBallotError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    private toIAssessmentBallotData(res: any): ScoreData {
        return {
            evaluator: res.evaluator,
            timestamp: res.timestamp.toNumber(),
            items: [
                res.items[0].toNumber(),
                res.items[1].toNumber(),
                res.items[2].toNumber(),
                res.items[3].toNumber(),
                res.items[4].toNumber(),
            ],
        };
    }

    private toICommentDataOfAssessment(res: any): CommentData {
        return {
            writer: res.writer,
            timestamp: res.timestamp.toNumber(),
            message: res.message,
        };
    }

    public async getScore(proposalId: BytesLike, voter: string): Promise<ScoreData> {
        try {
            const res = await this.getAssessmentController().getScore(proposalId, voter);
            return this.toIAssessmentBallotData(res);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getScoreList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<ScoreData[]> {
        try {
            const res = await this.getAssessmentController().getScoreList(proposalId, startIndex, endIndex, sortType);
            return res.map((m) => this.toIAssessmentBallotData(m));
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getScoreLength(proposalId: BytesLike): Promise<number> {
        try {
            return (await this.getAssessmentController().getScoreLength(proposalId)).toNumber();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async *postComment(proposalId: BytesLike, message: string): AsyncGenerator<AssessmentPostCommentStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getAssessmentControllerWithSigner().postComment(proposalId, message);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
        const log = ContractUtils.findLog(cr, this.getAssessmentStorage().interface, "PostComment");
        if (!log) {
            throw new PostCommentError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    public async getCommentList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<CommentData[]> {
        try {
            const res = await this.getAssessmentController().getCommentList(proposalId, startIndex, endIndex, sortType);
            return res.map((m) => this.toICommentDataOfAssessment(m));
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getCommentLength(proposalId: BytesLike): Promise<number> {
        try {
            return (await this.getAssessmentController().getCommentLength(proposalId)).toNumber();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    private getVoteStorage(): VoteStorage {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return VoteStorage__factory.connect(this.web3.getVoteStorageAddress(), provider);
    }

    private getVoteController(): VoteController {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return VoteController__factory.connect(this.web3.getVoteControllerAddress(), provider);
    }

    private getVoteControllerWithSigner(): VoteController {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return VoteController__factory.connect(this.web3.getVoteControllerAddress(), signer);
    }

    private getBudgetManager(): BudgetManager {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return BudgetManager__factory.connect(this.web3.getBudgetManagerAddress(), provider);
    }

    public async getVoteSummary(proposalId: BytesLike): Promise<[number, number, number]> {
        try {
            const res = await this.getVoteController().getVoteSummary(proposalId);
            return [res[0].toNumber(), res[1].toNumber(), res[2].toNumber()];
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async *postBallot(proposalId: BytesLike, choice: Candidate): AsyncGenerator<VotePostBallotStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getVoteControllerWithSigner().postBallot(proposalId, choice);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
        const log = ContractUtils.findLog(cr, this.getVoteStorage().interface, "PostBallot");
        if (!log) {
            throw new PostBallotError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    private toIVoteBallotData(res: any): VoteBallotData {
        return {
            voter: res.voter,
            timestamp: res.timestamp.toNumber(),
            choice: res.choice,
        };
    }

    public async getBallot(proposalId: BytesLike, voter: string): Promise<VoteBallotData> {
        try {
            const res = await this.getVoteController().getBallot(proposalId, voter);
            return this.toIVoteBallotData(res);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getBallotList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<VoteBallotData[]> {
        try {
            const res = await this.getVoteController().getBallotList(proposalId, startIndex, endIndex, sortType);
            return res.map((m) => this.toIVoteBallotData(m));
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getBallotLength(proposalId: BytesLike): Promise<number> {
        return (await this.getVoteController().getBallotLength(proposalId)).toNumber();
    }

    public async getVoterByIndex(proposalId: BytesLike, idx: number, sortType: SortType): Promise<string> {
        return await this.getVoteController().getVoterByIndex(proposalId, idx, sortType);
    }

    public async getVoterList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<string[]> {
        try {
            return await this.getVoteController().getVoterList(proposalId, startIndex, endIndex, sortType);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getVoterLength(proposalId: BytesLike): Promise<number> {
        try {
            return (await this.getVoteController().getVoterLength(proposalId)).toNumber();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async isVoter(proposalId: BytesLike, item: string): Promise<boolean> {
        try {
            return await this.getVoteController().isVoter(proposalId, item);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    // --

    private getExecutionController(): ExecutionManager {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        return ExecutionManager__factory.connect(this.web3.getExecutionManagerAddress(), provider);
    }

    private getExecutionControllerWithSigner(): ExecutionManager {
        const signer = this.web3.getConnectedSigner();
        if (!signer) throw new NoSignerError();

        return ExecutionManager__factory.connect(this.web3.getExecutionManagerAddress(), signer);
    }

    public async canBeWithdrawn(proposalId: BytesLike): Promise<boolean> {
        try {
            return await this.getExecutionController().canBeWithdrawn(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async canBeExecute(proposalId: BytesLike): Promise<boolean> {
        try {
            return await this.getExecutionController().canBeExecute(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async *execute(proposalId: BytesLike): AsyncGenerator<ExecutionStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getExecutionControllerWithSigner().execute(proposalId);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }

        const log = ContractUtils.findLog(cr, this.getProposalStorage().interface, "UpdatedExecutionStates");
        if (!log) {
            throw new ExecutionError();
        }

        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    // --

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

    public async getVoteQuorumFactor(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getVoteQuorumFactor();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getApprovalDiffPercent(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getApprovalDiffPercent();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getVoteCost(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getVoteCost();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getAssessmentAverage(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getAssessmentAverage();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getAssessmentIndividual(): Promise<ParamValue> {
        try {
            const res = await this.getParamStorage().getAssessmentIndividual();
            return {
                value: res.value,
                multiple: res.multiple,
            };
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getVoterOf(validatorKey: BytesLike): Promise<string> {
        try {
            return await this.getParticipantStorage().voterOf(validatorKey);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getValidatorKeyOf(voter: string): Promise<string> {
        try {
            return await this.getParticipantStorage().validatorKeyOf(voter);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getEvaluatorByIndex(proposalId: BytesLike, idx: number, sortType: SortType): Promise<string> {
        return await this.getVoteController().getEvaluatorByIndex(proposalId, idx, sortType);
    }

    public async getEvaluatorList(
        proposalId: BytesLike,
        startIndex: number,
        endIndex: number,
        sortType: SortType
    ): Promise<string[]> {
        try {
            return await this.getVoteController().getEvaluatorList(proposalId, startIndex, endIndex, sortType);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async getEvaluatorLength(proposalId: BytesLike): Promise<number> {
        try {
            return (await this.getVoteController().getEvaluatorLength(proposalId)).toNumber();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async isEvaluator(proposalId: BytesLike, item: string): Promise<boolean> {
        try {
            return await this.getVoteController().isEvaluator(proposalId, item);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
    }

    public async *sendVoteCost(proposalId: BytesLike): AsyncGenerator<SendVoteCostStepValue> {
        yield {
            key: NormalSteps.PREPARED,
            proposalId,
        };

        let proposalData;
        try {
            proposalData = await this.getReceptionController().getProposal(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }

        if (proposalData.assessmentResult !== AssessmentResult.APPROVED) {
            throw new PostSendVoteCostError();
        }

        let tx: ContractTransaction;
        let cr: ContractReceipt;
        try {
            tx = await this.getVoteControllerWithSigner().sendVoteCost(proposalId);
            yield {
                key: NormalSteps.SENT,
                proposalId,
                txHash: tx.hash,
            };

            cr = await tx.wait();
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }
        const log = ContractUtils.findLog(cr, this.getBudgetManager().interface, "SentVoteCost");
        if (!log) {
            throw new PostSendVoteCostError();
        }
        yield {
            key: NormalSteps.DONE,
            proposalId,
        };
    }

    public async canSendVoteCost(proposalId: BytesLike): Promise<boolean> {
        let proposalData;
        try {
            proposalData = await this.getReceptionController().getProposal(proposalId);
        } catch (error) {
            const message = ResponseMessage.getEVMErrorMessage(error);
            throw new EVMException(message.code, message.error.message);
        }

        return !(proposalData.assessmentResult !== AssessmentResult.APPROVED || proposalData.sendVoteCost);
    }
}
