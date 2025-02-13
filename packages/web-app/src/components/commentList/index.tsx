import React, {useEffect} from 'react';
import styled from 'styled-components';
import {FiChevronDown, FiSend} from 'react-icons/fi';
import {Link} from '@aragon/ui-components';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {shortenAddress} from 'utils/library';
import {
  CreateCommentProvider,
  useCreateCommentContext,
} from 'context/createComment';
import {useClient2} from 'hooks/useClient2';
import {ICommentData, SortType} from 'votera-sdk-client';
import {useWaitForTransaction} from 'wagmi';
import {useWallet} from 'hooks/useWallet';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentListProps {
  proposalId: string;
  isVoter: boolean;
}

const COMMENTS_PER_PAGE = 6;

const CommentListContent: React.FC<CommentListProps> = ({
  proposalId,
  isVoter,
}) => {
  const {network} = useNetwork();
  const [newComment, setNewComment] = React.useState('');
  const {handlePublishComment} = useCreateCommentContext();

  const [comments, setComments] = React.useState<ICommentData[]>([]);
  const [commentLength, setCommentLength] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const {address} = useWallet();

  const {client} = useClient2();

  const fetchComments = async (page: number) => {
    if (!client) return;

    const startIndex = page * COMMENTS_PER_PAGE;
    const endIndex = startIndex + COMMENTS_PER_PAGE;

    const comments = await client.methods.getCommentList(
      proposalId.toString(),
      startIndex,
      endIndex,
      SortType.DSC
    );

    if (comments) {
      if (page === 0) {
        setComments(comments);
      } else {
        setComments(prev => [...prev, ...comments]);
      }

      setHasMore(comments.length === COMMENTS_PER_PAGE);
    }
  };

  useEffect(() => {
    const initializeComments = async () => {
      if (!client) return;

      const length = await client.methods.getCommentLength(
        proposalId.toString()
      );
      if (length) {
        setCommentLength(length);
        await fetchComments(0);
      }
    };

    initializeComments();
  }, [proposalId, client]);

  const handleLoadMore = async () => {
    const nextPage = currentPage + 1;
    await fetchComments(nextPage);
    setCurrentPage(nextPage);
  };

  const handleSubmit = async () => {
    if (!newComment.trim() || !proposalId || !isVoter) return;

    try {
      // 새 댓글 등록
      const result = await handlePublishComment({
        proposalId,
        message: newComment,
      });

      // 새로운 댓글 객체 생성
      const newCommentData: ICommentData = {
        message: newComment,
        writer: address || '',
        timestamp: Math.floor(Date.now() / 1000),
      };

      // 새 댓글을 목록 맨 앞에 추가
      setComments(prevComments => [newCommentData, ...prevComments]);

      // 전체 댓글 수 증가
      setCommentLength(prev => prev + 1);

      // 입력창 초기화
      setNewComment('');
    } catch (error) {
      console.error('댓글 등록 중 오류 발생:', error);
    }
  };

  return (
    <Container>
      <CommentInput>
        <InputWrapper>
          <StyledTextarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
          />
          <SubmitButton onClick={handleSubmit}>
            <FiSend size={20} />
          </SubmitButton>
        </InputWrapper>
      </CommentInput>

      {comments.map(comment => (
        <CommentItem key={comment.timestamp}>
          <CommentHeader>
            <Link
              external
              label={shortenAddress(comment.writer)}
              href={`${CHAIN_METADATA[network].explorer}/address/${comment.writer}`}
            />
            <CreatedAt>
              {
                new Date(Number(comment.timestamp) * 1000)
                  .toISOString()
                  .split('T')[0]
              }
            </CreatedAt>
          </CommentHeader>
          <Content>{comment.message}</Content>
          <Divider />
        </CommentItem>
      ))}

      {hasMore && (
        <ShowMoreButton onClick={handleLoadMore}>
          <FiChevronDown size={20} />더 보기
        </ShowMoreButton>
      )}
    </Container>
  );
};

const CommentList: React.FC<CommentListProps> = props => {
  console.log('commentList >>>>>>>>>>>>');
  return (
    <CreateCommentProvider>
      <CommentListContent {...props} />
    </CreateCommentProvider>
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

const Content = styled.p.attrs({
  className: 'm-0 p-0 text-[#333] leading-normal mb-4',
})``;

const Divider = styled.hr.attrs({
  className: 'border-0 border-b border-[#e6e6e6] m-0',
})``;

const ShowMoreButton = styled.button.attrs({
  className:
    'w-full flex items-center justify-center gap-1 py-2 text-[#666] hover:bg-gray-50 transition-colors',
})``;

const CommentInput = styled.div.attrs({
  className: 'mb-10',
})``;

const InputWrapper = styled.div.attrs({
  className: 'relative',
})``;

const StyledTextarea = styled.textarea.attrs({
  className:
    'w-full p-3 pr-12 border border-[#e6e6e6] rounded-md resize-none focus:outline-none focus:border-blue-500',
})``;

const SubmitButton = styled.button.attrs({
  className:
    'absolute right-2 bottom-2 text-blue-500 hover:text-blue-600 transition-colors',
})``;

export default CommentList;
