// @ts-ignore
import { UnfetchResponse } from "unfetch";

export class NetworkError extends Error {
    public status: number;
    public statusText: string;
    constructor(status: number, statusText: string) {
        super(statusText);
        this.name = "NetworkError";
        this.status = status;
        this.statusText = statusText;
    }
}

export class NotFoundError extends NetworkError {
    constructor(status: number, statusText: string) {
        super(status, statusText);
        this.name = "NotFoundError";
    }
}

export class BadRequestError extends NetworkError {
    constructor(status: number, statusText: string) {
        super(status, statusText);
        this.name = "BadRequestError";
    }
}

export class ClientError extends Error {
    public response: UnfetchResponse;

    constructor(res: UnfetchResponse) {
        super(res.statusText);
        this.name = "ClientError";
        this.response = res;
    }
}

export class NoAssessmentStorageAddress extends Error {
    constructor() {
        super("AssessmentStorage address is needed");
    }
}

export class NoBudgetManagerAddress extends Error {
    constructor() {
        super("BudgetManager address is needed");
    }
}

export class NoParamStorageAddress extends Error {
    constructor() {
        super("ParamStorage address is needed");
    }
}

export class NoAddressStorageAddress extends Error {
    constructor() {
        super("AddressStorage address is needed");
    }
}

export class NoProposalStorageAddress extends Error {
    constructor() {
        super("ProposalStorage address is needed");
    }
}

export class NoVoteStorageAddress extends Error {
    constructor() {
        super("VoteStorage address is needed");
    }
}

export class NoReceptionControllerAddress extends Error {
    constructor() {
        super("ReceptionController address is needed");
    }
}

export class NoVoteControllerAddress extends Error {
    constructor() {
        super("VoteController address is needed");
    }
}

export class NoParticipantManagerAddress extends Error {
    constructor() {
        super("ParticipantManager address is needed");
    }
}

export class NoAssessmentControllerAddress extends Error {
    constructor() {
        super("AssessmentController address is needed");
    }
}

export class NoParticipantStorageAddress extends Error {
    constructor() {
        super("ParticipantStorage address is needed");
    }
}

export class NoExecutionManagerAddress extends Error {
    constructor() {
        super("ExecutionManager address is needed");
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(`Internal Server Error. Reason: ${message}`);
    }
}

export class EVMException extends Error {
    public code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
    }
}
