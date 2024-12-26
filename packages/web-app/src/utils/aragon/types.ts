export * from './sdk-client-types';
export * from './sdk-client-common-types';
export * from './sdk-client-multisig-types';
export const GaslessPluginName =
  'vocdoni-gasless-voting-poc-vanilla-erc20.plugin.dao.eth';
export type GaslessPluginType = typeof GaslessPluginName;

export type PluginTypes =
  | 'token-voting.plugin.dao.eth'
  | 'multisig.plugin.dao.eth'
  | GaslessPluginType;
