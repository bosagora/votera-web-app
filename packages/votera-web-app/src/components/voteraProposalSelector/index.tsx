import {
  AvatarDao,
  AvatarDaoProps,
  ButtonIcon,
  IconChevronDown,
  shortenAddress,
} from 'votera-ui-components';
import React from 'react';
import styled from 'styled-components';

import useScreen from 'hooks/useScreen';

type VoteraProposalSelectorProps = {
  proposalTitle: string;
  proposalId: string;
  onClick: () => void;
} & Pick<AvatarDaoProps, 'src'>;

export const VoteraProposalSelector: React.FC<VoteraProposalSelectorProps> = ({
  proposalTitle,
  proposalId,
  onClick,
  src,
}: VoteraProposalSelectorProps) => {
  const {isDesktop} = useScreen();

  return (
    <Card data-testid="cardDao" onClick={onClick}>
      <LeftContent>
        <AvatarWrapper>
          <AvatarDao proposalTitle={proposalTitle} src={src} />
        </AvatarWrapper>
        <TextContainer>
          <DaoName>{proposalTitle}</DaoName>
          <DaoAddress>{shortenAddress(proposalId)}</DaoAddress>
        </TextContainer>
      </LeftContent>

      <ButtonIcon
        icon={<IconChevronDown />}
        mode="secondary"
        size="small"
        bgWhite={!isDesktop}
        css={{}}
      />
    </Card>
  );
};

const Card = styled.div.attrs(() => ({
  className:
    'flex desktop:inline-flex items-center space-x-2 bg-ui-0' +
    ' desktop:bg-transparent p-3 desktop:p-0 rounded-xl cursor-pointer',
}))``;

const LeftContent = styled.div.attrs({
  className: 'inline-flex flex-1 space-x-1.5 min-w-0',
})``;

const AvatarWrapper = styled.div``;

const TextContainer = styled.div.attrs({
  className: 'flex flex-col justify-center min-w-0 ',
})``;

const DaoName = styled.p.attrs({
  className: 'text-ui-800 font-bold truncate',
})`
  max-width: 88px;
`;

const DaoAddress = styled.p.attrs({
  className: 'text-ui-500 ft-text-sm desktop:hidden truncate',
})``;
