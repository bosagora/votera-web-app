import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FiChevronDown} from 'react-icons/fi';
import {Link} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {shortenAddress} from 'utils/library';
import {useClient2} from 'hooks/useClient2';
import {SortType, IVoteBallotData, Candidate} from 'votera-sdk-client';
import {TFunction, useTranslation} from 'react-i18next';

interface Comment {
  id: string;
  author: string;
  vote: 'yes' | 'no' | 'abstain';
  createdAt: string;
}

interface CommentListProps {
  proposalId: string;
  comments: Comment[];
}

const VoterList: React.FC<CommentListProps> = ({proposalId, comments}) => {
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {client} = useClient2();

  const PAGE_SIZE = 10;

  const [voters, setVoters] = useState<string[]>([]);
  const [ballotLength, setBallotLength] = useState<number>(0);
  const [ballots, setBallots] = useState<IVoteBallotData[]>([]);
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

    console.log('newBallots >>>>>>>>>>>>', newBallots);
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

      const length = await client.methods.getBallotLength(proposalId);
      setBallotLength(length || 0);

      if (length && length > 0) {
        await fetchBallots(0);
      }
    };

    initializeBallots();
  }, [proposalId, client]);

  const handleLoadMore = async () => {
    console.log('handleLoadMore >>>>>>>>>>>>');
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

  const voteStats = comments.reduce(
    (acc, comment) => {
      acc[comment.vote]++;
      return acc;
    },
    {
      yes: 0,
      no: 0,
      abstain: 0,
    }
  );

  return (
    <Container>
      <Header>
        <HeaderTitle>{t('voteWidget.voteStatus')}</HeaderTitle>
        <VoterCount>
          {t('voteWidget.voterCount', {count: ballotLength})}
        </VoterCount>
      </Header>

      {/* <VoteStatsContainer>
        <VoteStatItem>
          <VoteLabel vote="yes">찬성</VoteLabel>
          <VoteCount>{voteSummary?.[1] || 0}명</VoteCount>
        </VoteStatItem>
        <VoteStatItem>
          <VoteLabel vote="no">반대</VoteLabel>
          <VoteCount>{voteSummary?.[2] || 0}명</VoteCount>
        </VoteStatItem>
        <VoteStatItem>
          <VoteLabel vote="abstain">기권</VoteLabel>
          <VoteCount>{voteSummary?.[0] || 0}명</VoteCount>
        </VoteStatItem>
      </VoteStatsContainer> */}

      {ballots.length > 0 ? (
        <>
          {ballots.map(ballot => (
            <CommentItem key={ballot.voter}>
              <CommentHeader>
                <HeaderLeft>
                  <Link
                    external
                    label={shortenAddress(ballot.voter)}
                    href={`${CHAIN_METADATA[network].explorer}/address/${ballot.voter}`}
                  />
                  <VoteChoice vote={ballot.choice}>
                    {getVoteText(ballot.choice, t)}
                  </VoteChoice>
                </HeaderLeft>
                <CreatedAt>
                  {
                    new Date(Number(ballot.timestamp) * 1000)
                      .toISOString()
                      .split('T')[0]
                  }
                </CreatedAt>
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

const VoteStatsContainer = styled.div.attrs({
  className:
    'flex flex-col items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg max-w-[300px] mx-auto w-full',
})``;

const VoteStatItem = styled.div.attrs({
  className: 'flex items-center justify-between w-full px-4',
})``;

const VoteLabel = styled.span<{vote: Comment['vote']}>`
  ${({vote}) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 16px;
    min-width: 80px;
    text-align: center;
    ${
      vote === 'yes' &&
      `
      background-color: #E8FFF1;
      color: #16A34A;
    `
    }
    ${
      vote === 'no' &&
      `
      background-color: #FFE8E8;
      color: #DC2626;
    `
    }
    ${
      vote === 'abstain' &&
      `
      background-color: #F3F4F6;
      color: #6B7280;
    `
    }
  `}
`;

const VoteCount = styled.span.attrs({
  className: 'text-sm text-[#666] font-medium',
})`
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export default VoterList;
