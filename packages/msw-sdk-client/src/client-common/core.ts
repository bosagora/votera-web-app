import { IClientCore, IClientWeb3Core } from "./interfaces/core";
import { Context } from "./context";
import { Web3Module } from "./modules/web3";

const web3Map = new Map<ClientCore, IClientWeb3Core>();

/**
 * Provides the low level foundation so that subclasses have ready-made access to Web3, IPFS and GraphQL primitives
 */
export abstract class ClientCore implements IClientCore {
    constructor(context: Context) {
        web3Map.set(this, new Web3Module(context));
        Object.freeze(ClientCore.prototype);
    }

    get web3(): IClientWeb3Core {
        return web3Map.get(this)!;
    }
}
