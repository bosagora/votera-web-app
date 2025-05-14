import { ClientCore, Context } from "./client-common";
import { ClientMethods } from "./internal/client/ClientMethods";
import { IClient, IClientMethods } from "./interface/IClientMethods";
import { IClientEstimation, IClientEstimationMethods } from "./interface/IClientEstimation";
import { ClientEstimationMethods } from "./internal/client/ClientEstimationMethods";

import { Signer } from "@ethersproject/abstract-signer";

export class Client extends ClientCore implements IClient, IClientEstimation {
    private readonly privateMethods: ClientMethods;
    private readonly privateEstimationMethods: IClientEstimationMethods;

    constructor(context: Context) {
        super(context);
        this.privateMethods = new ClientMethods(context);
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
        this.privateMethods.web3.useSigner(signer);
    }

    public get methods(): IClientMethods {
        return this.privateMethods;
    }

    public get estimation(): IClientEstimationMethods {
        return this.privateEstimationMethods;
    }
}
