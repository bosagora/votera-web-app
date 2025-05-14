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

export class UnexpectedActionError extends Error {
  constructor() {
    super("The received action is different from the expected one");
  }
}

export class NoTokenAddress extends Error {
  constructor() {
    super("A token address is needed");
  }
}

export class ProposalCreationError extends Error {
  constructor() {
    super("Failed to create proposal");
  }
}

export class MissingExecPermissionError extends Error {
  constructor() {
    super("No plugin requests EXECUTE_PERMISSION");
  }
}

export class UpdateAllowanceError extends Error {
  constructor() {
    super("Could not define a minimum allowance");
  }
}

export class InvalidPrecisionError extends Error {
  constructor() {
    super("Invalid precision, number must be an integer greater than 0");
  }
}

export class FailedDepositError extends Error {
  constructor() {
    super("Failed to deposit");
  }
}

export class AmountMismatchError extends Error {
  constructor(expected: bigint, received: bigint) {
    super(
      `Deposited amount mismatch. Expected: ${expected}, received: ${received}`
    );
  }
}

export class UnsupportedNetworkError extends Error {
  constructor(network: string) {
    super("Unsupported network: " + network);
  }
}

export class ClientNotInitializedError extends Error {
  constructor(client: string) {
    super(client + " client is not initialized");
  }
}

export class NoNodesAvailableError extends Error {
  constructor(name: string) {
    super("No " + name + " nodes available");
  }
}

export class DataDecodingError extends Error {
  constructor(message: string) {
    super("Cannot decode data: " + message);
  }
}
