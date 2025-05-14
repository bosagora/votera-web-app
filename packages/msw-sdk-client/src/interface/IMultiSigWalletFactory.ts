import { IClientCore } from "../client-common";
import { CreateMultiSigWallet, QueryOption, WalletDetails } from "../interfaces";

export interface IMultiSigWalletFactory {
    multiSigWalletFactory: IMultiSigWalletFactoryMethods;
}

/** Defines the shape of the general purpose Client class */
export interface IMultiSigWalletFactoryMethods extends IClientCore {
    create: (
        name: string,
        description: string,
        members: string[],
        required: number,
        seed: number
    ) => AsyncGenerator<CreateMultiSigWallet>;
    getNumberOfWalletsForCreator: (creator: string) => Promise<number>;
    getWalletsForCreator: (creator: string, from: number, to: number) => Promise<WalletDetails[]>;

    getNumberOfWalletsForMember: (member: string) => Promise<number>;
    getWalletsForMember: (member: string, from: number, to: number) => Promise<WalletDetails[]>;

    getWalletDetail: (wallet: string) => Promise<WalletDetails>;

    getWallets: (account: string, option: QueryOption) => Promise<WalletDetails[]>;
}
