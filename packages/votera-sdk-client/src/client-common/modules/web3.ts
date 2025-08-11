import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { Signer } from "@ethersproject/abstract-signer";

import { GasFeeEstimation } from "../../client-common/interfaces/common";
import { IClientWeb3Core } from "../interfaces/core";
import { Context } from "../context";
import {
    NoProposalStorageAddress,
    NoBudgetManagerAddress,
    NoParamStorageAddress,
    NoAssessmentStorageAddress,
    NoAddressStorageAddress,
    NoExecutionManagerAddress,
    NoParticipantStorageAddress,
    NoVoteStorageAddress,
    NoReceptionControllerAddress,
    NoVoteControllerAddress,
    NoParticipantManagerAddress,
    NoAssessmentControllerAddress,
    NoEvaluatorStorageAddress,
    NoEvaluatorManagerAddress
} from "../../utils/errors";

const gasFeeEstimationFactorMap = new Map<Web3Module, number>();
const providersMap = new Map<Web3Module, JsonRpcProvider[]>();
const providerIdxMap = new Map<Web3Module, number>();
const signerMap = new Map<Web3Module, Signer>();

const AddressStorageAddressMap = new Map<Web3Module, string>();
const BudgetManagerAddressMap = new Map<Web3Module, string>();
const ParamStorageAddressMap = new Map<Web3Module, string>();
const ParticipantStorageAddressMap = new Map<Web3Module, string>();
const EvaluatorStorageAddressMap = new Map<Web3Module, string>();
const ProposalStorageAddressMap = new Map<Web3Module, string>();
const AssessmentStorageAddressMap = new Map<Web3Module, string>();
const VoteStorageAddressMap = new Map<Web3Module, string>();
const ReceptionControllerAddressMap = new Map<Web3Module, string>();
const AssessmentControllerAddressMap = new Map<Web3Module, string>();
const VoteControllerAddressMap = new Map<Web3Module, string>();
const ParticipantManagerAddressMap = new Map<Web3Module, string>();
const EvaluatorManagerAddressMap = new Map<Web3Module, string>();
const ExecutionManagerAddressMap = new Map<Web3Module, string>();

export class Web3Module implements IClientWeb3Core {
    private static readonly PRECISION_FACTOR_BASE = 1000;

    constructor(context: Context) {
        providerIdxMap.set(this, -1);
        // Storing client data in the private module's scope to prevent external mutation
        if (context.web3Providers) {
            providersMap.set(this, context.web3Providers);
            providerIdxMap.set(this, 0);
        }

        if (context.signer) {
            this.useSigner(context.signer);
        }

        if (context.gasFeeEstimationFactor) {
            gasFeeEstimationFactorMap.set(this, context.gasFeeEstimationFactor);
        }

        if (context.AddressStorage) {
            AddressStorageAddressMap.set(this, context.AddressStorage);
        }

        if (context.BudgetManager) {
            BudgetManagerAddressMap.set(this, context.BudgetManager);
        }

        if (context.ParamStorage) {
            ParamStorageAddressMap.set(this, context.ParamStorage);
        }

        if (context.ParticipantStorage) {
            ParticipantStorageAddressMap.set(this, context.ParticipantStorage);
        }

        if (context.EvaluatorStorage) {
            EvaluatorStorageAddressMap.set(this, context.EvaluatorStorage);
        }

        if (context.ProposalStorage) {
            ProposalStorageAddressMap.set(this, context.ProposalStorage);
        }

        if (context.AssessmentStorage) {
            AssessmentStorageAddressMap.set(this, context.AssessmentStorage);
        }

        if (context.VoteStorage) {
            VoteStorageAddressMap.set(this, context.VoteStorage);
        }

        if (context.ReceptionController) {
            ReceptionControllerAddressMap.set(this, context.ReceptionController);
        }

        if (context.AssessmentController) {
            AssessmentControllerAddressMap.set(this, context.AssessmentController);
        }

        if (context.VoteController) {
            VoteControllerAddressMap.set(this, context.VoteController);
        }

        if (context.ParticipantManager) {
            ParticipantManagerAddressMap.set(this, context.ParticipantManager);
        }

        if (context.EvaluatorManager) {
            EvaluatorManagerAddressMap.set(this, context.EvaluatorManager);
        }

        if (context.ExecutionManager) {
            ExecutionManagerAddressMap.set(this, context.ExecutionManager);
        }

        Object.freeze(Web3Module.prototype);
        Object.freeze(this);
    }

    private get AddressStorage(): string {
        return AddressStorageAddressMap.get(this) || "";
    }

    private get BudgetManager(): string {
        return BudgetManagerAddressMap.get(this) || "";
    }

    private get ParamStorage(): string {
        return ParamStorageAddressMap.get(this) || "";
    }

    private get ParticipantStorage(): string {
        return ParticipantStorageAddressMap.get(this) || "";
    }

    private get EvaluatorStorage(): string {
        return EvaluatorStorageAddressMap.get(this) || "";
    }

    private get EvaluatorManager(): string {
        return EvaluatorManagerAddressMap.get(this) || "";
    }

    private get ProposalStorage(): string {
        return ProposalStorageAddressMap.get(this) || "";
    }

    private get AssessmentStorage(): string {
        return AssessmentStorageAddressMap.get(this) || "";
    }

    private get VoteStorage(): string {
        return VoteStorageAddressMap.get(this) || "";
    }

    private get ReceptionController(): string {
        return ReceptionControllerAddressMap.get(this) || "";
    }

    private get AssessmentController(): string {
        return AssessmentControllerAddressMap.get(this) || "";
    }

    private get VoteController(): string {
        return VoteControllerAddressMap.get(this) || "";
    }

    private get ParticipantManager(): string {
        return ParticipantManagerAddressMap.get(this) || "";
    }

    private get ExecutionManager(): string {
        return ExecutionManagerAddressMap.get(this) || "";
    }

    private get gasFeeEstimationFactor(): number {
        return gasFeeEstimationFactorMap.get(this) || 1;
    }

    private get providers(): JsonRpcProvider[] {
        return providersMap.get(this) || [];
    }

    private get providerIdx(): number {
        return providerIdxMap.get(this)!;
    }

    private get signer(): Signer | undefined {
        return signerMap.get(this);
    }

    /** Replaces the current signer by the given one */
    public useSigner(signer: Signer): void {
        if (!signer) {
            throw new Error("Empty wallet or signer");
        }
        signerMap.set(this, signer);
    }

    /** Starts using the next available Web3 provider */
    public shiftProvider(): void {
        if (!this.providers.length) {
            throw new Error("No endpoints");
        } else if (this.providers.length <= 1) {
            throw new Error("No other endpoints");
        }
        providerIdxMap.set(this, (this.providerIdx + 1) % this.providers.length);
    }

    /** Retrieves the current signer */
    public getSigner(): Signer | undefined {
        return this.signer;
    }

    /** Returns a signer connected to the current network provider */
    public getConnectedSigner(): Signer {
        let signer = this.getSigner();
        if (!signer) {
            throw new Error("No signer");
        } else if (!signer.provider && !this.getProvider()) {
            throw new Error("No provider");
        } else if (signer.provider) {
            return signer;
        }

        const provider = this.getProvider();
        if (!provider) throw new Error("No provider");

        signer = signer.connect(provider);
        return signer;
    }

    /** Returns the currently active network provider */
    public getProvider(): JsonRpcProvider | undefined {
        return this.providers[this.providerIdx] || null;
    }

    /** Returns whether the current provider is functional or not */
    public isUp(): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const provider = this.getProvider();
            if (!provider) return reject(new Error("No provider"));
            provider
                .getNetwork()
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
        });
    }

    public async ensureOnline(): Promise<void> {
        if (!this.providers.length) {
            return Promise.reject(new Error("No provider"));
        }

        for (let i = 0; i < this.providers.length; i++) {
            if (await this.isUp()) return;

            this.shiftProvider();
        }
        throw new Error("No providers available");
    }

    /**
     * Returns a contract instance at the given address
     *
     * @param address Contract instance address
     * @param abi The Application Binary Inteface of the contract
     * @return A contract instance attached to the given address
     */
    public attachContract<T>(address: string, abi: ContractInterface): Contract & T {
        if (!address) throw new Error("Invalid contract address");
        else if (!abi) throw new Error("Invalid contract ABI");

        const signer = this.getSigner();
        if (!signer && !this.getProvider()) {
            throw new Error("No signer");
        }

        const provider = this.getProvider();
        if (!provider) throw new Error("No provider");

        const contract = new Contract(address, abi, provider);

        if (!signer) {
            return contract as Contract & T;
        } else if (signer instanceof Wallet) {
            return contract.connect(signer.connect(provider)) as Contract & T;
        }

        return contract.connect(signer) as Contract & T;
    }

    /** Calculates the expected maximum gas fee */
    public getMaxFeePerGas(): Promise<bigint> {
        return new Promise<bigint>((resolve, reject) => {
            this.getConnectedSigner()
                .getFeeData()
                .then((feeData) => {
                    if (!feeData.maxFeePerGas) {
                        return reject(new Error("Cannot estimate gas"));
                    }
                    return resolve(feeData.maxFeePerGas.toBigInt());
                });
        });
    }

    public getApproximateGasFee(estimatedFee: bigint): Promise<GasFeeEstimation> {
        return new Promise<GasFeeEstimation>((resolve) => {
            this.getMaxFeePerGas().then((maxFeePerGas) => {
                const max = estimatedFee * maxFeePerGas;
                const factor = this.gasFeeEstimationFactor * Web3Module.PRECISION_FACTOR_BASE;
                const average = (max * BigInt(Math.trunc(factor))) / BigInt(Web3Module.PRECISION_FACTOR_BASE);
                return resolve({ average, max });
            });
        });
    }

    public getAddressStorageAddress(): string {
        if (!this.AddressStorage) {
            throw new NoAddressStorageAddress();
        }
        return this.AddressStorage;
    }

    public getBudgetManagerAddress(): string {
        if (!this.BudgetManager) {
            throw new NoBudgetManagerAddress();
        }
        return this.BudgetManager;
    }

    public getParamStorageAddress(): string {
        if (!this.ParamStorage) {
            throw new NoParamStorageAddress();
        }
        return this.ParamStorage;
    }

    public getParticipantStorageAddress(): string {
        if (!this.ParticipantStorage) {
            throw new NoParticipantStorageAddress();
        }
        return this.ParticipantStorage;
    }

    public getEvaluatorStorageAddress(): string {
        if (!this.EvaluatorStorage) {
            throw new NoEvaluatorStorageAddress();
        }
        return this.EvaluatorStorage;
    }

    public getProposalStorageAddress(): string {
        if (!this.ProposalStorage) {
            throw new NoProposalStorageAddress();
        }
        return this.ProposalStorage;
    }

    public getAssessmentStorageAddress(): string {
        if (!this.AssessmentStorage) {
            throw new NoAssessmentStorageAddress();
        }
        return this.AssessmentStorage;
    }

    public getVoteStorageAddress(): string {
        if (!this.VoteStorage) {
            throw new NoVoteStorageAddress();
        }
        return this.VoteStorage;
    }

    public getReceptionControllerAddress(): string {
        if (!this.ReceptionController) {
            throw new NoReceptionControllerAddress();
        }
        return this.ReceptionController;
    }

    public getAssessmentControllerAddress(): string {
        if (!this.AssessmentController) {
            throw new NoAssessmentControllerAddress();
        }
        return this.AssessmentController;
    }

    public getVoteControllerAddress(): string {
        if (!this.VoteController) {
            throw new NoVoteControllerAddress();
        }
        return this.VoteController;
    }

    public getParticipantManagerAddress(): string {
        if (!this.ParticipantManager) {
            throw new NoParticipantManagerAddress();
        }
        return this.ParticipantManager;
    }

    public getEvaluatorManagerAddress(): string {
        if (!this.EvaluatorManager) {
            throw new NoEvaluatorManagerAddress();
        }
        return this.EvaluatorManager;
    }

    public getExecutionManagerAddress(): string {
        if (!this.ExecutionManager) {
            throw new NoExecutionManagerAddress();
        }
        return this.ExecutionManager;
    }
}
