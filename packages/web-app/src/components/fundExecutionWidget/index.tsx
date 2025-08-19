import {AlertInline, ButtonText} from '@aragon/ui-components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {ProposalPhase} from 'utils/types';
import {ProposalPhaseExtended} from '../../pages/details';
import {ProposalPeriod} from 'votera-sdk-client';
import {useClient} from 'hooks/useClient';

import {useCreateExecuteContext} from 'context/createExecute';
import {CreateExecuteProvider} from 'context/createExecute';
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

type ExecutionProps = {
  period: ProposalPeriod;
  proposalId: string;
  phase: ProposalPhase;
  exPhase: ProposalPhaseExtended;
  exPhaseMessage: string;
};

export const FundExecutionWidget: React.FC<ExecutionProps> = ({
  period,
  phase,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();

  useEffect(() => {
    console.log('exPhase', exPhase);
    console.log('exPhaseMessage', exPhaseMessage);
  }, [proposalId]);

  return (
    <CreateExecuteProvider>
      <Card>
        {/* <Header>
      {/* <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header> */}

        <Content>
          <div className="p-4 bg-white rounded-lg border">
            <WidgetFooter proposalId={proposalId} exPhase={exPhase} />
          </div>
        </Content>
      </Card>
    </CreateExecuteProvider>
  );
};

type FooterProps = {
  proposalId?: string;
  exPhase: ProposalPhaseExtended;
};

const WidgetFooter: React.FC<FooterProps> = ({proposalId, exPhase}) => {
  const {t} = useTranslation();
  const {handlePublishExecution} = useCreateExecuteContext();

  const handleExecutionSubmit = async () => {
    if (!proposalId) return;

    try {
      await handlePublishExecution({
        proposalId: proposalId,
      });
    } catch (error) {
      console.error('출금 요청 중 오류 발생:', error);
    }
  };

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={t('executionWidget.title')}
        size="large"
        onClick={handleExecutionSubmit}
      />
      <AlertInline label={t('executionWidget.description')} />
    </Footer>
  );
};
