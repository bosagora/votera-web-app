/* eslint-disable no-empty */
import {erc20TokenABI} from 'abis/erc20TokenABI';
import {constants, ethers, providers as EthersProviders} from 'ethers';

import {formatUnits} from 'utils/library';
import {NativeTokenData, TOKEN_AMOUNT_REGEX} from './constants';

/**
 * This Function is necessary because
 * you can't fetch decimals from the api
 *
 * @param address token contract address
 * @param provider Eth provider
 * @param nativeTokenData Information about the current native token
 * @returns number for decimals for each token
 */
export async function getTokenInfo(
  address: string,
  provider: EthersProviders.Provider,
  nativeTokenData: NativeTokenData
) {
  let decimals = null,
    symbol = null,
    name = null,
    totalSupply = null;

  if (isNativeToken(address)) {
    return {
      name: nativeTokenData.name,
      symbol: nativeTokenData.symbol,
      decimals: nativeTokenData.decimals,
      totalSupply,
    };
  }
  const contract = new ethers.Contract(address, erc20TokenABI, provider);

  try {
    const values = await Promise.all([
      contract.decimals(),
      contract.name(),
      contract.symbol(),
      contract.totalSupply(),
    ]);

    decimals = values[0];
    name = values[1];
    symbol = values[2];
    totalSupply = values[3];
  } catch (error) {
    console.error('Error, getting token info from contract');
  }

  return {
    decimals,
    name,
    symbol,
    totalSupply,
  };
}

/**
 * @param tokenAddress address of token contract
 * @param ownerAddress owner address / wallet address
 * @param provider interface to node
 * @param shouldFormat whether value is returned in human readable format
 * @returns a promise that will return a balance amount
 */
export const fetchBalance = async (
  tokenAddress: string,
  ownerAddress: string,
  provider: EthersProviders.Provider,
  nativeCurrency: NativeTokenData,
  shouldFormat = true
) => {
  const contract = new ethers.Contract(tokenAddress, erc20TokenABI, provider);
  const balance = await contract.balanceOf(ownerAddress);

  if (shouldFormat) {
    const {decimals} = await getTokenInfo(
      tokenAddress,
      provider,
      nativeCurrency
    );
    return formatUnits(balance, decimals);
  }
  return balance;
};

/**
 * Check if token is the chain native token; the distinction is made
 * especially in terms of whether the contract address
 * is that of an ERC20 token
 * @param tokenAddress address of token contract
 * @returns whether token is Ether
 */
export const isNativeToken = (tokenAddress: string) => {
  return tokenAddress === constants.AddressZero;
};

/**
 * Helper-method formats a string of token amount.
 *
 * The method expects the string representation of an integer or decimal number.
 * The string must contain only digits, except for the decimal dot and an option
 * token symbol separated from the number by a whitespace. E.g.
 *
 * - '111' ok
 * - '111.1' ok
 * - '111.1 SYM' ok
 * - '1'111'111.1 SYM' not ok.
 *
 * The output, in general, is engineering notation (scientific notation wher the
 * exponent is divisible by 3 and the coefficient is between in [1,999]). For
 * numbers up to a trillon, the power is replaced by the letters k (10^3), M
 * (10^6) and G (10^9).
 *
 * Decimals are ignored for any number >= 10 k. Below that, rounding to 2
 * decimals is applied if necessary.
 *
 * @param amount [string] token amount. May include token symbol.
 * @returns [string] abbreviated token amount. Any decimal digits get discarded. For
 * thousands, millions and billions letters are used. E.g. 10'123'456.78 SYM becomes 10M.
 * Everything greater gets expressed as power of tens.
 */
export function abbreviateTokenAmount(amount: string): string {
  if (!amount) return 'N/A';

  const regexp_res = amount.match(TOKEN_AMOUNT_REGEX);
  // discard failed matches
  if (regexp_res?.length !== 4 || regexp_res[0].length !== amount.length)
    return 'N/A';

  // retrieve capturing groups
  const integers = regexp_res[1];
  const decimals = regexp_res[2];
  const symbol = regexp_res[3];

  if (integers?.length > 4) {
    const integerNumber = Number.parseInt(integers);
    const magnitude = Math.floor((integers.length - 1) / 3);
    const lead = Math.floor(integerNumber / Math.pow(10, magnitude * 3));
    const magnitude_letter = ['k', 'M', 'G'];

    return `${lead}${
      magnitude < 4
        ? magnitude_letter[magnitude - 1]
        : '*10^' + Math.floor(magnitude) * 3
    }${symbol && ' ' + symbol}`;
  }

  if (decimals) {
    const fraction = '0.' + decimals;
    const fractionNumber = Number.parseFloat(fraction);
    const intNumber = Number.parseInt(integers);
    const totalNumber = intNumber + fractionNumber;

    if (totalNumber < 0.01) {
      return ` < 0.01${symbol && ' ' + symbol}`;
    }

    return `${totalNumber.toFixed(2)}${symbol && ' ' + symbol}`;
  }

  return `${Number.parseInt(integers)}${symbol && ' ' + symbol}`;
}

export function gTokenSymbol(tokenSymbol: string): string {
  return `g${tokenSymbol}`;
}
