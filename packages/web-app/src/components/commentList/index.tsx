import React from 'react';
import styled from 'styled-components';
import { FiChevronDown, FiSend } from 'react-icons/fi';
import { Link } from '@aragon/ui-components';
import { useNetwork } from 'context/network';
import { CHAIN_METADATA } from 'utils/constants';
import { shortenAddress } from 'utils/library';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface CommentListProps {
  comments: Comment[];
  onSubmit?: (content: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({comments, onSubmit}) => {
  const { network } = useNetwork();
  const [newComment, setNewComment] = React.useState('');
  
  const handleSubmit = () => {
    if (!newComment.trim()) return;
    onSubmit?.(newComment);
    setNewComment('');
  };

  return (
    <Container>
      <CommentInput>
        <InputWrapper>
          <StyledTextarea 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요"
            rows={3}
          />
          <SubmitButton onClick={handleSubmit}>
            <FiSend size={20} />
          </SubmitButton>
        </InputWrapper>
      </CommentInput>

      {comments.map((comment) => (
        <CommentItem key={comment.id}>
          <CommentHeader>
            <Link
              external
              label={shortenAddress(comment.author)}
              href={`${CHAIN_METADATA[network].explorer}/address/${comment.author}`}
            />
            <CreatedAt>{comment.createdAt}</CreatedAt>
          </CommentHeader>
          <Content>{comment.content}</Content>
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

const Content = styled.p.attrs({
  className: "m-0 p-0 text-[#333] leading-normal mb-4"
})``;

const Divider = styled.hr.attrs({
  className: "border-0 border-b border-[#e6e6e6] m-0"
})``;

const ShowMoreButton = styled.button.attrs({
  className: "w-full flex items-center justify-center gap-1 py-2 text-[#666] hover:bg-gray-50 transition-colors"
})``;

const CommentInput = styled.div.attrs({
  className: "mb-10"
})``;

const InputWrapper = styled.div.attrs({
  className: "relative"
})``;

const StyledTextarea = styled.textarea.attrs({
  className: "w-full p-3 pr-12 border border-[#e6e6e6] rounded-md resize-none focus:outline-none focus:border-blue-500"
})``;

const SubmitButton = styled.button.attrs({
  className: "absolute right-2 bottom-2 text-blue-500 hover:text-blue-600 transition-colors"
})``;

export default CommentList;
