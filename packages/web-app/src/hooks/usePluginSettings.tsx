// import {MultisigVotingSettings, VotingSettings} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData, SupportedVotingSettings} from 'utils/types';
import {useClient} from './useClient';

// import {PluginTypes, usePluginClient} from './usePluginClient';

export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is VotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return 'minDuration' in settings;
}

/**
 * Retrieves plugin governance settings from SDK
 * @param pluginAddress plugin from which proposals will be retrieved
 * @returns plugin governance settings
 */
export function usePluginSettings(pluginAddress: string) {
  const [data, setData] = useState<SupportedVotingSettings>(
    {} as SupportedVotingSettings
  );
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);

  const {client} = useClient();

  useEffect(() => {
    async function getPluginSettings() {
      try {
        setIsLoading(true);

        // Token voting 플러그인만 지원하도록 수정
        const settings = await client?.tokenVoting.getSettings();
        if (settings) setData(settings as VotingSettings);
      } catch (err) {
        console.error(err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getPluginSettings();
  }, [pluginAddress]);

  return {data, error, isLoading};
}
