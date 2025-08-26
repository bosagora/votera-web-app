import {AlertInline, ButtonText} from 'votera-ui-components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {Action, ProposalPhase} from 'utils/types';
import {ProposalPhaseExtended} from '../../pages/details';
import {ProposalPeriod} from 'votera-sdk-client';
import {useClient} from 'hooks/useClient';

import {useCreateTransitionContext} from 'context/createTransition';
import {CreateTransitionProvider} from 'context/createTransition';
const Card = styled.div.attrs({
  className:
    'w-84 flex-col bg-white rounded-xl py-3 px-2 desktop:p-3 space-y-3',
})``;

const Header = styled.div.attrs({
  className: 'flex flex-col space-y-1',
})``;

const Title = styled.h2.attrs({
  className: 'text-ui-800 font-bold ft-text-xl',
})``;

const Description = styled.p.attrs({
  className: 'text-ui-600 font-normal ft-text-sm',
})``;

const Content = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const Footer = styled.div.attrs({
  className:
    'flex flex-col tablet:flex-row items-center gap-y-2 tablet:gap-y-0 tablet:gap-x-3',
})``;

const StyledButtonText = styled(ButtonText).attrs({
  className: 'w-full tablet:w-max',
})``;

type TransitionProps = {
  proposalId: string;
  phase: ProposalPhase;
  exPhase: ProposalPhaseExtended;
  exPhaseMessage: string;
  period: ProposalPeriod;
};

export const StageTransitionWidget: React.FC<TransitionProps> = ({
  period,
  phase,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();
  const {client} = useClient();
  //
  // useEffect(() => {
  //   console.log('exPhase', exPhase);
  //   console.log('exPhaseMessage', exPhaseMessage);
  // }, [proposalId]);

  return (
    <CreateTransitionProvider>
      <Card>
        <Content>
          <div className="p-4 bg-white rounded-lg border">
            <WidgetFooter proposalId={proposalId} exPhase={exPhase} />
          </div>
        </Content>
      </Card>
    </CreateTransitionProvider>
  );
};

type FooterProps = {
  proposalId?: string;
  exPhase: ProposalPhaseExtended;
};

const WidgetFooter: React.FC<FooterProps> = ({proposalId, exPhase}) => {
  const {t} = useTranslation();
  const {handlePublishTransition} = useCreateTransitionContext();

  const handleTransitionSubmit = async () => {
    if (!proposalId) return;

    try {
      await handlePublishTransition({
        proposalId: proposalId,
      });
    } catch (error) {
      console.error('단계 전환 중 오류 발생:', error);
    }
  };

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={t('transitionWidget.title')}
        size="large"
        onClick={handleTransitionSubmit}
      />
      <AlertInline label={t('transitionWidget.description')} />
    </Footer>
  );
};
