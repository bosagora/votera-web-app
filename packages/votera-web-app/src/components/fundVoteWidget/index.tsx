import {
  AlertCard,
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
} from 'votera-ui-components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import SelectVoteForm from 'containers/selectVoteForm';
import {ProposalPhase} from 'utils/types';
import {ProposalPhaseExtended} from '../../pages/details';
import VoteResults from 'components/voteResults';
import {BigNumber} from 'ethers';
import {CreateVoteProvider, useCreateVoteContext} from 'context/createVote';
import {Candidate, ProposalPeriod, VoteBallotData} from 'votera-sdk-client';
import {useClient} from 'hooks/useClient';
import {useEffect} from 'react';
import {useWallet} from 'hooks/useWallet';

type VoteWidgetProps = {
  txhash?: string;
  phase?: ProposalPhase;
  canVote?: boolean;
  myBallot?: VoteBallotData | null;
  exPhase?: ProposalPhaseExtended;
  exPhaseMessage?: string;
  proposalId: BigNumber;
  period: ProposalPeriod;
};

export const FundVoteWidget: React.FC<VoteWidgetProps> = ({
  period,
  phase,
  txhash,
  canVote,
  myBallot,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();
  const [selectedVote, setSelectedVote] = useState<Candidate>(Candidate.BLANK);
  const {client} = useClient();
  const [voteSummary, setVoteSummary] = useState<Array<number>>([0, 0, 0]);
  const {address} = useWallet();
  console.log('canVote', canVote);
  useEffect(() => {
    console.log('proposalId', proposalId);
    const fetchVoteSummary = async () => {
      const voteSummary = await client?.methods.getVoteSummary(
        proposalId.toString()
      );
      console.log('voteSummary', voteSummary);
      setVoteSummary(voteSummary || [0, 0, 0]);
    };
    fetchVoteSummary();
  }, [proposalId]);

  const selectVote = (choice: Candidate) => {
    setSelectedVote(choice);
  };

  return (
    <CreateVoteProvider>
      <Card>
        <Header>
          {/* <Title>{t('governance.executionCard.title')}</Title> */}
          {/* <Description>{t('governance.executionCard.description')}</Description> */}
        </Header>

        <Content>
          {exPhase === ProposalPhaseExtended.OPENED_VOTE && canVote && (
            <div className="p-4 bg-white rounded-lg border">
              <div className="space-y-3">
                {/* <p className="text-lg font-bold text-ui-800">투표하기</p> */}
                <div className="flex flex-col gap-3">
                  {exPhase === ProposalPhaseExtended.OPENED_VOTE && (
                    <SelectVoteForm onSelect={selectVote} />
                  )}
                  <WidgetFooter
                    phase={phase}
                    exPhase={exPhase}
                    proposalId={proposalId}
                    choice={selectedVote}
                    canVote={canVote}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-white rounded-lg border">
            <div className="flex gap-8 justify-center mt-3">
              <div className="text-lg font-bold text-blue-500">
                {exPhaseMessage}
              </div>
            </div>
            {myBallot && myBallot.voter === address && (
              <div className="flex gap-8 justify-center mb-3">
                <div className="text-sm font-bold text-blue-400">
                  {myBallot.choice === Candidate.YES
                    ? t('voteWidget.yesDesc')
                    : myBallot.choice === Candidate.NO
                    ? t('voteWidget.noDesc')
                    : t('voteWidget.abstainDesc')}
                </div>
              </div>
            )}
            <VoteResults voteSummary={voteSummary} />
          </div>
        </Content>
      </Card>
    </CreateVoteProvider>
  );
};

type FooterProps = Pick<VoteWidgetProps, 'phase' | 'exPhase' | 'canVote'> & {
  proposalId: BigNumber;
  choice: Candidate;
};

const WidgetFooter: React.FC<FooterProps> = ({
  phase = ProposalPhase.VOTE,
  canVote,
  proposalId,
  choice,
  exPhase,
}) => {
  const {t} = useTranslation();
  const btnLabel =
    exPhase === ProposalPhaseExtended.OPENED_VOTE
      ? t('governance.proposals.buttons.vote')
      : 'Transition to Execution';

  const {handlePublishVote} = useCreateVoteContext();

  const handleVoteSubmit = async (
    choice: Candidate,
    openExpiredVote: boolean
  ) => {
    await handlePublishVote({
      proposalId: proposalId.toString(),
      choice: choice,
      openExpiredVote,
    });
  };

  const openExpiredVote = exPhase === ProposalPhaseExtended.OPENED_EXPIRED_VOTE;

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={btnLabel}
        size="large"
        onClick={() => handleVoteSubmit(choice, openExpiredVote)}
        disabled={!canVote}
      />
      <AlertInline label={t('voteWidget.voteStatusDesc')} />
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
