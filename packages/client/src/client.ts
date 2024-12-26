import { ClientCore, Context } from "./client-common";
import { IMultiSigWalletFactory, IMultiSigWalletFactoryMethods } from "./interface/IMultiSigWalletFactory";
import { MultiSigWalletFactoryMethods } from "./internal/client/MultiSigWalletFactoryMethods";
import { IMultiSigWallet, IMultiSigWalletMethods } from "./interface/IMultiSigWallet";
import { MultiSigWalletMethods } from "./internal/client/MultiSigWalletMethods";
import { IClientEstimation, IClientEstimationMethods } from "./interface/IClientEstimation";
import { ClientEstimationMethods } from "./internal/client/ClientEstimationMethods";
import { Signer } from "@ethersproject/abstract-signer";

/**
 * Provider a generic client with high level methods to manage and interact
 */
export class Client extends ClientCore implements IMultiSigWalletFactory, IMultiSigWallet, IClientEstimation {
    private readonly privateWalletFactoryMethods: IMultiSigWalletFactoryMethods;
    private readonly privateWalletMethods: IMultiSigWalletMethods;
    private readonly privateEstimationMethods: IClientEstimationMethods;

    constructor(context: Context) {
        super(context);
        this.privateWalletFactoryMethods = new MultiSigWalletFactoryMethods(context);
        this.privateWalletMethods = new MultiSigWalletMethods(context);
        this.privateEstimationMethods = new ClientEstimationMethods(context);
        Object.freeze(Client.prototype);
        Object.freeze(this);
    }

    /** Replaces the current signer by the given one */
    public useSigner(signer: Signer): void {
        if (!signer) {
            throw new Error("Empty wallet or signer");
        }
        this.web3.useSigner(signer);
        this.privateWalletFactoryMethods.web3.useSigner(signer);
        this.privateWalletMethods.web3.useSigner(signer);
    }

    public get multiSigWalletFactory(): IMultiSigWalletFactoryMethods {
        return this.privateWalletFactoryMethods;
    }

    public get multiSigWallet(): IMultiSigWalletMethods {
        return this.privateWalletMethods;
    }
    public get estimation(): IClientEstimationMethods {
        return this.privateEstimationMethods;
    }
}
