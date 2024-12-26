import { ClientCore, Context, GasFeeEstimation, SupportedNetwork, SupportedNetworksArray } from "../../client-common";
import { IClientEstimationMethods } from "../../interface/IClientEstimation";
import { NoProviderError, NoSignerError, UnsupportedNetworkError } from "multisig-wallet-sdk-common";
import { getNetwork } from "../../utils/Utilty";
import {
    MultiSigWallet__factory,
    MultiSigWalletFactory,
    MultiSigWalletFactory__factory
} from "multisig-wallet-contracts-lib";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { ABIStorage } from "../../utils";

export class ClientEstimationMethods extends ClientCore implements IClientEstimationMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(ClientEstimationMethods.prototype);
        Object.freeze(this);
    }

    public async create(
        name: string,
        description: string,
        owners: string[],
        required: number,
        seed: number
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const factoryInstance: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            signer
        );
        const gasEstimation = await factoryInstance.estimateGas.create(name, description, owners, required, seed);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransaction(
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        value: BigNumberish,
        data: string
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            destination,
            value,
            data
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async confirmTransaction(walletAddress: string, transactionId: BigNumber): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const gasEstimation = await walletInstance.estimateGas.confirmTransaction(transactionId);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async revokeConfirmation(walletAddress: string, transactionId: BigNumber): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const gasEstimation = await walletInstance.estimateGas.confirmTransaction(transactionId);
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionAddOwner(
        walletAddress: string,
        title: string,
        description: string,
        owner: string
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "addOwner", [owner]);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            walletAddress,
            0,
            encoded
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionRemoveOwner(
        walletAddress: string,
        title: string,
        description: string,
        owner: string
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "removeOwner", [owner]);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            walletAddress,
            0,
            encoded
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionReplaceOwner(
        walletAddress: string,
        title: string,
        description: string,
        owner: string,
        newOwner: string
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const encoded = ABIStorage.encodeFunctionData("MultiSigWallet", "replaceOwner", [owner, newOwner]);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            walletAddress,
            0,
            encoded
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionNativeTransfer(
        walletAddress: string,
        title: string,
        description: string,
        to: string,
        amount: BigNumber
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(title, description, to, amount, "0x");
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionTokenTransfer(
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        to: string,
        amount: BigNumber
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const encoded = ABIStorage.encodeFunctionData("MultiSigToken", "transfer", [to, amount]);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            destination,
            0,
            encoded
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }

    public async submitTransactionTokenApprove(
        walletAddress: string,
        title: string,
        description: string,
        destination: string,
        spender: string,
        amount: BigNumber
    ): Promise<GasFeeEstimation> {
        const signer = this.web3.getConnectedSigner();
        if (!signer) {
            throw new NoSignerError();
        } else if (!signer.provider) {
            throw new NoProviderError();
        }
        const providerNetwork = await signer.provider.getNetwork();
        const network = getNetwork(providerNetwork.chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }
        const walletInstance = MultiSigWallet__factory.connect(walletAddress, signer);
        const encoded = ABIStorage.encodeFunctionData("MultiSigToken", "approve", [spender, amount]);
        const gasEstimation = await walletInstance.estimateGas.submitTransaction(
            title,
            description,
            destination,
            0,
            encoded
        );
        return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
    }
}
