import {useReactiveVar} from '@apollo/client';
import {
  Breadcrumb,
  ButtonText,
  ButtonWallet,
  IconFeedback,
} from 'votera-ui-components';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {i18n} from '../../../i18n.config';
import {
  generatePath,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';

import {Container} from 'components/layout';
import NavLinks from 'components/navLinks';
import ExitProcessMenu, {ProcessType} from 'containers/exitProcessMenu';
import {useNetwork} from 'context/network';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {useWallet} from 'hooks/useWallet';
import {NavlinksDropdown} from './breadcrumbDropdown';
import NetworkIndicator from './networkIndicator';
import VoteraLogo from 'public/logoBlue.svg';
import {Landing} from 'utils/paths';
import {changeLanguage} from '../../../i18n.config';
import {VoteraProposalSelector} from '../../components/voteraProposalSelector';
import {selectedVoteraProposalVar} from '../../context/apolloClient';
import {ProposalType} from 'votera-sdk-client';

const MIN_ROUTE_DEPTH_FOR_BREADCRUMBS = 2;

type DesktopNavProp = {
  isProcess?: boolean;
  returnURL?: string;
  processType?: ProcessType;
  processLabel?: string;
  onSelect: () => void;
  onWalletClick: () => void;
};

const DesktopNav: React.FC<DesktopNavProp> = props => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();
  const {id} = useParams();
  const {address, isConnected} = useWallet();

  const currentProposal = useReactiveVar(selectedVoteraProposalVar);

  const [showExitProcessMenu, setShowExitProcessMenu] = useState(false);

  // Note: Obviously because of convoluted navigation, this is being handled here
  // when it should have been in the wizard instead. That said, once new navigation
  // is added, this should be deprecated and removed
  const handleExitWithWarning = () => {
    if (props.processType) {
      setShowExitProcessMenu(true);
    } else {
      navigate(generatePath(props.returnURL!, {network, id}));
    }
  };

  const exitProcess = useCallback(() => {
    setShowExitProcessMenu(false);
    navigate(generatePath(props.returnURL!, {network, id}));
  }, [id, navigate, network, props.returnURL]);

  const location = useLocation();
  const isExplorePage = location.pathname === '/' || location.pathname === '/explore';

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  if (props.isProcess) {
    return (
      <>
        <Container data-testid="navbar">
          <NetworkIndicator />
          <Menu>
            <Breadcrumb
              crumbs={{label: props.processLabel!, path: props.returnURL!}}
              onClick={handleExitWithWarning}
            />

            <div className="flex gap-3 items-center">
              <ButtonWallet
                src={address}
                onClick={props.onWalletClick}
                isConnected={isConnected}
                label={isConnected ? address : t('navButtons.connectWallet')}
              />
            </div>
          </Menu>
        </Container>
        {props.processType && (
          <ExitProcessMenu
            isOpen={showExitProcessMenu}
            processType={props.processType}
            onClose={() => setShowExitProcessMenu(false)}
            ctaCallback={exitProcess}
          />
        )}
      </>
    );
  }

  return (
    <Container data-testid="navbar">
      <NetworkIndicator />
      <Menu>
        <Content>
          <VoteraProposalSelector
            proposalId={currentProposal?.proposalId}
            proposalTitle={currentProposal?.title}
            proposalType={
              currentProposal?.proposalType === ProposalType.FUND
                ? 'Fund'
                : 'System'
            }
            proposer={currentProposal?.proposer}
            onClick={props.onSelect}
          />
          <LinksWrapper>
            {breadcrumbs.length < MIN_ROUTE_DEPTH_FOR_BREADCRUMBS ? (
              <NavLinks />
            ) : (
              <>
                <NavlinksDropdown />
                <Breadcrumb
                  icon={icon}
                  crumbs={breadcrumbs}
                  onClick={(path: string) =>
                    navigate(generatePath(path, {network, id}))
                  }
                  tag={tag}
                />
              </>
            )}
          </LinksWrapper>
        </Content>

        <div className="flex gap-2 items-center">
          {!isExplorePage && (
            <LanguageButtonGroup>
              <LanguageButton
                active={i18n.language === 'en'}
                onClick={() => handleLanguageChange('en')}
              >
                English
              </LanguageButton>
              <LanguageButton
                active={i18n.language === 'ko'}
                onClick={() => handleLanguageChange('ko')}
              >
                한국어
              </LanguageButton>
            </LanguageButtonGroup>
          )}
          <ButtonWallet
            src={address}
            onClick={props.onWalletClick}
            isConnected={isConnected}
            label={isConnected ? address : t('navButtons.connectWallet')}
          />
        </div>
      </Menu>
    </Container>
  );
};

export default DesktopNav;

const Menu = styled.nav.attrs({
  className: `flex mx-auto justify-between items-center max-w-screen-wide
     px-5 wide:px-10 py-3`,
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 1) 0%,
    rgba(245, 247, 250, 0) 100%
  );
  backdrop-filter: blur(24px);
`;

const Content = styled.div.attrs({
  className: 'flex items-center space-x-6',
})``;

const LinksWrapper = styled.div.attrs({
  className: 'flex items-center space-x-1.5',
})``;

const LanguageButtonGroup = styled.div.attrs({
  className: 'flex gap-1 bg-ui-50 rounded-xl p-0.5',
})``;

const LanguageButton = styled.button.attrs({
  className: 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
})<{active: boolean}>`
  ${({active}) =>
    active
      ? 'background: white; color: #003da5; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);'
      : 'color: #9aa5b1; &:hover { color: #003da5; }'}
`;
