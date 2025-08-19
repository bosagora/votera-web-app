import {Breadcrumb, ButtonWallet} from 'votera-ui-components';
import React, {useCallback, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {
  generatePath,
  useNavigate,
  useParams,
  useLocation,
} from 'react-router-dom';
import styled from 'styled-components';

import {Container} from 'components/layout';
import ExitProcessMenu, {ProcessType} from 'containers/exitProcessMenu';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import NetworkIndicator from './networkIndicator';
import VoteraLogo from 'public/votera_color_logo.png';
import {Landing} from 'utils/paths';
import {changeLanguage} from '../../../i18n.config';

type DesktopNavProp = {
  isProcess?: boolean;
  returnURL?: string;
  processType?: ProcessType;
  processLabel?: string;
  onDaoSelect: () => void;
  onWalletClick: () => void;
};

const DesktopNav: React.FC<DesktopNavProp> = props => {
  const {t, i18n} = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {network} = useNetwork();
  const {id} = useParams();
  const {address, isConnected} = useWallet();

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
          {/* <DaoSelector
            proposalId={currentDao.address}
            proposalTitle={currentDao?.metadata.name}
            src={currentDao.address}
            onClick={props.onDaoSelect}
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
                    navigate(generatePath(path, {network, dao}))
                  }
                  tag={tag}
                />
              </>
            )}
          </LinksWrapper> */}
          <img
            src={VoteraLogo}
            alt="Votera 로고"
            className="h-4"
            onClick={() => navigate(Landing)}
          />
          {location.pathname.includes('proposal') && (
            <div className="flex gap-3 items-center">
              <div
                className="font-bold text-primary-500 cursor-pointer ft-text-lg"
                onClick={() => navigate(Landing)}
              >
                {'< Dashboard'}
              </div>
            </div>
          )}
        </Content>

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
