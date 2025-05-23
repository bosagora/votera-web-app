import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';

import {AccordionMethod} from 'components/accordionMethod';
import {ActionCardDlContainer, Dd, Dl, Dt} from 'components/descriptionList';
import {getDHMFromSeconds} from 'utils/date';

interface Token {
  symbol?: string;
  decimals?: number;
}

interface ActionUpdatePluginSettings {
  inputs: {
    minDuration: number;
    minParticipation: number;
    totalVotingWeight: number;
    token?: Token;
    minProposerVotingPower?: number;
    supportThreshold: number;
    votingMode: string;
  };
}

export const ModifyMvSettingsCard: React.FC<{
  action: ActionUpdatePluginSettings;
}> = ({action: {inputs}}) => {
  const {t} = useTranslation();
  const {days, hours, minutes} = getDHMFromSeconds(inputs.minDuration);

  const minParticipation = useMemo(
    () => `≥ ${Math.round(inputs.minParticipation * 100)}% (≥
            ${(inputs.totalVotingWeight * inputs.minParticipation).toFixed(2)} 
            ${inputs.token?.symbol})`,
    [
      inputs.minParticipation,
      inputs.token?.decimals,
      inputs.token?.symbol,
      inputs.totalVotingWeight,
    ]
  );

  const minProposalThreshold = inputs.minProposerVotingPower
    ? t('labels.review.tokenHoldersWithTkns', {
        tokenAmount: inputs.minProposerVotingPower,
        tokenSymbol: inputs.token?.symbol,
      })
    : t('createDAO.step3.eligibility.anyWallet.title');

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.updateGovernanceAction')}
      smartContractName={t('labels.aragonOSx')}
      methodDescription={t('labels.updateGovernanceActionDescription')}
      verified
    >
      <ActionCardDlContainer>
        <Dl>
          <Dt>{t('labels.supportThreshold')}</Dt>
          <Dd>&gt;{Math.round(inputs.supportThreshold * 100)}%</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumParticipation')}</Dt>
          <Dd>{minParticipation}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.review.proposalThreshold')}</Dt>
          <Dd>{minProposalThreshold}</Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.minimumDuration')}</Dt>
          <Dd>
            <div className="space-x-1.5">
              <span>{t('createDAO.review.days', {days})}</span>
              <span>{t('createDAO.review.hours', {hours})}</span>
              <span>{t('createDAO.review.minutes', {minutes})}</span>
            </div>
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.earlyExecution')}</Dt>
          <Dd>
            {inputs.votingMode === 'EARLY_EXECUTION'
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
        <Dl>
          <Dt>{t('labels.voteReplacement')}</Dt>
          <Dd>
            {inputs.votingMode === 'VOTE_REPLACEMENT'
              ? t('labels.yes')
              : t('labels.no')}
          </Dd>
        </Dl>
      </ActionCardDlContainer>
    </AccordionMethod>
  );
};
