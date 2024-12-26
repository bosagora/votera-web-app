import { ContextParams, ContextState } from "./interfaces/context";
import { SupportedNetwork, SupportedNetworksArray } from "./interfaces/common";
import { getNetwork } from "../utils/Utilty";

import { InvalidAddressError, UnsupportedProtocolError } from "multisig-wallet-sdk-common";
import { activeContractsList } from "multisig-wallet-contracts-lib";
import { UnsupportedNetworkError } from "multisig-wallet-sdk-common";

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
        chainId: 1
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
        return this.state.network || defaultState.network;
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

    /**
     * Getter for the gas fee reducer used in estimations
     *
     * @var gasFeeEstimationFactor
     *
     * @returns {number}
     *
     * @public
     */
    get gasFeeEstimationFactor(): number {
        return this.state.gasFeeEstimationFactor || defaultState.gasFeeEstimationFactor;
    }

    get walletFactoryAddress(): string | undefined {
        return this.state.walletFactoryAddress;
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

    private static transNetwork(network: Networkish): Networkish {
        if (typeof network === "string") {
            if (network === "bosagora_mainnet") {
                return {
                    name: network,
                    chainId: 2151
                };
            } else if (network === "bosagora_testnet") {
                return {
                    name: network,
                    chainId: 2019
                };
            } else if (network === "bosagora_devnet") {
                return {
                    name: network,
                    chainId: 24600
                };
            } else if (network === "acc_sidechain_mainnet") {
                return {
                    name: network,
                    chainId: 215100
                };
            } else if (network === "acc_sidechain_testnet") {
                return {
                    name: network,
                    chainId: 215105
                };
            } else if (network === "acc_sidechain_devnet") {
                return {
                    name: network,
                    chainId: 24680
                };
            } else {
                return network;
            }
        } else if (typeof network === "number") {
            if (network === 2151) {
                return {
                    name: "bosagora_mainnet",
                    chainId: 2151
                };
            } else if (network === 2019) {
                return {
                    name: "bosagora_testnet",
                    chainId: 2019
                };
            } else if (network === 24600) {
                return {
                    name: "bosagora_devnet",
                    chainId: 24680
                };
            } else if (network === 215100) {
                return {
                    name: "acc_sidechain_mainnet",
                    chainId: 215100
                };
            } else if (network === 215105) {
                return {
                    name: "acc_sidechain_testnet",
                    chainId: 215105
                };
            } else if (network === 24680) {
                return {
                    name: "acc_sidechain_devnet",
                    chainId: 24680
                };
            } else {
                return network;
            }
        } else {
            return network;
        }
    }

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
        } else if (!contextParams.walletFactoryAddress) {
            throw new Error("Missing multi sig wallet factory contract address");
        } else if (!contextParams.gasFeeEstimationFactor) {
            throw new Error("No gas fee reducer defined");
        }

        this.state = {
            network: Context.resolveNetwork(contextParams.network),
            signer: contextParams.signer,
            web3Providers: Context.resolveWeb3Providers(
                contextParams.web3Providers,
                Context.resolveNetwork(contextParams.network)
            ),
            walletFactoryAddress: contextParams.walletFactoryAddress,
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
        if (contextParams.walletFactoryAddress) {
            this.state.walletFactoryAddress = contextParams.walletFactoryAddress;
        } else if (this.state.network.toString() in activeContractsList) {
            this.state.walletFactoryAddress =
                activeContractsList[
                    this.state.network.toString() as keyof typeof activeContractsList
                ].MultiSigWalletFactory;
        }
        if (contextParams.gasFeeEstimationFactor) {
            this.state.gasFeeEstimationFactor = Context.resolveGasFeeEstimationFactor(
                contextParams.gasFeeEstimationFactor
            );
        }
    }

    private static resolveGasFeeEstimationFactor(gasFeeEstimationFactor: number): number {
        if (typeof gasFeeEstimationFactor === "undefined") return 1;
        else if (gasFeeEstimationFactor < 0 || gasFeeEstimationFactor > 1) {
            throw new Error("Gas estimation factor value should be a number between 0 and 1");
        }
        return gasFeeEstimationFactor;
    }
}
