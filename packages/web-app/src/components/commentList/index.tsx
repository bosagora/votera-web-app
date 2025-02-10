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

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentListProps {
  proposalId: string;
  isVoter: boolean;
  onSubmit?: (content: string) => void;
}

const CommentListContent: React.FC<CommentListProps> = ({
  proposalId,
  isVoter,
  onSubmit,
}) => {
  const {network} = useNetwork();
  const [newComment, setNewComment] = React.useState('');
  const {handlePublishComment} = useCreateCommentContext();

  const [comments, setComments] = React.useState<ICommentData[]>();
  const [commentLength, setCommentLength] = React.useState(0);

  const {client} = useClient2();

  useEffect(() => {
    console.log('commentList >>>>>>>>>>>>');
    const getCommentLength = async () => {
      const commentLength = await client?.methods.getCommentLength(
        proposalId.toString()
      );
      console.log('commentLength', commentLength);
      if (commentLength) {
        setCommentLength(commentLength);
      }
      return commentLength;
    };

    const getCommentList = async (length: number) => {
      if (length === 0) return;
      const comments = await client?.methods.getCommentList(
        proposalId.toString(),
        0,
        length,
        SortType.ASC
      );
      console.log('fetched comments', comments);
      if (comments) {
        setComments(comments);
      }
    };

    getCommentLength().then(length => {
      console.log('commentLength', length);
      getCommentList(length ?? 0);
    });
  }, [proposalId, client]);

  const handleSubmit = async () => {
    if (!newComment.trim() || !proposalId || !isVoter) return;

    try {
      await handlePublishComment({
        proposalId,
        message: newComment,
      });

      onSubmit?.(newComment);
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

      {comments?.map(comment => (
        <CommentItem key={comment.timestamp}>
          <CommentHeader>
            <Link
              external
              label={shortenAddress(comment.writer)}
              href={`${CHAIN_METADATA[network].explorer}/address/${comment.writer}`}
            />
            <CreatedAt>{comment.timestamp}</CreatedAt>
          </CommentHeader>
          <Content>{comment.message}</Content>
          <Divider />
        </CommentItem>
      ))}
      <ShowMoreButton>
        <FiChevronDown size={20} />더 보기
      </ShowMoreButton>
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
