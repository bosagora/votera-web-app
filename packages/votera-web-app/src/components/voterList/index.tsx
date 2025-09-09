import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FiChevronDown} from 'react-icons/fi';
import {Link} from 'votera-ui-components';
import {useNetwork} from 'context/network';
import {
  chainExplorer2AddressLink,
  chainExplorerAddressLink,
} from 'utils/constants';
import {
  getValidatorKeyForLink,
  shortenAddress,
  shortenValidatorKey,
} from 'utils/library';
import {useClient} from 'hooks/useClient';
import {SortType, VoteBallotData, Candidate} from 'votera-sdk-client';
import {TFunction, useTranslation} from 'react-i18next';
import moment from 'moment/moment';

interface VoteListProps {
  proposalId: string;
}

const VoterList: React.FC<VoteListProps> = ({proposalId}) => {
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {client} = useClient();

  const PAGE_SIZE = 5;

  const [ballotLength, setBallotLength] = useState<number>(0);
  const [voterLength, setVoterLength] = useState<number>(0);
  const [ballots, setBallots] = useState<VoteBallotData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBallots = async (page: number) => {
    if (!client) return;

    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    const newBallots = await client.methods.getBallotList(
      proposalId,
      startIndex,
      endIndex,
      SortType.DSC
    );

    // console.log('newBallots >>>>>>>>>>>>', newBallots);
    if (newBallots) {
      if (page === 0) {
        setBallots(newBallots);
      } else {
        setBallots(prev => {
          const uniqueBallots = newBallots.filter(
            newBallot => !prev.some(p => p.voter === newBallot.voter)
          );
          return [...prev, ...uniqueBallots];
        });
      }

      setHasMore(newBallots.length === PAGE_SIZE);
    }
  };

  useEffect(() => {
    const initializeBallots = async () => {
      if (!client || !proposalId) return;

      const ballotLength = await client.methods.getBallotLength(proposalId);
      setBallotLength(ballotLength || 0);
      const voterLength = await client.methods.getVoterLength(proposalId);
      setVoterLength(voterLength || 0);

      if (ballotLength && ballotLength > 0) {
        await fetchBallots(0);
      }
    };

    initializeBallots();
  }, [proposalId, client]);

  const handleLoadMore = async () => {
    // console.log('handleLoadMore >>>>>>>>>>>>');
    const nextPage = currentPage + 1;
    await fetchBallots(nextPage);
    setCurrentPage(nextPage);
  };

  const getVoteText = (vote: Candidate, t: TFunction) => {
    switch (vote) {
      case Candidate.YES:
        return t('voteWidget.yes');
      case Candidate.NO:
        return t('voteWidget.no');
      case Candidate.BLANK:
        return t('voteWidget.abstain');
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>{t('voteWidget.voteStatus')}</HeaderTitle>
        <VoterCount>
          {t('voteWidget.voterCount', {
            count: ballotLength,
            total: voterLength,
          })}
        </VoterCount>
      </Header>

      {ballots.length > 0 ? (
        <>
          {ballots.map(ballot => (
            <CommentItem key={ballot.voter}>
              <CommentHeader>
                <HeaderLeft>
                  <Link
                    external
                    label={shortenAddress(ballot.voter)}
                    href={chainExplorerAddressLink(network, ballot.voter)}
                  />
                  <VoteChoice vote={ballot.choice}>
                    {getVoteText(ballot.choice, t)}
                  </VoteChoice>
                </HeaderLeft>
                <CreatedAt>
                  {ballot.timestamp != 0
                    ? moment(new Date(Number(ballot.timestamp) * 1000)).format(
                        'YYYY-MM-DD HH:mm:ss'
                      )
                    : ''}
                </CreatedAt>
              </CommentHeader>
              <CommentHeader>
                <HeaderLeft>
                  <Link
                    external
                    label={shortenValidatorKey(ballot.validatorKey)}
                    href={chainExplorer2AddressLink(
                      network,
                      getValidatorKeyForLink(ballot.validatorKey)
                    )}
                  />
                </HeaderLeft>
              </CommentHeader>
              <Divider />
            </CommentItem>
          ))}
          {hasMore && (
            <ShowMoreButton onClick={handleLoadMore}>
              <FiChevronDown size={20} />
              {t('explore.showMore')}
            </ShowMoreButton>
          )}
        </>
      ) : (
        <EmptyMessage>{t('voteWidget.emptyState')}</EmptyMessage>
      )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'w-full p-4 bg-white',
})``;

const CommentItem = styled.div.attrs({
  className: 'mb-3',
})``;

const CommentHeader = styled.div.attrs({
  className: 'flex justify-between items-center mb-3',
})``;

const CreatedAt = styled.span.attrs({
  className: 'text-[#666] text-sm',
})``;

const Divider = styled.hr.attrs({
  className: 'border-0 border-b border-[#e6e6e6] m-0',
})``;

const ShowMoreButton = styled.button.attrs({
  className:
    'w-full flex items-center justify-center gap-1 py-2 text-[#666] hover:bg-gray-50 transition-colors',
})``;

const HeaderLeft = styled.div.attrs({
  className: 'flex items-center gap-3',
})``;

const VoteChoice = styled.span<{vote: Candidate}>`
  ${({vote}) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    ${
      vote === Candidate.YES &&
      `
      background-color: #E8FFF1;
      color: #16A34A;
    `
    }
    ${
      vote === Candidate.NO &&
      `
      background-color: #FFE8E8;
      color: #DC2626;
    `
    }
    ${
      vote === Candidate.BLANK &&
      `
      background-color: #F3F4F6;
      color: #6B7280;
    `
    }
  `}
`;

const Header = styled.div.attrs({
  className:
    'flex justify-between items-center mb-1 pb-3 border-b border-[#e6e6e6]',
})``;

const HeaderTitle = styled.h2.attrs({
  className: 'text-lg font-semibold text-[#333]',
})``;

const VoterCount = styled.span.attrs({
  className: 'text-sm text-[#666]',
})``;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export default VoterList;
