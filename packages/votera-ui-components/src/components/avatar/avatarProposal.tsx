import React, {HTMLAttributes, useMemo} from 'react';
import styled from 'styled-components';

export interface AvatarProposalProps extends HTMLAttributes<HTMLElement> {
  title: string;
  type: string;
  size?: 'small' | 'medium' | 'big' | 'hero' | 'unset';
  onClick?: () => void;
}

export const AvatarProposal: React.FC<AvatarProposalProps> = ({
  title,
  type,
  size = 'medium',
  onClick,
  ...props
}) => {
  const proposalInitials = useMemo(() => {
    if (!type) return '';
    const arr = type.trim().split(' ');
    return arr.length === 1 ? arr[0][0] : arr[0][0] + arr[1][0];
  }, []);

  return (
    <FallBackAvatar onClick={onClick} size={size} {...props}>
      <ProposalInitials>{proposalInitials?.toUpperCase()}</ProposalInitials>
    </FallBackAvatar>
  );
};

type AvatarPropsType = {
  size: NonNullable<AvatarProposalProps['size']>;
};

const sizes = {
  small: 'w-3 h-3 ft-text-xs',
  medium: 'w-6 h-6 ft-text-base',
  big: 'w-10 h-10 ft-text-lg',
  hero: 'w-14 h-14 ft-text-xl',
};

const FallBackAvatar = styled.div.attrs(({size}: AvatarPropsType) => ({
  className:
    'flex items-center justify-center font-bold text-ui-0 bg-gradient-to-r' +
    ` from-primary-500 to-primary-800 ${
      size !== 'unset' && sizes[size]
    } rounded-full border`,
}))<AvatarPropsType>``;

const ProposalInitials = styled.p.attrs({
  className: 'w-4 h-4 flex items-center justify-center',
})``;
