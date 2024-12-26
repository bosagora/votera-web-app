export class NoWalletFactoryAddress extends Error {
    constructor() {
        super("A multi sig wallet factory address is needed");
    }
}

export class NoWalletAddress extends Error {
    constructor() {
        super("A multi sig wallet address is not attached");
    }
}

export class FailedCreateWallet extends Error {
    constructor() {
        super("Failed to create a multi sig wallet");
    }
}

export class FailedChangeName extends Error {
    constructor() {
        super("Failed to change the name of wallet");
    }
}

export class FailedChangeDescription extends Error {
    constructor() {
        super("Failed to change the description of wallet");
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(`Internal Server Error. Reason: ${message}`);
    }
}

export class FailedSubmitTransaction extends Error {
    constructor() {
        super("Failed to submit transaction");
    }
}

export class FailedConfirmTransaction extends Error {
    constructor() {
        super("Failed to confirm transaction");
    }
}

export class FailedRevokeTransaction extends Error {
    constructor() {
        super("Failed to revoke transaction");
    }
}

export class NotFoundInterface extends Error {
    constructor() {
        super("A multi sig wallet address is not attached");
    }
}
