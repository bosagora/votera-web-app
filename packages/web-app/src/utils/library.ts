// Library utils / Ethers for now
import {
  Context as SdkContext,
  SupportedNetwork as SdkSupportedNetworks,
} from 'multisig-wallet-sdk-client';
import {fetchEnsAvatar} from '@wagmi/core';

import {BigNumber, BigNumberish, constants, ethers, providers} from 'ethers';
import {TFunction} from 'react-i18next';

import {isAddress} from 'ethers/lib/utils';
import {
  BIGINT_PATTERN,
  CHAIN_METADATA,
  ISO_DATE_PATTERN,
  SupportedNetworks,
} from 'utils/constants';

import {i18n} from '../../i18n.config';
import {getTokenInfo} from './tokens';
import {fetchTokenData} from '../services/prices';
import {ActionWithdraw} from './types';

export function formatUnits(amount: BigNumberish, decimals: number) {
  if (amount.toString().includes('.') || !decimals) {
    return amount.toString();
  }
  return ethers.utils.formatUnits(amount, decimals);
}

// (Temporary) Should be moved to ui-component perhaps
/**
 * Handles copying and pasting to and from the clipboard respectively
 * @param currentValue field value
 * @param onChange on value change callback
 */
export async function handleClipboardActions(
  currentValue: string,
  onChange: (value: string) => void,
  alert: (label: string) => void
) {
  if (currentValue) {
    await navigator.clipboard.writeText(currentValue);
    alert(i18n.t('alert.chip.inputCopied'));
  } else {
    const textFromClipboard = await navigator.clipboard.readText();
    onChange(textFromClipboard);
    alert(i18n.t('alert.chip.inputPasted'));
  }
}

/**
 * Check if the given value is an empty string
 * @param value parameter
 * @returns whether the parameter is an empty string
 */
export const isOnlyWhitespace = (value: string) => {
  return value.trim() === '';
};

/**
 * Return user friendly wallet address label if available
 * @param value address
 * @param t translation function
 * @returns user friendly label or wallet address
 */
export const getUserFriendlyWalletLabel = (
  value: string,
  t: TFunction<'translation', undefined>
) => {
  switch (value) {
    case '':
      return '';
    case constants.AddressZero:
      return t('labels.daoTreasury');

    default:
      return value;
  }
};

export const toHex = (num: number | string) => {
  return '0x' + num.toString(16);
};

/**
 * DecodeWithdrawToAction
 * @param data Uint8Array action data
 * @param client SDK client, Fetched using useClient
 * @param apolloClient Apollo client, Fetched using useApolloClient
 * @param provider Eth provider
 * @param network network of the dao
 * @returns Return Decoded Withdraw action
 */

export async function decodeWithdrawToAction(
  data: Uint8Array | undefined,
  client: Client | undefined,
  // apolloClient: ApolloClient<object>,
  provider: providers.Provider,
  network: SupportedNetworks,
  to: string,
  value: bigint
): Promise<ActionWithdraw | undefined> {
  if (!client || !data) {
    console.error('SDK client is not initialized correctly');
    return;
  }

  const decoded = client.decoding.withdrawAction(to, value, data);

  if (!decoded) {
    console.error('Unable to decode withdraw action');
    return;
  }

  const tokenAddress =
    decoded.type === 'native' ? constants.AddressZero : decoded?.tokenAddress;

  try {
    const recipient = await Web3Address.create(
      provider,
      decoded.recipientAddressOrEns
    );

    const [tokenInfo] = await Promise.all([
      getTokenInfo(
        tokenAddress,
        provider,
        CHAIN_METADATA[network].nativeCurrency
      ),
    ]);

    const apiResponse = await fetchTokenData(
      tokenAddress,
      apolloClient,
      network,
      tokenInfo.symbol
    );

    return {
      amount: Number(formatUnits(decoded.amount, tokenInfo.decimals)),
      name: 'withdraw_assets',
      to: recipient,
      tokenBalance: 0, // unnecessary?
      tokenAddress: tokenAddress,
      tokenImgUrl: apiResponse?.imgUrl || '',
      tokenName: tokenInfo.name,
      tokenPrice: apiResponse?.price || 0,
      tokenSymbol: tokenInfo.symbol,
      tokenDecimals: tokenInfo.decimals,
      isCustomToken: false,
    };
  } catch (error) {
    console.error('Error decoding withdraw action', error);
  }
}


const FLAG_TYPED_ARRAY = 'FLAG_TYPED_ARRAY';
/**
 *  Custom serializer that includes fix for BigInt type
 * @param _ key; unused
 * @param value value to serialize
 * @returns serialized value
 */
export const customJSONReplacer = (_: string, value: unknown) => {
  // uint8array (encoded actions)
  if (value instanceof Uint8Array) {
    return {
      data: [...value],
      flag: FLAG_TYPED_ARRAY,
    };
  }

  // bigint
  if (typeof value === 'bigint') return `${value.toString()}n`;

  return value;
};

/**
 * Custom function to deserialize values, including Date and BigInt types
 * @param _ key: unused
 * @param value value to deserialize
 * @returns deserialized value
 */
// disabling so forced assertion is not necessary in try catch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const customJSONReviver = (_: string, value: any) => {
  // deserialize uint8array
  if (value.flag === FLAG_TYPED_ARRAY) {
    return new Uint8Array(value.data);
  }

  if (typeof value === 'string') {
    // BigInt
    if (BIGINT_PATTERN.test(value)) return BigInt(value.slice(0, -1));

    // Date
    if (ISO_DATE_PATTERN.test(value)) return new Date(value);
  }

  return value;
};

type DecodedVotingMode = {
  earlyExecution: boolean;
  voteReplacement: boolean;
};
/**
 * Get DAO resolved IPFS CID URL for the DAO avatar
 * @param avatar - avatar to be resolved. If it's an IPFS CID,
 * the function will return a fully resolved URL.
 * @returns the url to the DAO avatar
 */
export function resolveDaoAvatarIpfsCid(
  network: SupportedNetworks,
  avatar?: string
): string | undefined {
  return undefined;
}

export function readFile(file: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      resolve(fr.result as ArrayBuffer);
    };
    fr.onerror = reject;
    fr.readAsArrayBuffer(file);
  });
}

/**
 * Sleep for given time before continuing
 * @param time time in milliseconds
 */
export function sleepFor(time = 600) {
  return new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Maps SDK network name to app network context network name
 * @param sdkNetwork supported network returned by the SDK
 * @returns translated equivalent app supported network
 */
export const translateToAppNetwork = (
  sdkNetwork: SdkContext['network']
): SupportedNetworks => {
  switch (sdkNetwork.name) {
    case 'homestead':
      return 'ethereum';
    case 'goerli':
      return 'goerli';
    case 'sepolia':
      return 'sepolia';
    case 'bosagora_mainnet':
      return 'bosagora_mainnet';
    case 'bosagora_testnet':
      return 'bosagora_testnet';
    case 'bosagora_devnet':
      return 'bosagora_devnet';
    case 'acc_sidechain_mainnet':
      return 'acc_sidechain_mainnet';
    case 'acc_sidechain_testnet':
      return 'acc_sidechain_testnet';
    case 'acc_sidechain_devnet':
      return 'acc_sidechain_devnet';
  }
  return 'unsupported';
};

/**
 * Maps app network context name to SDK network name
 * @param appNetwork supported network returned by the network context
 * @returns translated equivalent SDK supported network
 */
export function translateToNetworkishName(
  appNetwork: SupportedNetworks
): SdkSupportedNetworks | 'unsupported' {
  if (typeof appNetwork !== 'string') {
    return 'unsupported';
  }

  switch (appNetwork) {
    case 'ethereum':
      return SdkSupportedNetworks.ETHEREUM_MAINNET;
    case 'goerli':
      return SdkSupportedNetworks.ETHEREUM_GOERLI;
    case 'sepolia':
      return SdkSupportedNetworks.ETHEREUM_SEPOLIA;
    case 'bosagora_mainnet':
      return SdkSupportedNetworks.BOSAGORA_MAINNET;
    case 'bosagora_testnet':
      return SdkSupportedNetworks.BOSAGORA_TESTNET;
    case 'bosagora_devnet':
      return SdkSupportedNetworks.BOSAGORA_DEVNET;
    case 'acc_sidechain_mainnet':
      return SdkSupportedNetworks.ACC_SIDECHAIN_MAINNET;
    case 'acc_sidechain_testnet':
      return SdkSupportedNetworks.ACC_SIDECHAIN_TESTNET;
    case 'acc_sidechain_devnet':
      return SdkSupportedNetworks.ACC_SIDECHAIN_DEVNET;
  }

  return 'unsupported';
}

/**
 * display ens names properly
 * @param ensName ens name
 * @returns ens name or empty string if ens name is null.dao.eth
 */
export function toDisplayEns(ensName?: string) {
  if (!ensName || ensName === 'null.dao.eth') return '';

  if (!ensName.includes('.dao.eth')) return `${ensName}.dao.eth`;
  return ensName;
}

export function getDefaultPayableAmountInputName(t: TFunction) {
  return t('scc.inputPayableAmount.label');
}

export function getWCPayableAmount(
  t: TFunction,
  value: string,
  network: SupportedNetworks
) {
  return {
    name: 'Raw Amount', // FIXME: crowdin key
    type: 'string',
    notice: 'The number of the tokens to transfer', // FIXME: crowdin key,
    value: `${formatUnits(
      BigNumber.from(value),
      CHAIN_METADATA[network].nativeCurrency.decimals
    )} ${CHAIN_METADATA[network].nativeCurrency.symbol}`,
  };
}

export function getEncodedActionInputs(
  action: any,
  network: SupportedNetworks,
  t: TFunction
) {
  return Object.keys(action).flatMap(fieldName => {
    switch (fieldName) {
      case 'value':
        return getWCPayableAmount(t, action.value.toString(), network);
      case 'to':
        return {
          name: 'Dst', // FIXME: crowdin key,
          type: 'address',
          notice: 'The address of the destination account', // FIXME: crowdin key,
          value: action[fieldName],
        };
      case 'data':
        return {
          name: 'Data', // t('Data'),
          type: 'encodedData',
          notice: 'Encoded EVM call to the smart contract', // FIXME: crowdin key,
          value: action[fieldName],
        };
      default:
        return [];
    }
  });
}

export class Web3Address {
  // Declare private fields to hold the address, ENS name and the Ethereum provider
  private _address: string | null;
  private _ensName: string | null;
  private _provider?: providers.Provider;
  private _avatar?: string | null;

  // Constructor for the Address class
  constructor(
    provider?: ethers.providers.Provider,
    address?: string,
    ensName?: string
  ) {
    // Initialize the provider, address and ENS name
    this._provider = provider;
    this._address = address || null;
    this._ensName = ensName || null;
  }

  // Static method to create an Address instance
  static async create(
    provider?: providers.Provider,
    addressOrEns?: {address?: string; ensName?: string} | string
  ) {
    // Determine whether we are dealing with an address, an ENS name or an object containing both
    let addressToSet: string | undefined;
    let ensNameToSet: string | undefined;
    if (typeof addressOrEns === 'string') {
      // If input is a string, treat it as address if it matches address structure, else treat as ENS name
      if (ethers.utils.isAddress(addressOrEns)) {
        addressToSet = addressOrEns;
      } else {
        ensNameToSet = addressOrEns;
      }
    } else {
      addressToSet = addressOrEns?.address;
      ensNameToSet = addressOrEns?.ensName;
    }

    // If no provider is given and no address is provided, throw an error
    if (!provider && !addressToSet) {
      throw new Error('If no provider is given, address must be provided');
    }

    // Create a new Address instance
    const addressObj = new Web3Address(provider, addressToSet, ensNameToSet);

    // If a provider is available, try to resolve the missing piece (address or ENS name)
    try {
      if (provider) {
        if (addressToSet && !ensNameToSet) {
          ensNameToSet =
            (await provider.lookupAddress(addressToSet)) ?? undefined;
          if (ensNameToSet) {
            addressObj._ensName = ensNameToSet;
          }
        } else if (!addressToSet && ensNameToSet) {
          addressToSet =
            (await provider.resolveName(ensNameToSet)) ?? undefined;
          if (addressToSet) {
            addressObj._address = addressToSet;
          }
        }

        if (addressObj._ensName) {
          // fetch avatar
          const chainId = (await provider.getNetwork()).chainId;
          addressObj._avatar = await fetchEnsAvatar({
            name: addressObj._ensName,
            chainId,
          });
        }
      }

      // Return the Address instance
      return addressObj;
    } catch (error) {
      throw new Error(
        `Failed to create Web3Address: ${(error as Error).message}`
      );
    }
  }

  // Method to check if the stored address is valid
  isAddressValid(): boolean {
    if (!this._address) {
      return false;
    }
    return ethers.utils.isAddress(this._address);
  }

  // Method to check if the stored ENS name is valid (resolves to an address)
  async isValidEnsName(): Promise<boolean> {
    if (!this._provider || !this._ensName) {
      return false;
    }
    const address = await this._provider.resolveName(this._ensName);
    return !!address;
  }

  // Getter for the address
  get address() {
    return this._address;
  }

  // Getter for the ENS name
  get ensName() {
    return this._ensName;
  }

  // Getter for the avatar
  get avatar() {
    return this._avatar;
  }

  display(
    options: {
      shorten: boolean;
      prioritize: 'ensName' | 'address';
    } = {
      shorten: false,
      prioritize: 'ensName',
    }
  ) {
    return options.prioritize === 'ensName'
      ? String(
          this._ensName || options.shorten
            ? shortenAddress(this._address)
            : this._address
        )
      : String(this._address || this._ensName);
  }

  toString() {
    return {address: this._address, ensName: this.ensName};
  }

  isEqual(valueToCompare: Web3Address | {address: string; ensName: string}) {
    return (
      valueToCompare.address === this._address &&
      valueToCompare.ensName === this._ensName
    );
  }
}

export function shortenAddress(address: string | null) {
  if (address === null) return '';
  if (isAddress(address))
    return (
      address.substring(0, 5) +
      '…' +
      address.substring(address.length - 4, address.length)
    );
  else return address;
}

export function capitalizeFirstLetter(str: string) {
  if (typeof str !== 'string' || str.length === 0) {
    return str; // Return the input if it's not a string or an empty string
  }

  return str.charAt(0).toUpperCase() + str.slice(1);
}
