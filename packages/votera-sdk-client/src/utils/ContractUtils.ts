import { defaultAbiCoder, Interface } from "@ethersproject/abi";
import { Signer } from "@ethersproject/abstract-signer";
import { verifyMessage } from "@ethersproject/wallet";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractReceipt, ContractTransaction } from "@ethersproject/contracts";
import { Log } from "@ethersproject/providers";
import { id } from "@ethersproject/hash";
import { keccak256 } from "@ethersproject/keccak256";
import { randomBytes } from "@ethersproject/random";

export class ContractUtils {
    /**
     * Convert hexadecimal strings into Buffer.
     * @param hex The hexadecimal string
     */
    public static StringToBuffer(hex: string): Buffer {
        const start = hex.substring(0, 2) === "0x" ? 2 : 0;
        return Buffer.from(hex.substring(start), "hex");
    }

    /**
     * Convert Buffer into hexadecimal strings.
     * @param data The data
     */
    public static BufferToString(data: Buffer): string {
        return "0x" + data.toString("hex");
    }

    public static getTimeStamp(): number {
        return Math.floor(new Date().getTime() / 1000);
    }

    public static delay(interval: number): Promise<void> {
        return new Promise<void>((resolve, _) => {
            setTimeout(resolve, interval);
        });
    }

    public static async getEventValue(
        tx: ContractTransaction,
        iface: Interface,
        event: string,
        field: string
    ): Promise<string | undefined> {
        const contractReceipt = await tx.wait();
        const log = ContractUtils.findLog(contractReceipt, iface, event);
        if (log !== undefined) {
            const parsedLog = iface.parseLog(log);
            return parsedLog.args[field].toString();
        }
        return undefined;
    }

    public static async getEventValueBigNumber(
        tx: ContractTransaction,
        iface: Interface,
        event: string,
        field: string
    ): Promise<BigNumber | undefined> {
        const contractReceipt = await tx.wait();
        const log = ContractUtils.findLog(contractReceipt, iface, event);
        if (log !== undefined) {
            const parsedLog = iface.parseLog(log);
            return parsedLog.args[field];
        }
        return undefined;
    }

    public static async getEventValueString(
        tx: ContractTransaction,
        iface: Interface,
        event: string,
        field: string
    ): Promise<string | undefined> {
        const contractReceipt = await tx.wait();
        const log = ContractUtils.findLog(contractReceipt, iface, event);
        if (log !== undefined) {
            const parsedLog = iface.parseLog(log);
            return parsedLog.args[field];
        }
        return undefined;
    }

    private static find1_message = "execution reverted:";
    private static find1_length = ContractUtils.find1_message.length;
    private static find2_message = "reverted with reason string";
    private static find2_length = ContractUtils.find2_message.length;
    private static find3_message = "VM Exception while processing transaction: revert";
    private static find3_length = ContractUtils.find3_message.length;
    public static cacheEVMError(root: any): string {
        const reasons: string[] = [];
        let error = root;
        while (error !== undefined) {
            if (error.reason) {
                const reason = String(error.reason);
                let idx = reason.indexOf(ContractUtils.find1_message);
                let message: string;
                if (idx >= 0) {
                    message = reason.substring(idx + ContractUtils.find1_length).trim();
                    reasons.push(message);
                }
                idx = reason.indexOf(ContractUtils.find2_message);
                if (idx >= 0) {
                    message = reason
                        .substring(idx + ContractUtils.find2_length)
                        .trim()
                        .replace(/[/']/gi, "");
                    reasons.push(message);
                }
                idx = reason.indexOf(ContractUtils.find3_message);
                if (idx >= 0) {
                    message = reason
                        .substring(idx + ContractUtils.find3_length)
                        .trim()
                        .replace(/[/']/gi, "");
                    reasons.push(message);
                }
            } else if (error.message) {
                const reason = String(error.message);
                let idx = reason.indexOf(ContractUtils.find1_message);
                let message: string;
                if (idx >= 0) {
                    message = reason.substring(idx + ContractUtils.find1_length).trim();
                    reasons.push(message);
                }
                idx = reason.indexOf(ContractUtils.find2_message);
                if (idx >= 0) {
                    message = reason
                        .substring(idx + ContractUtils.find2_length)
                        .trim()
                        .replace(/[/']/gi, "");
                    reasons.push(message);
                }
                idx = reason.indexOf(ContractUtils.find3_message);
                if (idx >= 0) {
                    message = reason
                        .substring(idx + ContractUtils.find3_length)
                        .trim()
                        .replace(/[/']/gi, "");
                    reasons.push(message);
                }
            }
            error = error.error;
        }

        if (reasons.length > 0) {
            return reasons[0];
        }

        if (root.message) {
            return root.message;
        } else {
            return root.toString();
        }
    }

    public static isErrorOfEVM(error: any): boolean {
        while (error !== undefined) {
            if (error.reason) {
                return true;
            }
            error = error.error;
        }
        return false;
    }

    public static async signMessage(signer: Signer, message: Uint8Array): Promise<string> {
        return signer.signMessage(message);
    }

    public static verifyMessage(account: string, message: Uint8Array, signature: string): boolean {
        let res: string;
        try {
            res = verifyMessage(message, signature);
        } catch (error) {
            return false;
        }
        return res.toLowerCase() === account.toLowerCase();
    }

    public static findLog(receipt: ContractReceipt, iface: Interface, eventName: string): Log | undefined {
        return receipt.logs.find((log) => log.topics[0] === id(iface.getEvent(eventName).format("sighash")));
    }

    public static getRandomId(): string {
        const encodedResult = defaultAbiCoder.encode(["bytes32", "bytes32"], [randomBytes(32), randomBytes(32)]);
        return keccak256(encodedResult);
    }
}
