import { ClientCore, Context, SupportedNetwork, SupportedNetworksArray } from "../../client-common";
import { IMultiSigWalletFactoryMethods } from "../../interface/IMultiSigWalletFactory";
import { CreateMultiSigWallet, NormalSteps, QueryOption, SortDirection, WalletDetails } from "../../interfaces";
import { ContractUtils, FailedCreateWallet } from "../../utils";

import { NoProviderError, NoSignerError, UnsupportedNetworkError } from "multisig-wallet-sdk-common";
import { MultiSigWalletFactory, MultiSigWalletFactory__factory } from "multisig-wallet-contracts-lib";

import { getNetwork } from "../../utils/Utilty";
import { Provider } from "@ethersproject/providers";

export class MultiSigWalletFactoryMethods extends ClientCore implements IMultiSigWalletFactoryMethods {
    constructor(context: Context) {
        super(context);
        Object.freeze(MultiSigWalletFactoryMethods.prototype);
        Object.freeze(this);
    }

    public async *create(
        name: string,
        description: string,
        members: string[],
        required: number,
        seed: number
    ): AsyncGenerator<CreateMultiSigWallet> {
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

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            signer
        );

        try {
            const tx = await contract.create(name, description, members, required, seed);
            yield {
                key: NormalSteps.SENT,
                creator: await signer.getAddress(),
                members,
                required,
                txHash: tx.hash
            };

            const address = await ContractUtils.getEventValueString(
                tx,
                contract.interface,
                "ContractInstantiation",
                "wallet"
            );

            if (address !== undefined) {
                yield {
                    key: NormalSteps.SUCCESS,
                    address
                };
            } else {
                throw new FailedCreateWallet();
            }
        } catch (error) {
            throw new FailedCreateWallet();
        }
    }

    public async getNumberOfWalletsForCreator(creator: string): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );
        return (await contract.getNumberOfWalletsForCreator(creator)).toNumber();
    }

    public async getWalletsForCreator(creator: string, from: number, to: number): Promise<WalletDetails[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );
        const res = await contract.getWalletsForCreator(creator, from, to);
        return res.map((m) => {
            return {
                address: m.wallet,
                metadata: {
                    name: m.name,
                    description: m.description
                },
                creationDate: new Date(m.createdTime.toNumber() * 1000),
                chain: network.chainId
            };
        });
    }

    public async getNumberOfWalletsForMember(owner: string): Promise<number> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );
        return (await contract.getNumberOfWalletsForMember(owner)).toNumber();
    }

    public async getWalletsForMember(owner: string, from: number, to: number): Promise<WalletDetails[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );
        const res = await contract.getWalletsForMember(owner, from, to);
        return res.map((m) => {
            return {
                address: m.wallet,
                metadata: {
                    name: m.name,
                    description: m.description
                },
                creationDate: new Date(m.createdTime.toNumber() * 1000),
                chain: network.chainId
            };
        });
    }

    public async getWallets(account: string, option: QueryOption): Promise<WalletDetails[]> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        console.log(`network: ${JSON.stringify(network)}`);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );

        //console.log(`getWallets account: ${this.web3.getWalletFactoryAddress()} ${account}`);

        const length1 = await contract.getNumberOfWalletsForMember(account);
        //console.log(`getWallets length: ${account} ${length1.toString()}`);
        const length = (await contract.getNumberOfWalletsForMember(account)).toNumber();

        const skip = option.skip !== undefined ? option.skip : 0;
        const limit = option.limit !== undefined ? option.limit : 16;
        //console.log(`length : ${length}`);
        //console.log(`skip : ${skip}`);
        //console.log(`limit : ${limit}`);
        //console.log(`direction : ${option.direction}`);
        if (option.direction === SortDirection.ASC) {
            const from = skip;
            const to = skip + limit > length ? length : skip + limit;
            const res = to > from ? await this.getWalletsForMember(account, from, to) : [];
            return res;
        } else {
            const to = length - skip;
            const last = skip + limit;
            const from = last > length ? 0 : length - last;
            const res = to > from ? await this.getWalletsForMember(account, from, to) : [];
            return res.reverse();
        }
    }

    public async getWalletDetail(wallet: string): Promise<WalletDetails> {
        const provider = this.web3.getProvider() as Provider;
        if (!provider) throw new NoProviderError();

        const network = getNetwork((await provider.getNetwork()).chainId);
        const networkName = network.name as SupportedNetwork;
        if (!SupportedNetworksArray.includes(networkName)) {
            throw new UnsupportedNetworkError(networkName);
        }

        const contract: MultiSigWalletFactory = MultiSigWalletFactory__factory.connect(
            this.web3.getWalletFactoryAddress(),
            provider
        );
        const res = await contract.getWalletInfo(wallet);
        return {
            address: res.wallet,
            metadata: {
                name: res.name,
                description: res.description
            },
            creationDate: new Date(res.createdTime.toNumber() * 1000),
            chain: network.chainId
        };
    }
}
