import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Bytes } from "@ethersproject/bytes";
import { defineReadOnly, Deferrable } from "@ethersproject/properties";
import { BlockTag, Provider, TransactionRequest, TransactionResponse } from "@ethersproject/providers";

export class GasPriceManager extends Signer {
    readonly signer: Signer;

    constructor(signer: Signer) {
        super();
        this.signer = signer;
        defineReadOnly(this, "signer", signer);
        // @ts-ignore
        defineReadOnly(this, "provider", signer.provider || null);
    }

    connect(provider: Provider): GasPriceManager {
        return new GasPriceManager(this.signer.connect(provider));
    }

    getAddress(): Promise<string> {
        return this.signer.getAddress();
    }

    getTransactionCount(blockTag?: BlockTag): Promise<number> {
        return this.signer.getTransactionCount(blockTag);
    }

    signMessage(message: Bytes | string): Promise<string> {
        return this.signer.signMessage(message);
    }

    signTransaction(transaction: Deferrable<TransactionRequest>): Promise<string> {
        return this.signer.signTransaction(transaction);
    }

    sendTransaction(transaction: Deferrable<TransactionRequest>): Promise<TransactionResponse> {
        const provider = this.signer.provider;
        if (provider === undefined) {
            const maxPriorityFeePerGas = 1500000000;
            const maxFeePerGas = maxPriorityFeePerGas;

            transaction.maxPriorityFeePerGas = BigNumber.from(maxPriorityFeePerGas);
            transaction.maxFeePerGas = BigNumber.from(maxFeePerGas);
            return this.signer.sendTransaction(transaction).then((tx) => {
                return tx;
            });
        }
        return provider.getBlock("latest").then((block) => {
            const baseFeePerGas = block.baseFeePerGas != null ? block.baseFeePerGas.toNumber() : 0;
            const maxPriorityFeePerGas = 1500000000;
            const maxFeePerGas = Math.floor(baseFeePerGas * 1.265625) + maxPriorityFeePerGas;

            transaction.maxPriorityFeePerGas = BigNumber.from(maxPriorityFeePerGas);
            transaction.maxFeePerGas = BigNumber.from(maxFeePerGas);
            return this.signer.sendTransaction(transaction).then((tx) => {
                return tx;
            });
        });
    }
}
