import {
  AvatarDao,
  AvatarProposal,
  ButtonIcon,
  ButtonText,
  ButtonWallet,
  IconMenu,
} from 'votera-ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useWallet} from 'hooks/useWallet';
import NetworkIndicator from './networkIndicator';
import useScreen from 'hooks/useScreen';
import MobileMenu from './mobileMenu';
import VoteraLogo from 'public/votera_color_logo.png';
import {Landing} from 'utils/paths';
import {useNavigate, useLocation} from 'react-router-dom';
import {useReactiveVar} from '@apollo/client';
import {selectedVoteraProposalVar} from '../../context/apolloClient';
import {ProposalType} from 'votera-sdk-client';

type MobileNavProps = {
  isProcess?: boolean;
  onSelect: () => void;
  onWalletClick: () => void;
};

const MobileNav: React.FC<MobileNavProps> = props => {
  const currentProposal = useReactiveVar(selectedVoteraProposalVar);
  const {t} = useTranslation();
  const {isConnected, address} = useWallet();
  const {isMobile} = useScreen();
  const navigate = useNavigate();
  const location = useLocation();

  if (props.isProcess)
    return (
      <Container>
        <NetworkIndicator />
      </Container>
    );

  return (
    <>
      <Container data-testid="navbar">
        <Menu>
          <FlexOne>
            {isMobile ? (
              <ButtonIcon
                css={{}}
                mode="secondary"
                size="large"
                icon={<IconMenu />}
                onClick={() => open('mobileMenu')}
              />
            ) : (
              <ButtonText
                css={{}}
                size="large"
                mode="secondary"
                label={t('menu')}
                iconLeft={<IconMenu />}
                onClick={() => open('mobileMenu')}
              />
            )}
          </FlexOne>
          <FlexOne className="justify-center">
            <ProposalContainer>
              <AvatarProposal
                title={currentProposal.title}
                type={
                  currentProposal.proposalType === ProposalType.FUND
                    ? 'Fund'
                    : 'System'
                }
                onClick={props.onSelect}
              />
              <ProposalName>{currentProposal.title}</ProposalName>
            </ProposalContainer>
          </FlexOne>
          <FlexOne className="justify-end">
            <ButtonWallet
              src={address}
              onClick={props.onWalletClick}
              isConnected={isConnected}
              label={isConnected ? address : t('navButtons.connectWallet')}
            />
          </FlexOne>
        </Menu>
        <NetworkIndicator />
      </Container>
      <MobileMenu />
    </>
  );
};

export default MobileNav;

const FlexOne = styled.div.attrs({
  className: 'flex flex-1' as string | undefined,
})``;

const Container = styled.div.attrs({
  className: 'flex flex-col fixed left-0 bottom-0 w-full z-10',
})``;

const Menu = styled.nav.attrs({
  className: `flex justify-between items-center px-2 tablet:px-3 py-1
     tablet:py-1.5`,
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 0) 0%,
    rgba(245, 247, 250, 1) 100%
  );
  backdrop-filter: blur(24px);
`;

const ProposalContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-0.5 items-center rounded-xl',
})``;

const ProposalName = styled.p.attrs({
  className: 'hidden tablet:block text-sm font-bold text-ui-800',
})``;
