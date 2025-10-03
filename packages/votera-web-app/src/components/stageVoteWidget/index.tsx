import {
  AlertCard,
  AlertInline,
  ButtonText,
  IconAdd,
  IconLinkExternal,
  Link,
} from 'votera-ui-components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import SelectVoteForm from 'containers/selectVoteForm';
import {ProposalPhase} from 'utils/types';
import {ProposalPhaseExtended} from '../../pages/dashboard';
import VoteResults from 'components/voteResults';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
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
  isVoter?: boolean;
  myBallot?: VoteBallotData | null;
  exPhase?: ProposalPhaseExtended;
  exPhaseMessage?: string;
  proposalId: BigNumber;
  period: ProposalPeriod;
};

export const StageVoteWidget: React.FC<VoteWidgetProps> = ({
  phase,
  canVote,
  isVoter,
  myBallot,
  exPhase,
  exPhaseMessage,
  proposalId,
}) => {
  const {t} = useTranslation();
  const [selectedVote, setSelectedVote] = useState<Candidate | null>(null);
  const [hasSelected, setHasSelected] = useState(false);
  const {client} = useClient();
  const [voteSummary, setVoteSummary] = useState<Array<number>>([0, 0, 0]);
  const {address} = useWallet();
  useEffect(() => {
    const fetchVoteSummary = async () => {
      const voteSummary = await client?.methods.getVoteSummary(
        proposalId.toString()
      );
      setVoteSummary(voteSummary || [0, 0, 0]);
    };
    fetchVoteSummary();
  }, [proposalId]);

  const selectVote = (choice: Candidate) => {
    setSelectedVote(choice);
    setHasSelected(true);
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
                {!isVoter && (
                  <NotVoterAlertWrapper>
                    <AlertMessage>
                      {t('voteWidget.notVoterAlert')}{' '}
                      <Link
                        label={t('voteWidget.notVoterAlertLink')}
                        href={t('voteWidget.notVoterAlertLinkURL')}
                        iconRight={<IconLinkExternal />}
                      />
                    </AlertMessage>
                  </NotVoterAlertWrapper>
                )}
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
                    isVoter={isVoter}
                    hasSelected={hasSelected}
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

type FooterProps = Pick<
  VoteWidgetProps,
  'phase' | 'exPhase' | 'canVote' | 'isVoter'
> & {
  proposalId: BigNumber;
  choice: Candidate | null;
  hasSelected: boolean;
};

const WidgetFooter: React.FC<FooterProps> = ({
  phase = ProposalPhase.VOTE,
  canVote,
  isVoter,
  proposalId,
  choice,
  exPhase,
  hasSelected,
}) => {
  const {t} = useTranslation();
  const [showNotVoterModal, setShowNotVoterModal] = useState(false);
  
  const btnLabel =
    exPhase === ProposalPhaseExtended.OPENED_VOTE
      ? t('governance.proposals.buttons.vote')
      : 'Transition to Execution';

  const {handlePublishVote} = useCreateVoteContext();

  const handleVoteSubmit = async (
    choice: Candidate | null,
    openExpiredVote: boolean
  ) => {
    if (!choice) return;
    
    if (isVoter) {
      await handlePublishVote({
        proposalId: proposalId.toString(),
        choice: choice,
        openExpiredVote,
      });
    } else {
      setShowNotVoterModal(true);
    }
  };

  const openExpiredVote = exPhase === ProposalPhaseExtended.OPENED_EXPIRED_VOTE;

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={btnLabel}
        size="large"
        onClick={() => handleVoteSubmit(choice, openExpiredVote)}
        disabled={!canVote || !hasSelected}
      />
      <AlertInline label={t('voteWidget.voteStatusDesc')} />
      
      <ModalBottomSheetSwitcher
        isOpen={showNotVoterModal}
        onClose={() => setShowNotVoterModal(false)}
        title={t('voteWidget.notVoterModal.title')}
      >
        <ModalContent>
          <MessageText>
            {t('voteWidget.notVoterModal.message')}
          </MessageText>
          <CloseButton
            css={{}}
            label={t('voteWidget.notVoterModal.closeButton')}
            mode="secondary"
            size="large"
            onClick={() => setShowNotVoterModal(false)}
          />
        </ModalContent>
      </ModalBottomSheetSwitcher>
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

const ModalContent = styled.div.attrs({
  className: 'flex flex-col space-y-4 p-4',
})``;

const MessageText = styled.p.attrs({
  className: 'text-ui-800 text-center text-base leading-relaxed',
})``;

const CloseButton = styled(ButtonText).attrs({
  className: 'w-full',
})``;

const NotVoterAlertWrapper = styled.div.attrs({
  className: 'w-full p-3 bg-blue-50 border border-blue-200 rounded-lg',
})``;

const AlertMessage = styled.div.attrs({
  className: 'flex items-center gap-2 text-sm text-ui-600',
})`
  a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #003da5;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;
