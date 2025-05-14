export class TimeoutError extends Error {
    constructor(message?: string) {
        super(message ? message : "Time out");
    }
}

export class UnsupportedProtocolError extends Error {
    constructor(protocol: string) {
        super("Unsupported protocol: " + protocol);
    }
}

export class GraphQLError extends Error {
    constructor(model: string) {
        super("Cannot fetch the " + model + " data from GraphQL");
    }
}

export class InvalidAddressOrEnsError extends Error {
    constructor() {
        super("Invalid address or ENS");
    }
}

export class InvalidAddressError extends Error {
    constructor() {
        super("Invalid address");
    }
}

export class InvalidCidError extends Error {
    constructor() {
        super("The value does not contain a valid CiD");
    }
}

export class NoProviderError extends Error {
    constructor() {
        super("A web3 provider is needed");
    }
}

export class NoSignerError extends Error {
    constructor() {
        super("A signer is needed");
    }
}

export class ProposalCreationError extends Error {
    constructor() {
        super("Failed to create proposal");
    }
}

export class PostBallotError extends Error {
    constructor() {
        super("Failed to post ballot");
    }
}

export class PostCommentError extends Error {
    constructor() {
        super("Failed to post comment");
    }
}
export class ExecutionError extends Error {
    constructor() {
        super("Failed to execute the proposal");
    }
}

export class UnsupportedNetworkError extends Error {
    constructor(network: string) {
        super("Unsupported network: " + network);
    }
}
