import React from 'react';
import styled from 'styled-components';
import { FiChevronDown } from 'react-icons/fi';
import { Link } from '@aragon/ui-components';
import { useNetwork } from 'context/network';
import { CHAIN_METADATA } from 'utils/constants';
import { shortenAddress } from 'utils/library';

interface Comment {
  id: string;
  author: string;
  vote: 'yes' | 'no' | 'abstain';
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
}

const VoterList: React.FC<CommentListProps> = ({comments}) => {
  const { network } = useNetwork();

  const getVoteText = (vote: Comment['vote']) => {
    switch (vote) {
      case 'yes':
        return '찬성';
      case 'no':
        return '반대';
      case 'abstain':
        return '기권';
    }
  };

  const voteStats = comments.reduce((acc, comment) => {
    acc[comment.vote]++;
    return acc;
  }, {
    yes: 0,
    no: 0,
    abstain: 0
  });

  return (
    <Container>
      <Header>
        <HeaderTitle>투표 현황</HeaderTitle>
        <VoterCount>{comments.length}명 참여</VoterCount>
      </Header>

      <VoteStatsContainer>
        <VoteStatItem>
          <VoteLabel vote="yes">찬성</VoteLabel>
          <VoteCount>{voteStats.yes}명</VoteCount>
        </VoteStatItem>
        <VoteStatItem>
          <VoteLabel vote="no">반대</VoteLabel>
          <VoteCount>{voteStats.no}명</VoteCount>
        </VoteStatItem>
        <VoteStatItem>
          <VoteLabel vote="abstain">기권</VoteLabel>
          <VoteCount>{voteStats.abstain}명</VoteCount>
        </VoteStatItem>
      </VoteStatsContainer>
      
      {comments.map((comment) => (
        <CommentItem key={comment.id}>
          <CommentHeader>
            <HeaderLeft>
              <Link
                external
                label={shortenAddress(comment.author)}
                href={`${CHAIN_METADATA[network].explorer}/address/${comment.author}`}
              />
              <VoteChoice vote={comment.vote}>
                {getVoteText(comment.vote)}
              </VoteChoice>
            </HeaderLeft>
            <CreatedAt>{comment.createdAt}</CreatedAt>
          </CommentHeader>
          <Divider />
        </CommentItem>
      ))}
      <ShowMoreButton>
        <FiChevronDown size={20} />
        더 보기
      </ShowMoreButton>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: "w-full p-4 bg-white"
})``;

const CommentItem = styled.div.attrs({
  className: "mb-3"
})``;

const CommentHeader = styled.div.attrs({
  className: "flex justify-between items-center mb-3"
})``;

const CreatedAt = styled.span.attrs({
  className: "text-[#666] text-sm"
})``;

const Divider = styled.hr.attrs({
  className: "border-0 border-b border-[#e6e6e6] m-0"
})``;

const ShowMoreButton = styled.button.attrs({
  className: "w-full flex items-center justify-center gap-1 py-2 text-[#666] hover:bg-gray-50 transition-colors"
})``;

const HeaderLeft = styled.div.attrs({
  className: "flex items-center gap-3"
})``;

const VoteChoice = styled.span<{ vote: Comment['vote'] }>`
  ${({ vote }) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    ${vote === 'yes' && `
      background-color: #E8FFF1;
      color: #16A34A;
    `}
    ${vote === 'no' && `
      background-color: #FFE8E8;
      color: #DC2626;
    `}
    ${vote === 'abstain' && `
      background-color: #F3F4F6;
      color: #6B7280;
    `}
  `}
`;

const Header = styled.div.attrs({
  className: "flex justify-between items-center mb-1 pb-3 border-b border-[#e6e6e6]"
})``;

const HeaderTitle = styled.h2.attrs({
  className: "text-lg font-semibold text-[#333]"
})``;

const VoterCount = styled.span.attrs({
  className: "text-sm text-[#666]"
})``;

const VoteStatsContainer = styled.div.attrs({
  className: "flex flex-col items-center gap-3 mb-3 p-3 bg-gray-50 rounded-lg max-w-[300px] mx-auto w-full"
})``;

const VoteStatItem = styled.div.attrs({
  className: "flex items-center justify-between w-full px-4"
})``;

const VoteLabel = styled.span<{ vote: Comment['vote'] }>`
  ${({ vote }) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 16px;
    ${vote === 'yes' && `
      background-color: #E8FFF1;
      color: #16A34A;
      min-width: 80px;
      text-align: center;
    `}
    ${vote === 'no' && `
      background-color: #FFE8E8;
      color: #DC2626;
      min-width: 80px;
      text-align: center;
    `}
    ${vote === 'abstain' && `
      background-color: #F3F4F6;
      color: #6B7280;
      min-width: 80px;
      text-align: center;
    `}
  `}
`;

const VoteCount = styled.span.attrs({
  className: "text-sm text-[#666] font-medium"
})`
  font-size: 16px;
`;

export default VoterList;