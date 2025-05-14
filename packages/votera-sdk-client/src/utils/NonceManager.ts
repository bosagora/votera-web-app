import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Bytes } from "@ethersproject/bytes";
import { defineReadOnly, Deferrable, shallowCopy } from "@ethersproject/properties";
import { BlockTag, Provider, TransactionRequest, TransactionResponse } from "@ethersproject/providers";

export class NonceManager extends Signer {
    readonly signer: Signer;

    _initialPromise: Promise<number> | undefined = undefined;
    _deltaCount: number;

    constructor(signer: Signer) {
        super();
        this.signer = signer;
        this._deltaCount = 0;
        defineReadOnly(this, "signer", signer);
        // @ts-ignore
        defineReadOnly(this, "provider", signer.provider || null);
    }

    connect(provider: Provider): NonceManager {
        return new NonceManager(this.signer.connect(provider));
    }

    getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    getTransactionCount(blockTag?: BlockTag): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            if (blockTag === "pending") {
                if (this._initialPromise === undefined) {
                    this._initialPromise = this.signer.getTransactionCount("pending");
                }
                const deltaCount = this._deltaCount;
                this._initialPromise
                    .then((initial) => {
                        resolve(initial + deltaCount);
                    })
                    .catch(reject);
            } else {
                this.signer
                    .getTransactionCount(blockTag)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    setTransactionCount(transactionCount: BigNumberish | Promise<BigNumberish>): void {
        this._initialPromise = Promise.resolve(transactionCount).then((nonce) => {
            return BigNumber.from(nonce).toNumber();
        });
        this._deltaCount = 0;
    }

    incrementTransactionCount(count?: number): void {
        this._deltaCount += count == null ? 1 : count;
    }

    signMessage(message: Bytes | string): Promise<string> {
        return this.signer.signMessage(message);
    }

    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
        return this.signer.signTransaction(transaction);
    }

    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        return new Promise<TransactionResponse>((resolve, reject) => {
            if (transaction.nonce === undefined) {
                transaction = shallowCopy(transaction);
                transaction.nonce = this.getTransactionCount("pending");
                this.incrementTransactionCount();
            } else {
                this.setTransactionCount(transaction.nonce as BigNumberish);
                this._deltaCount++;
            }
            return this.signer
                .sendTransaction(transaction)
                .then(resolve)
                .catch(reject);
        });
    }
}
