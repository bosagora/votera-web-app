import {
  AlertCard,
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import SelectVoteForm from 'containers/selectVoteForm';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
// import {PluginTypes} from 'hooks/usePluginClient';
import {CHAIN_METADATA} from 'utils/constants';
import {Action, ProposalPhase} from 'utils/types';
import {ProposalPhaseExtended} from 'pages/proposal';
import VoteResults from 'components/voteResults';
import {BigNumber} from 'ethers';

type VoteWidgetProps = {
  txhash?: string;
  phase?: ProposalPhase;
  onExecuteClicked?: () => void;
  canVote?: boolean;
  exPhase?: ProposalPhaseExtended;
  exPhaseMessage?: string;
  proposalId: BigNumber;
};

export const FundVoteWidget: React.FC<VoteWidgetProps> = ({
  phase,
  txhash,
  onExecuteClicked,
  canVote,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();

  return (
    <Card>
      <Header>
        <Title>{t('governance.executionCard.title')}</Title>
        <Description>{t('governance.executionCard.description')}</Description>
      </Header>

      <Content>
        <div className="space-y-3">
          <p className="text-lg font-bold text-ui-800">투표하기</p>
          <div className="flex flex-col gap-3">
            <SelectVoteForm />
            <WidgetFooter
              phase={phase}
              txhash={txhash}
              onExecuteClicked={onExecuteClicked}
              canVote={canVote}
            />
          </div>
          <div className="flex justify-center gap-8 my-6">
            <div className="text-3xl font-bold text-blue-500">
              {exPhaseMessage}
            </div>
            {/* <div className="text-3xl font-bold text-red-500">탈표 탈락</div> */}
          </div>
          <VoteResults
            values={[
              {
                voter: '0x1234567890abcdef1234567890abcdef12345678',
                timestamp: 1709251200,
                choice: 0,
              },
              {
                voter: '0xabcdef1234567890abcdef1234567890abcdef12',
                timestamp: 1709337600,
                choice: 1,
              },
              {
                voter: '0x7890abcdef1234567890abcdef1234567890abcd',
                timestamp: 1709424000,
                choice: 2,
              },
              {
                voter: '0x2468ace02468ace02468ace02468ace02468ace0',
                timestamp: 1709510400,
                choice: 1,
              },
              {
                voter: '0x1357bdf91357bdf91357bdf91357bdf91357bdf9',
                timestamp: 1709596800,
                choice: 0,
              },
            ]}
          />
        </div>
      </Content>
    </Card>
  );
};

type FooterProps = Pick<
  VoteWidgetProps,
  'phase' | 'txhash' | 'onExecuteClicked' | 'canVote'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  phase = ProposalPhase.VOTE,
  onExecuteClicked,
  canVote,
}) => {
  const {t} = useTranslation();

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={t('governance.proposals.buttons.execute')}
        size="large"
        onClick={onExecuteClicked}
        disabled={!canVote}
      />
      <AlertInline label={t('governance.executionCard.status.succeeded')} />
    </Footer>
  );
};

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
