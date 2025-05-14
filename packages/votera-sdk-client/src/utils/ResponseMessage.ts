import { ContractUtils } from "./ContractUtils";

export class ResponseMessage {
    static messages: Map<string, string> = new Map([
        // General (0000)
        ["0000", "Operation completed successfully."],

        // Input Validation (1001-1049)
        ["1001", "Invalid address: Address cannot be null or zero address."],
        ["1002", "Transfer failed: BOA transfer operation failed."],

        // Authorization & Access Control (1050-1099)
        ["1051", "Access denied: Caller must be Assessment Controller."],
        ["1052", "Access denied: Caller must be Reception Controller."],
        ["1053", "Access denied: Caller must be Vote Controller."],
        ["1054", "Access denied: Caller must be a Controller."],
        ["1061", "Access denied: Caller must be Participant Manager."],
        ["1062", "Access denied: Caller must be Budget Manager."],
        ["1063", "Access denied: Caller must be Execution Manager."],
        ["1066", "Access denied: Caller must be Proposal Storage."],
        ["1071", "Access denied: Caller must be authorized for final execution."],

        // Proposal Related (1100-1149)
        ["1101", "Proposal not found: No data exists for the given proposal ID."],
        ["1102", "Index out of bounds: The requested index exceeds array limits."],
        ["1103", "Invalid proposal ID: Proposal ID cannot be null."],
        ["1104", "Duplicate proposal ID: This proposal ID is already registered."],
        ["1105", "Invalid wallet address: Wallet address cannot be null."],
        ["1106", "Invalid withdrawal: Only approved business proposals can be withdrawn."],
        ["1107", "Incomplete voting: The voting period has not ended yet."],
        ["1108", "Already withdrawn: The funds have already been withdrawn."],
        ["1109", "Invalid proposal fee: Insufficient fee amount provided."],

        // Process State (1120-1149)
        ["1124", "Invalid proposal state: Proposal is not in the correct state."],
        ["1126", "Invalid participant state: Participant is not in the correct state."],

        // Fee Related (1150-1159)
        ["1150", "Insufficient fee: The provided fee amount is less than required."],

        // Security & Upgrade (1128-1139)
        ["1128", "Unauthorized upgrade: Caller does not have upgrade privileges."],
        ["1129", "Invalid implementation: New implementation address is invalid."],
        ["1130", "Duplicate signature: This address has already signed."],

        // System State (1180-1199)
        ["1181", "System paused: Operations are temporarily suspended."],
        ["1182", "System active: Operations are currently running."],

        // Execution Transition (1160-1169)
        ["1162", "Invalid execution transition: Execution failed and state was reverted."],

        // Component Related (2001-2020)
        ["2001", "Invalid IssuedContract address"],
        ["2002", "Invalid assessment storage address"],
        ["2003", "Invalid param storage address"],
        ["2004", "Invalid participant storage address"],
        ["2005", "Invalid proposal storage address"],
        ["2006", "Invalid vote storage address"],
        ["2007", "Invalid assessment controller address"],
        ["2008", "Invalid reception controller address"],
        ["2009", "Invalid vote controller address"],
        ["2010", "Invalid budget manager address"],
        ["2011", "Invalid participant manager address"],
        ["2012", "Invalid execution manager address"],

        // Participant Related (1110-1119)
        ["1110", "Invalid proposer: Address does not match the proposal creator."],
        ["1111", "Empty participant list: Cannot add empty participant list."],
        ["1112", "Invalid voter: Address is not a registered voter for this proposal."],
        ["1113", "Invalid validator key: Validator key cannot be empty."],
        ["1114", "Duplicate validator key: This validator key is already registered."],
        ["1115", "Duplicate participant: This address is already registered."],
        ["1116", "Invalid participant: Address is not in participant list."],
        ["1117", "Maximum participants reached: Cannot add more participants."],
        ["1118", "Invalid participant package: Package does not exist for proposal."],
        ["1119", "Invalid participant index: Index out of bounds."],

        // Process State (1120-1149)
        ["1120", "Invalid period: Not in assessment period."],
        ["1121", "Invalid participant: Must be a registered participant."],
        ["1122", "Invalid range: Requested range exceeds limits."],

        // Vote Related (1140-1149)
        ["1140", "Invalid vote: Vote has already been cast."],
        ["1141", "Invalid vote period: Voting period has not started."],
        ["1142", "Invalid vote period: Voting period has ended."],
        ["1143", "Invalid quorum: Minimum participation not reached."],
        ["1144", "Invalid vote result: Vote result is not conclusive."],
        ["1145", "Invalid vote choice: Choice must be within valid range."],

        // Assessment Related (1130-1139)
        ["1131", "Invalid assessment: Assessment has already been submitted."],
        ["1132", "Invalid assessment period: Assessment period has not started."],
        ["1133", "Invalid assessment period: Assessment period has ended."],
        ["1134", "Invalid assessment score: Score must be within valid range."],
        ["1135", "Invalid assessment threshold: Minimum assessment criteria not met."],

        // Proposal Execution (1170-1179)
        ["1170", "Invalid execution: Proposal is not in executable state."],
        ["1171", "Invalid execution: Required conditions not met."],
        ["1172", "Execution failed: Transaction reverted."],
        ["1173", "Invalid execution period: Execution period has not started."],
        ["1174", "Invalid execution period: Execution period has ended."]
    ]);

    public static getEVMErrorMessage(error: any): { code: number; error: any } {
        const code = ContractUtils.cacheEVMError(error);
        const message = ResponseMessage.messages.get(code);
        if (message !== undefined) {
            return { code: Number(code), error: { message } };
        }

        if (code !== "") {
            const defaultCode = "5000";
            const defaultMessage = code;
            if (defaultMessage !== undefined) {
                return { code: Number(defaultCode), error: { message: defaultMessage } };
            }
        } else if (ContractUtils.isErrorOfEVM(error)) {
            const defaultCode = "5000";
            const defaultMessage = error.reason ? error.reason : ResponseMessage.messages.get(defaultCode);
            if (defaultMessage !== undefined) {
                return { code: Number(defaultCode), error: { message: defaultMessage } };
            }
        } else if (error instanceof Error && error.message) {
            return { code: 9000, error: { message: error.message.substring(0, 64) } };
        }
        return { code: 9000, error: { message: "Unknown Error" } };
    }

    public static getErrorMessage(code: string, additional?: any): { code: number; error: any } {
        const message = ResponseMessage.messages.get(code);
        if (message !== undefined) {
            return { code: Number(code), error: { message, ...additional } };
        }
        return { code: 9000, error: { message: "Unknown Error" } };
    }
}
