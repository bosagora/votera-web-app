import { getNetwork as ethersGetNetwork, Networkish } from "@ethersproject/providers";
import { Network } from "@ethersproject/networks";
import { ADDITIONAL_NETWORKS } from "../client-common/constants";
import { UnsupportedNetworkError } from "multisig-wallet-sdk-common";

export function getNetwork(networkish: Networkish): Network {
    let network: Network | undefined;
    for (const nw of ADDITIONAL_NETWORKS) {
        switch (typeof networkish) {
            case "string":
                if (networkish === nw.name) {
                    network = nw;
                }
                break;
            case "number":
                if (networkish === nw.chainId) {
                    network = nw;
                }
                break;
            case "object":
                if (networkish.name === nw.name && networkish.chainId === nw.chainId) {
                    network = nw;
                }
                break;
            default:
                throw new UnsupportedNetworkError(networkish);
        }
    }
    if (!network) {
        network = ethersGetNetwork(networkish);
    }
    return network;
}
