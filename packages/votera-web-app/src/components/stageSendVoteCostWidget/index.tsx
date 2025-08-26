import {AlertInline, ButtonText} from 'votera-ui-components';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {
  CreateSendVoteCostProvider,
  useCreateSendVoteCostContext,
} from '../../context/createSendVoteCost';

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

type SendVoteCostProps = {
  proposalId: string;
};

export const StageSendVoteCostWidget: React.FC<SendVoteCostProps> = ({
  proposalId,
}) => {
  const {t} = useTranslation();

  return (
    <CreateSendVoteCostProvider>
      <Card>
        <Content>
          <div className="p-4 bg-white rounded-lg border">
            <WidgetFooter proposalId={proposalId} />
          </div>
        </Content>
      </Card>
    </CreateSendVoteCostProvider>
  );
};

type FooterProps = {
  proposalId?: string;
};

const WidgetFooter: React.FC<FooterProps> = ({proposalId}) => {
  const {t} = useTranslation();
  const {handlePublish} = useCreateSendVoteCostContext();

  const handleExecutionSubmit = async () => {
    if (!proposalId) return;

    try {
      await handlePublish({
        proposalId: proposalId,
      });
    } catch (error) {
      console.error('투표비용 전송 중 오류 발생:', error);
    }
  };

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={t('sendVoteCostWidget.title')}
        size="large"
        onClick={handleExecutionSubmit}
      />
      <AlertInline label={t('sendVoteCostWidget.description')} />
    </Footer>
  );
};
