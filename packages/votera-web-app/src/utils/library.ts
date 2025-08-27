// Library utils / Ethers for now
import {
  Context as SdkContext,
  SupportedNetwork as SdkSupportedNetworks,
} from 'votera-sdk-client';
import {fetchEnsAvatar} from '@wagmi/core';

import {BigNumber, BigNumberish, ethers, providers} from 'ethers';
import {TFunction} from 'react-i18next';

import {isAddress} from 'ethers/lib/utils';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';

import {i18n} from '../../i18n.config';

export function formatUnits(amount: BigNumberish, decimals: number) {
  if (amount.toString().includes('.') || !decimals) {
    return amount.toString();
  }
  return ethers.utils.formatUnits(amount, decimals);
}

/**
 * Handles copying and pasting to and from the clipboard respectively
 * @param currentValue field value
 * @param onChange on value change callback
 * @param alert
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

export const toHex = (num: number | string) => {
  return '0x' + num.toString(16);
};

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
    case 'bosagora_mainnet':
      return 'bosagora_mainnet';
    case 'bosagora_testnet':
      return 'bosagora_testnet';
    case 'bosagora_devnet':
      return 'bosagora_devnet';
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
  switch (appNetwork) {
    case 'bosagora_mainnet':
      return SdkSupportedNetworks.MAINNET;
    case 'bosagora_testnet':
      return SdkSupportedNetworks.TESTNET;
    case 'bosagora_devnet':
      return SdkSupportedNetworks.DEVNET;
  }

  return 'unsupported';
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
      address.substring(0, 6) +
      '…' +
      address.substring(address.length - 4, address.length)
    );
  else return address;
}

export function shortenValidatorKey(address: string | null) {
  if (address === null) return '';
  if (address.length > 20)
    return (
      address.substring(0, 12) +
      '…' +
      address.substring(address.length - 12, address.length)
    );
  else return address;
}

export function getValidatorKeyForLink(address: string | null): string {
  if (address === null) return '';
  if (address.substring(0, 2) === '0x') return address.substring(2);
  else return address;
}
