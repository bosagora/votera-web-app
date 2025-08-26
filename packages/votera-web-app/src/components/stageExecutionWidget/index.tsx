import {AlertInline, ButtonText} from 'votera-ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useCreateExecuteContext} from 'context/createExecute';
import {CreateExecuteProvider} from 'context/createExecute';

const Card = styled.div.attrs({
  className:
    'w-84 flex-col bg-white rounded-xl py-3 px-2 desktop:p-3 space-y-3',
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
  proposalId: string;
};

export const StageExecutionWidget: React.FC<ExecutionProps> = ({
  proposalId,
}) => {
  return (
    <CreateExecuteProvider>
      <Card>
        <Content>
          <div className="p-4 bg-white rounded-lg border">
            <WidgetFooter proposalId={proposalId} />
          </div>
        </Content>
      </Card>
    </CreateExecuteProvider>
  );
};

type FooterProps = {
  proposalId?: string;
};

const WidgetFooter: React.FC<FooterProps> = ({proposalId}) => {
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
