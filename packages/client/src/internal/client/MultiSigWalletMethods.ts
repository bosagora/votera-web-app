import { ClientCore, SupportedNetwork, SupportedNetworksArray } from "../../client-common";
import { IMultiSigWalletMethods } from "../../interface/IMultiSigWallet";
import {
    NormalSteps,
    SubmitTransaction,
    ConfirmTransaction,
    RevokeTransaction,
    ContractTransactionData
} from "../../interfaces";

import { NoProviderError, NoSignerError, UnsupportedNetworkError } from "multisig-wallet-sdk-common";
import { MultiSigWallet, MultiSigWallet__factory } from "multisig-wallet-contracts-lib";

import { ABIStorage, ContractUtils } from "../../utils/";
import {
    FailedConfirmTransaction,
    FailedRevokeTransaction,
    FailedSubmitTransaction,
    NoWalletAddress
} from "../../utils";

import { Signer } from "@ethersproject/abstract-signer";
import { getNetwork } from "../../utils/Utilty";
import { Provider } from "@ethersproject/providers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export class MultiSigWalletMethods extends ClientCore implements IMultiSigWalletMethods {
    private walletAddress: string | undefined;

    public attach(walletAddress: string) {
        this.walletAddress = walletAddress;
    }

    private getWalletContract(signerOrProvider: Signer | Provider): MultiSigWallet {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        return MultiSigWallet__factory.connect(this.walletAddress, signerOrProvider);
    }

    public async getMembers(): Promise<string[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);

        return await contract.getMembers();
    }

    public async getRequired(): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return (await contract.getRequired()).toNumber();
    }

    public async isOwner(account: string): Promise<boolean> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return await contract.isOwner(account);
    }

    public async getTransactionCount(): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        if (this.walletAddress === undefined) throw new NoWalletAddress();

        const contract: MultiSigWallet = MultiSigWallet__factory.connect(this.walletAddress, provider);
        return (await contract.getTransactionCount()).toNumber();
    }

    public async getTransaction(transactionId: BigNumber): Promise<ContractTransactionData> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        const res = await contract.getTransaction(transactionId);
        return {
            id: res.id,
            title: res.title,
            description: res.description,
            creator: res.creator,
            createdTime: res.createdTime,
            destination: res.destination,
            value: res.value,
            data: res.data,
            executed: res.executed,
            approval: res.approval
        };
    }

    public async getTransactionsInRange(from: number, to: number): Promise<ContractTransactionData[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        const res = await contract.getTransactionsInRange(from, to);
        return res.map((m) => {
            return {
                id: m.id,
                title: m.title,
                description: m.description,
                creator: m.creator,
                createdTime: m.createdTime,
                destination: m.destination,
                value: m.value,
                data: m.data,
                executed: m.executed,
                approval: m.approval
            };
        });
    }

    public async getConfirmationCount(transactionId: BigNumber): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return (await contract.getConfirmationCount(transactionId)).toNumber();
    }

    public async getConfirmations(transactionId: BigNumber): Promise<string[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return await contract.getConfirmations(transactionId);
    }

    public async *submitTransaction(
        title: string,
        description: string,
        destination: string,
        value: BigNumberish,
        data: string
    ): AsyncGenerator<SubmitTransaction> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }

        const network = getNetwork((await signer.provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(signer);

        let success = true;
        try {
            const tx = await contract.submitTransaction(title, description, destination, value, data);
            yield {
                key: NormalSteps.SENT,
                txHash: tx.hash
            };

            const transactionId = await ContractUtils.getEventValueBigNumber(
                tx,
                contract.interface,
                "Submission",
                "transactionId"
            );

            if (transactionId !== undefined) {
                yield {
                    key: NormalSteps.SUCCESS,
                    transactionId
                };
            } else {
                success = false;
            }
        } catch (error) {
            success = false;
        }
        if (!success) throw new FailedSubmitTransaction();
    }

    public async *confirmTransaction(transactionId: BigNumber): AsyncGenerator<ConfirmTransaction> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }

        const network = getNetwork((await signer.provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(signer);

        let success = true;
        try {
            const tx = await contract.confirmTransaction(transactionId);
            yield {
                key: NormalSteps.SENT,
                txHash: tx.hash
            };

            const txId = await ContractUtils.getEventValueBigNumber(
                tx,
                contract.interface,
                "Confirmation",
                "transactionId"
            );

            if (txId !== undefined) {
                const contractReceipt = await tx.wait();
                const log = ContractUtils.findLog(contractReceipt, contract.interface, "ExecutionFailure");
                if (log === undefined) {
                    yield {
                        key: NormalSteps.SUCCESS,
                        transactionId: txId
                    };
                } else {
                    success = false;
                }
            } else {
                success = false;
            }
        } catch (error) {
            success = false;
        }
        if (!success) throw new FailedConfirmTransaction();
    }

    public async *revokeConfirmation(transactionId: BigNumber): AsyncGenerator<RevokeTransaction> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }

        const network = getNetwork((await signer.provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(signer);

        let success = true;
        try {
            const tx = await contract.revokeConfirmation(transactionId);
            yield {
                key: NormalSteps.SENT,
                txHash: tx.hash
            };

            const txId = await ContractUtils.getEventValueBigNumber(
                tx,
                contract.interface,
                "Revocation",
                "transactionId"
            );

            if (txId !== undefined) {
                yield {
                    key: NormalSteps.SUCCESS,
                    transactionId: txId
                };
            } else {
                success = false;
            }
        } catch (error) {
            success = false;
        }
        if (!success) throw new FailedRevokeTransaction();
    }

    public async getTransactionCountInCondition(
        from: number,
        to: number,
        pending: boolean,
        executed: boolean
    ): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return (await contract.getTransactionCountInCondition(from, to, pending, executed)).toNumber();
    }

    public async getTransactionIdsInCondition(
        from: number,
        to: number,
        pending: boolean,
        executed: boolean
    ): Promise<BigNumber[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract = this.getWalletContract(provider);
        return await contract.getTransactionIdsInCondition(from, to, pending, executed);
    }

    public async *submitTransactionAddMember(
        title: string,
        description: string,
        owner: string
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "addMember", [owner]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionRemoveMember(
        title: string,
        description: string,
        owner: string
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "removeMember", [owner]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionReplaceMember(
        title: string,
        description: string,
        owner: string,
        newOwner: string
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "replaceMember", [owner, newOwner]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionChangeMember(
        title: string,
        description: string,
        additionalMembers: string[],
        removalMembers: string[]
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "changeMember", [
            additionalMembers,
            removalMembers
        ]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionChangeRequirement(
        title: string,
        description: string,
        required: number
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "changeRequirement", [required]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionChangeMetadata(
        title: string,
        description: string,
        walletName: string,
        walletDescription: string
    ): AsyncGenerator<SubmitTransaction> {
        if (this.walletAddress === undefined) throw new NoWalletAddress();
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "changeMetadata", [
            walletName,
            walletDescription
        ]);
        for await (const commit of this.submitTransaction(title, description, this.walletAddress, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionNativeTransfer(
        title: string,
        description: string,
        to: string,
        amount: BigNumber
    ): AsyncGenerator<SubmitTransaction> {
        for await (const commit of this.submitTransaction(title, description, to, amount, "0x")) {
            yield commit;
        }
    }

    public async *submitTransactionTokenTransfer(
        title: string,
        description: string,
        destination: string,
        to: string,
        amount: BigNumber
    ): AsyncGenerator<SubmitTransaction> {
        const encoded = ABIStorage.encodeFunctionData("MultiSigToken", "transfer", [to, amount]);
        for await (const commit of this.submitTransaction(title, description, destination, 0, encoded)) {
            yield commit;
        }
    }

    public async *submitTransactionTokenApprove(
        title: string,
        description: string,
        destination: string,
        spender: string,
        amount: BigNumber
    ): AsyncGenerator<SubmitTransaction> {
        const encoded = ABIStorage.encodeFunctionData("MultiSigToken", "approve", [spender, amount]);
        for await (const commit of this.submitTransaction(title, description, destination, 0, encoded)) {
            yield commit;
        }
    }
}
