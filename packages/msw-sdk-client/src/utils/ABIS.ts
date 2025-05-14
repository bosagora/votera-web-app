import { Interface, JsonFragment } from "@ethersproject/abi";
import { NotFoundInterface } from "./Errors";
import { Result } from "@ethersproject/abi/src.ts/coders/abstract-coder";
import { FunctionFragment } from "@ethersproject/abi/src.ts/fragments";

export class ABIStorage {
    public static storage = new Map<string, ReadonlyArray<JsonFragment>>([
        [
            "MultiSigWallet",
            [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_factory",
                            "type": "address"
                        },
                        {
                            "internalType": "string",
                            "name": "_name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_description",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "_creator",
                            "type": "address"
                        },
                        {
                            "internalType": "address[]",
                            "name": "_members",
                            "type": "address[]"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_required",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "Confirmation",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Deposit",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "Execution",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "ExecutionFailure",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "OwnerAddition",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        }
                    ],
                    "name": "OwnerRemoval",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "required",
                            "type": "uint256"
                        }
                    ],
                    "name": "RequirementChange",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "Revocation",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "uint256",
                            "name": "transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "Submission",
                    "type": "event"
                },
                {
                    "inputs": [],
                    "name": "MAX_OWNER_COUNT",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        }
                    ],
                    "name": "addMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address[]",
                            "name": "additionalMembers",
                            "type": "address[]"
                        },
                        {
                            "internalType": "address[]",
                            "name": "removalMembers",
                            "type": "address[]"
                        }
                    ],
                    "name": "changeMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "_name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_description",
                            "type": "string"
                        }
                    ],
                    "name": "changeMetadata",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_required",
                            "type": "uint256"
                        }
                    ],
                    "name": "changeRequirement",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "confirmTransaction",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "createdTime",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "creator",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "description",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "executeTransaction",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getConfirmationCount",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getConfirmations",
                    "outputs": [
                        {
                            "internalType": "address[]",
                            "name": "",
                            "type": "address[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getMembers",
                    "outputs": [
                        {
                            "internalType": "address[]",
                            "name": "",
                            "type": "address[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getRequired",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "getTransaction",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "id",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "string",
                                    "name": "title",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "description",
                                    "type": "string"
                                },
                                {
                                    "internalType": "address",
                                    "name": "creator",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "createdTime",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "destination",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "value",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "data",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bool",
                                    "name": "executed",
                                    "type": "bool"
                                },
                                {
                                    "internalType": "address[]",
                                    "name": "approval",
                                    "type": "address[]"
                                }
                            ],
                            "internalType": "struct IMultiSigWallet.Transaction",
                            "name": "",
                            "type": "tuple"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getTransactionCount",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_from",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_to",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "_pending",
                            "type": "bool"
                        },
                        {
                            "internalType": "bool",
                            "name": "_executed",
                            "type": "bool"
                        }
                    ],
                    "name": "getTransactionCountInCondition",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_from",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_to",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bool",
                            "name": "_pending",
                            "type": "bool"
                        },
                        {
                            "internalType": "bool",
                            "name": "_executed",
                            "type": "bool"
                        }
                    ],
                    "name": "getTransactionIdsInCondition",
                    "outputs": [
                        {
                            "internalType": "uint256[]",
                            "name": "",
                            "type": "uint256[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_from",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_to",
                            "type": "uint256"
                        }
                    ],
                    "name": "getTransactionsInRange",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "uint256",
                                    "name": "id",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "string",
                                    "name": "title",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "description",
                                    "type": "string"
                                },
                                {
                                    "internalType": "address",
                                    "name": "creator",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "createdTime",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "address",
                                    "name": "destination",
                                    "type": "address"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "value",
                                    "type": "uint256"
                                },
                                {
                                    "internalType": "bytes",
                                    "name": "data",
                                    "type": "bytes"
                                },
                                {
                                    "internalType": "bool",
                                    "name": "executed",
                                    "type": "bool"
                                },
                                {
                                    "internalType": "address[]",
                                    "name": "approval",
                                    "type": "address[]"
                                }
                            ],
                            "internalType": "struct IMultiSigWallet.Transaction[]",
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "isConfirmed",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_address",
                            "type": "address"
                        }
                    ],
                    "name": "isOwner",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "name",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        }
                    ],
                    "name": "removeMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_newOwner",
                            "type": "address"
                        }
                    ],
                    "name": "replaceMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_transactionId",
                            "type": "uint256"
                        }
                    ],
                    "name": "revokeConfirmation",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "_title",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_description",
                            "type": "string"
                        },
                        {
                            "internalType": "address",
                            "name": "_destination",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_value",
                            "type": "uint256"
                        },
                        {
                            "internalType": "bytes",
                            "name": "_data",
                            "type": "bytes"
                        }
                    ],
                    "name": "submitTransaction",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes4",
                            "name": "interfaceId",
                            "type": "bytes4"
                        }
                    ],
                    "name": "supportsInterface",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "stateMutability": "payable",
                    "type": "receive"
                }
            ],
        ],
        [
            "MultiSigToken",
            [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_owner",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Approval",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "indexed": true,
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "uint256",
                            "name": "value",
                            "type": "uint256"
                        }
                    ],
                    "name": "Transfer",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "owner",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        }
                    ],
                    "name": "allowance",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "approve",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "account",
                            "type": "address"
                        }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "decimals",
                    "outputs": [
                        {
                            "internalType": "uint8",
                            "name": "",
                            "type": "uint8"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "subtractedValue",
                            "type": "uint256"
                        }
                    ],
                    "name": "decreaseAllowance",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "spender",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "addedValue",
                            "type": "uint256"
                        }
                    ],
                    "name": "increaseAllowance",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "uint256",
                            "name": "_amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "mint",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "name",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [
                        {
                            "internalType": "string",
                            "name": "",
                            "type": "string"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "transfer",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "from",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "amount",
                            "type": "uint256"
                        }
                    ],
                    "name": "transferFrom",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ],
        ],
        [
            "MultiSigWalletFactory",
            [
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "address",
                            "name": "sender",
                            "type": "address"
                        },
                        {
                            "indexed": false,
                            "internalType": "address",
                            "name": "wallet",
                            "type": "address"
                        }
                    ],
                    "name": "ContractInstantiation",
                    "type": "event"
                },
                {
                    "anonymous": false,
                    "inputs": [
                        {
                            "indexed": false,
                            "internalType": "address",
                            "name": "wallet",
                            "type": "address"
                        }
                    ],
                    "name": "Registered",
                    "type": "event"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_wallet",
                            "type": "address"
                        }
                    ],
                    "name": "addMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "string",
                            "name": "_name",
                            "type": "string"
                        },
                        {
                            "internalType": "string",
                            "name": "_description",
                            "type": "string"
                        },
                        {
                            "internalType": "address[]",
                            "name": "_members",
                            "type": "address[]"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_required",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_seed",
                            "type": "uint256"
                        }
                    ],
                    "name": "create",
                    "outputs": [
                        {
                            "internalType": "address",
                            "name": "",
                            "type": "address"
                        }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_creator",
                            "type": "address"
                        }
                    ],
                    "name": "getNumberOfWalletsForCreator",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        }
                    ],
                    "name": "getNumberOfWalletsForMember",
                    "outputs": [
                        {
                            "internalType": "uint256",
                            "name": "",
                            "type": "uint256"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_wallet",
                            "type": "address"
                        }
                    ],
                    "name": "getWalletInfo",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "address",
                                    "name": "creator",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "wallet",
                                    "type": "address"
                                },
                                {
                                    "internalType": "string",
                                    "name": "name",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "description",
                                    "type": "string"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "createdTime",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct IMultiSigWalletFactory.WalletInfo",
                            "name": "",
                            "type": "tuple"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_creator",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_from",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_to",
                            "type": "uint256"
                        }
                    ],
                    "name": "getWalletsForCreator",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "address",
                                    "name": "creator",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "wallet",
                                    "type": "address"
                                },
                                {
                                    "internalType": "string",
                                    "name": "name",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "description",
                                    "type": "string"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "createdTime",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct IMultiSigWalletFactory.WalletInfo[]",
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_from",
                            "type": "uint256"
                        },
                        {
                            "internalType": "uint256",
                            "name": "_to",
                            "type": "uint256"
                        }
                    ],
                    "name": "getWalletsForMember",
                    "outputs": [
                        {
                            "components": [
                                {
                                    "internalType": "address",
                                    "name": "creator",
                                    "type": "address"
                                },
                                {
                                    "internalType": "address",
                                    "name": "wallet",
                                    "type": "address"
                                },
                                {
                                    "internalType": "string",
                                    "name": "name",
                                    "type": "string"
                                },
                                {
                                    "internalType": "string",
                                    "name": "description",
                                    "type": "string"
                                },
                                {
                                    "internalType": "uint256",
                                    "name": "createdTime",
                                    "type": "uint256"
                                }
                            ],
                            "internalType": "struct IMultiSigWalletFactory.WalletInfo[]",
                            "name": "",
                            "type": "tuple[]"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "_member",
                            "type": "address"
                        },
                        {
                            "internalType": "address",
                            "name": "_wallet",
                            "type": "address"
                        }
                    ],
                    "name": "removeMember",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
                {
                    "inputs": [
                        {
                            "internalType": "bytes4",
                            "name": "interfaceId",
                            "type": "bytes4"
                        }
                    ],
                    "name": "supportsInterface",
                    "outputs": [
                        {
                            "internalType": "bool",
                            "name": "",
                            "type": "bool"
                        }
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ],
        ]
    ]);

    public static get(interfaceName: string): Interface | undefined {
        const fragment = ABIStorage.storage.get(interfaceName);
        if (fragment !== undefined) return new Interface(fragment);
        else return undefined;
    }

    public static set(interfaceName: string, fragment: ReadonlyArray<JsonFragment>) {
        ABIStorage.storage.set(interfaceName, fragment);
    }

    public static encodeFunctionData(
        interfaceName: string,
        functionFragment: string,
        values?: ReadonlyArray<any>
    ): string {
        const iface = ABIStorage.get(interfaceName);
        if (iface === undefined) throw new NotFoundInterface();
        return iface.encodeFunctionData(functionFragment, values);
    }

    public static decodeFunctionData(data: string): ISmartContractFunctionData | undefined {
        let res: Result | undefined;
        let interfaceName: string | undefined;
        let fragment: FunctionFragment | undefined;

        for (const name of ABIStorage.storage.keys()) {
            const iface = ABIStorage.get(name);
            if (iface === undefined) continue;
            try {
                fragment = iface.getFunction(data.substring(0, 10).toLowerCase());
            } catch (e) {
                //
            }
            if (fragment) {
                res = iface.decodeFunctionData(fragment, data);
                interfaceName = name;
                break;
            }
        }

        if (fragment === undefined || interfaceName === undefined || res === undefined) return undefined;

        return {
            interfaceName,
            fragment,
            parameter: res
        };
    }

    public static displayFunctionData(data: ISmartContractFunctionData): string {
        const contents: string[] = [];
        contents.push(`Interface: ${data.interfaceName}`);
        contents.push(`Function: ${data.fragment.name}`);
        contents.push(`Parameter:`);
        for (let idx = 0; idx < data.fragment.inputs.length; idx++) {
            contents.push(`\t${idx}:`);
            contents.push(`\t\t${data.fragment.inputs[idx].name}: ${String(data.parameter[idx])}`);
        }

        return contents.join("\n");
    }
}

export interface ISmartContractFunctionData {
    interfaceName: string;
    fragment: FunctionFragment;
    parameter: Result;
}
