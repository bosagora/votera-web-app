import {TokenVotingClient} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';

import {useClient} from './useClient';

export type PluginTypes = 'token-voting.plugin.dao.eth';

type PluginType<T> = T extends 'token-voting.plugin.dao.eth' ? TokenVotingClient : never;

export function isTokenVotingClient(
  client: TokenVotingClient | undefined
): client is TokenVotingClient {
  if (!client || Object.keys(client).length === 0) return false;
  return client instanceof TokenVotingClient;
}

/**
 * This hook can be used to build ERC20 clients
 * @param pluginType Type of plugin for which a client is to be built. Note that
 * this is information that must be fetched. I.e., it might be unavailable on
 * first render. Therefore, it is typed as potentially undefined.
 * @returns The corresponding Client
 */
export const usePluginClient = <T extends PluginTypes = PluginTypes>(
  pluginType?: T
): PluginType<T> | undefined => {
  const [pluginClient, setPluginClient] = useState<PluginType<PluginTypes>>();
  const {client, context} = useClient();

  useEffect(() => {
    if (!client || !context) return;
    if (!pluginType) {
      setPluginClient(undefined);
    } else {
      switch (pluginType as PluginTypes) {
        case 'token-voting.plugin.dao.eth':
          setPluginClient(new TokenVotingClient(context));
          break;
        default:
          throw new Error('The requested plugin type is invalid');
      }
    }
  }, [client, context, pluginType]);

  return pluginClient as PluginType<T>;
};
