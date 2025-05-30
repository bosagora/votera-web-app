/* eslint-disable no-empty */
import {constants} from 'ethers';

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

export function gTokenSymbol(tokenSymbol: string): string {
  return `g${tokenSymbol}`;
}
