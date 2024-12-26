// import {MultisigVotingSettings, VotingSettings} from '@aragon/sdk-client';
import {useEffect, useState} from 'react';
import {HookData, SupportedVotingSettings} from 'utils/types';
import {
  MultisigVotingSettings,
  PluginTypes,
  VotingSettings,
} from '../utils/aragon/types';
import {useClient} from './useClient';

// import {PluginTypes, usePluginClient} from './usePluginClient';

export function isTokenVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is VotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return 'minDuration' in settings;
}

export function isMultisigVotingSettings(
  settings: SupportedVotingSettings | undefined
): settings is MultisigVotingSettings {
  if (!settings || Object.keys(settings).length === 0) return false;
  return !('minDuration' in settings);
}

/**
 * Retrieves plugin governance settings from SDK
 * @param pluginAddress plugin from which proposals will be retrieved
 * @param type plugin type
 * @returns plugin governance settings
 */
export function usePluginSettings(
  pluginAddress: string,
  type: PluginTypes
): HookData<SupportedVotingSettings> {
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

        const minApprovals = await client?.multiSigWallet.getRequired();
        //console.log('minApprovals :', minApprovals);
        const settings = {
          minDuration: 0,
          minParticipation: 0,
          supportThreshold: 0,
          votingMode: 'Standard',
          minApprovals: minApprovals,
          onlyListed: true,
        };
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
