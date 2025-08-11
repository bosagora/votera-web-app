import { ContextParams, ContextState } from "./interfaces/context";
import { SupportedNetwork, SupportedNetworksArray } from "./interfaces/common";
import { InvalidAddressError, UnsupportedProtocolError, UnsupportedNetworkError } from "votera-sdk-common";
import { getNetwork } from "../utils/Utilty";

import { activeContractsList } from "votera-contracts-lib";

import { isAddress } from "@ethersproject/address";
import { Network } from "@ethersproject/networks";
import { JsonRpcProvider, Networkish } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";
export { ContextParams } from "./interfaces/context";

const DEFAULT_GAS_FEE_ESTIMATION_FACTOR = 0.625;
const supportedProtocols = ["https:", "http:"];
// if (typeof process !== "undefined" && process.env?.TESTING) {
//     supportedProtocols.push("http:");
// }

// State
const defaultState: ContextState = {
    network: {
        name: "mainnet",
        chainId: 2151
    },
    web3Providers: [],
    gasFeeEstimationFactor: DEFAULT_GAS_FEE_ESTIMATION_FACTOR
};

export class Context {
    protected state: ContextState = Object.assign({}, defaultState);

    // INTERNAL CONTEXT STATE

    /**
     * @param {Object} params
     *
     * @constructor
     */
    constructor(params: Partial<ContextParams>) {
        this.set(params);
    }

    /**
     * Getter for the network
     *
     * @var network
     *
     * @returns {Networkish}
     *
     * @public
     */
    get network() {
        return this.state.network;
    }

    /**
     * Getter for the Signer
     *
     * @var signer
     *
     * @returns {Signer}
     *
     * @public
     */
    get signer() {
        return this.state.signer || defaultState.signer;
    }

    // GETTERS

    /**
     * Getter for the web3 providers
     *
     * @var web3Providers
     *
     * @returns {JsonRpcProvider[]}
     *
     * @public
     */
    get web3Providers() {
        return this.state.web3Providers || defaultState.web3Providers;
    }

    get gasFeeEstimationFactor(): number {
        return this.state.gasFeeEstimationFactor || defaultState.gasFeeEstimationFactor;
    }

    get AddressStorage(): string | undefined {
        return this.state.AddressStorage;
    }

    get BudgetManager(): string | undefined {
        return this.state.BudgetManager;
    }

    get ParamStorage(): string | undefined {
        return this.state.ParamStorage;
    }

    get ParticipantStorage(): string | undefined {
        return this.state.ParticipantStorage;
    }

    get EvaluatorStorage(): string | undefined {
        return this.state.EvaluatorStorage;
    }

    get ProposalStorage(): string | undefined {
        return this.state.ProposalStorage;
    }

    get AssessmentStorage(): string | undefined {
        return this.state.AssessmentStorage;
    }

    get VoteStorage(): string | undefined {
        return this.state.VoteStorage;
    }

    get ReceptionController(): string | undefined {
        return this.state.ReceptionController;
    }

    get AssessmentController(): string | undefined {
        return this.state.AssessmentController;
    }

    get VoteController(): string | undefined {
        return this.state.VoteController;
    }

    get ParticipantManager(): string | undefined {
        return this.state.ParticipantManager;
    }

    get EvaluatorManager(): string | undefined {
        return this.state.EvaluatorManager;
    }

    get ExecutionManager(): string | undefined {
        return this.state.ExecutionManager;
    }

    // DEFAULT CONTEXT STATE
    static setDefault(params: Partial<ContextParams>) {
        if (params.signer) {
            defaultState.signer = params.signer;
        }
    }

    static getDefault() {
        return defaultState;
    }
    //
    // private static transNetwork(network: Networkish): Networkish {
    //     if (typeof network === "string") {
    //         if (network === "bosagora_mainnet") {
    //             return {
    //                 name: network,
    //                 chainId: 2151
    //             };
    //         } else if (network === "bosagora_testnet") {
    //             return {
    //                 name: network,
    //                 chainId: 2019
    //             };
    //         }
    //         return network;
    //     } else {
    //         return network;
    //     }
    // }

    // INTERNAL HELPERS
    private static resolveNetwork(networkish: Networkish, ensRegistryAddress?: string): Network {
        const network = getNetwork(networkish);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        if (ensRegistryAddress) {
            if (!isAddress(ensRegistryAddress)) {
                throw new InvalidAddressError();
            } else {
                network.ensAddress = ensRegistryAddress;
            }
        }

        if (!network.ensAddress) {
            network.ensAddress = AddressZero;
        }
        return network;
    }

    private static resolveWeb3Providers(
        endpoints: string | JsonRpcProvider | (string | JsonRpcProvider)[],
        network: Networkish
    ): JsonRpcProvider[] {
        if (Array.isArray(endpoints)) {
            return endpoints.map((item) => {
                if (typeof item === "string") {
                    const url = new URL(item);
                    if (!supportedProtocols.includes(url.protocol)) {
                        throw new UnsupportedProtocolError(url.protocol);
                    }
                    return new JsonRpcProvider(url.href, this.resolveNetwork(network));
                }
                return item;
            });
        } else if (typeof endpoints === "string") {
            const url = new URL(endpoints);
            if (!supportedProtocols.includes(url.protocol)) {
                throw new UnsupportedProtocolError(url.protocol);
            }
            return [new JsonRpcProvider(url.href, this.resolveNetwork(network))];
        } else {
            return [endpoints];
        }
    }

    /**
     * Does set and parse the given context configuration object
     *
     * @returns {void}
     *
     * @private
     */
    setFull(contextParams: ContextParams): void {
        if (!contextParams.network) {
            throw new Error("Missing network");
        } else if (!contextParams.signer) {
            throw new Error("Please pass the required signer");
        } else if (!contextParams.web3Providers) {
            throw new Error("No web3 endpoints defined");
        } else if (!contextParams.AddressStorage) {
            throw new Error("Missing AddressStorage contract address");
        } else if (!contextParams.BudgetManager) {
            throw new Error("Missing BudgetManager contract address");
        } else if (!contextParams.ParamStorage) {
            throw new Error("Missing ParamStorage contract address");
        } else if (!contextParams.ParticipantStorage) {
            throw new Error("Missing ParticipantStorage contract address");
        } else if (!contextParams.EvaluatorStorage) {
            throw new Error("Missing EvaluatorStorage contract address");
        } else if (!contextParams.ProposalStorage) {
            throw new Error("Missing ProposalStorage  contract address");
        } else if (!contextParams.AssessmentStorage) {
            throw new Error("Missing AssessmentStorage contract address");
        } else if (!contextParams.VoteStorage) {
            throw new Error("Missing VoteStorage contract address");
        } else if (!contextParams.ReceptionController) {
            throw new Error("Missing ReceptionController contract address");
        } else if (!contextParams.AssessmentController) {
            throw new Error("Missing AssessmentController contract address");
        } else if (!contextParams.VoteController) {
            throw new Error("Missing VoteController contract address");
        } else if (!contextParams.ParticipantManager) {
            throw new Error("Missing ParticipantManager contract address");
        } else if (!contextParams.EvaluatorManager) {
            throw new Error("Missing EvaluatorManager contract address");
        } else if (!contextParams.ExecutionManager) {
            throw new Error("Missing ExecutionManager contract address");
        }

        this.state = {
            network: Context.resolveNetwork(contextParams.network),
            signer: contextParams.signer,
            web3Providers: Context.resolveWeb3Providers(
                contextParams.web3Providers,
                Context.resolveNetwork(contextParams.network)
            ),
            AddressStorage: contextParams.AddressStorage,
            BudgetManager: contextParams.BudgetManager,
            ParamStorage: contextParams.ParamStorage,
            ParticipantStorage: contextParams.ParticipantStorage,
            EvaluatorStorage: contextParams.EvaluatorStorage,
            ProposalStorage: contextParams.ProposalStorage,
            AssessmentStorage: contextParams.AssessmentStorage,
            VoteStorage: contextParams.VoteStorage,
            ReceptionController: contextParams.ReceptionController,
            AssessmentController: contextParams.AssessmentController,
            VoteController: contextParams.VoteController,
            ParticipantManager: contextParams.ParticipantManager,
            EvaluatorManager: contextParams.EvaluatorManager,
            ExecutionManager: contextParams.ExecutionManager,
            gasFeeEstimationFactor: Context.resolveGasFeeEstimationFactor(contextParams.gasFeeEstimationFactor)
        };
    }

    set(contextParams: Partial<ContextParams>) {
        if (contextParams.network) {
            this.state.network = Context.resolveNetwork(contextParams.network);
        }
        if (contextParams.signer) {
            this.state.signer = contextParams.signer;
        }
        if (contextParams.web3Providers) {
            this.state.web3Providers = Context.resolveWeb3Providers(
                contextParams.web3Providers,
                Context.resolveNetwork(this.state.network)
            );
        }
        if (contextParams.AddressStorage) {
            this.state.AddressStorage = contextParams.AddressStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.AddressStorage =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].AddressStorage;
        }

        if (contextParams.BudgetManager) {
            this.state.BudgetManager = contextParams.BudgetManager;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.BudgetManager =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].BudgetManager;
        }

        if (contextParams.ParamStorage) {
            this.state.ParamStorage = contextParams.ParamStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ParamStorage =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].ParamStorage;
        }

        if (contextParams.ParticipantStorage) {
            this.state.ParticipantStorage = contextParams.ParticipantStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ParticipantStorage =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].ParticipantStorage;
        }

        if (contextParams.EvaluatorStorage) {
            this.state.EvaluatorStorage = contextParams.EvaluatorStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.EvaluatorStorage =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].EvaluatorStorage;
        }

        if (contextParams.ProposalStorage) {
            this.state.ProposalStorage = contextParams.ProposalStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ProposalStorage =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].ProposalStorage;
        }

        if (contextParams.AssessmentStorage) {
            this.state.AssessmentStorage = contextParams.AssessmentStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.AssessmentStorage =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].AssessmentStorage;
        }

        if (contextParams.VoteStorage) {
            this.state.VoteStorage = contextParams.VoteStorage;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.VoteStorage =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].VoteStorage;
        }

        if (contextParams.ReceptionController) {
            this.state.ReceptionController = contextParams.ReceptionController;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ReceptionController =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].ReceptionController;
        }

        if (contextParams.AssessmentController) {
            this.state.AssessmentController = contextParams.AssessmentController;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.AssessmentController =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].AssessmentController;
        }

        if (contextParams.VoteController) {
            this.state.VoteController = contextParams.VoteController;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.VoteController =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].VoteController;
        }

        if (contextParams.ParticipantManager) {
            this.state.ParticipantManager = contextParams.ParticipantManager;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ParticipantManager =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].ParticipantManager;
        }

        if (contextParams.EvaluatorManager) {
            this.state.EvaluatorManager = contextParams.EvaluatorManager;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.EvaluatorManager =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].EvaluatorManager;
        }

        if (contextParams.ExecutionManager) {
            this.state.ExecutionManager = contextParams.ExecutionManager;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.ExecutionManager =
                activeContractsList[this.state.network.toString() as keyof typeof activeContractsList].ExecutionManager;
        }

        if (contextParams.gasFeeEstimationFactor) {
            this.state.gasFeeEstimationFactor = Context.resolveGasFeeEstimationFactor(
                contextParams.gasFeeEstimationFactor
            );
        }
    }

    private static resolveGasFeeEstimationFactor(gasFeeEstimationFactor?: number): number {
        if (typeof gasFeeEstimationFactor === "undefined") return 1;
        else if (gasFeeEstimationFactor < 0 || gasFeeEstimationFactor > 1) {
            throw new Error("Gas estimation factor value should be a number between 0 and 1");
        }
        return gasFeeEstimationFactor;
    }
}
