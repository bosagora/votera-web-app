import React from 'react';
import styled from 'styled-components';
import {ButtonWallet} from 'votera-ui-components';
import {useTranslation} from 'react-i18next';

import {useWallet} from 'hooks/useWallet';
import Logo from 'public/logo.svg';
import {useGlobalModalContext} from 'context/globalModals';
import {Container, GridLayout} from 'components/layout';
import {i18n, changeLanguage} from '../../../i18n.config';

const ExploreNav: React.FC = () => {
  const {t} = useTranslation();
  const {address, isConnected, methods} = useWallet();
  const {open} = useGlobalModalContext();
  const path = t('logo.linkURL');

  const handleWalletButtonClick = () => {
    if (isConnected) {
      open('wallet');
      return;
    }
    methods.selectWallet().catch((err: Error) => {
      // To be implemented: maybe add an error message when
      // the error is different from closing the window
      console.error(err);
    });
  };

  return (
    <Container data-testid="navbar">
      <Menu>
        <GridLayout>
          <LeftContent>
            <LogoContainer
              src={Logo}
              // onClick={() => window.open(path, '_blank')}
            />
          </LeftContent>
          <RightContent>
            <ActionsWrapper>
              <LanguageButtonGroup>
                <LanguageButton
                  active={i18n.language === 'en'}
                  onClick={() => changeLanguage('en')}
                >
                  English
                </LanguageButton>
                <LanguageButton
                  active={i18n.language === 'ko'}
                  onClick={() => changeLanguage('ko')}
                >
                  한국어
                </LanguageButton>
              </LanguageButtonGroup>
              <ButtonWallet
                src={address}
                onClick={handleWalletButtonClick}
                isConnected={isConnected}
                label={isConnected ? address : t('navButtons.connectWallet')}
              />
            </ActionsWrapper>
          </RightContent>
        </GridLayout>
      </Menu>
    </Container>
  );
};

const Menu = styled.nav.attrs({
  className: 'py-2 desktop:py-3',
})`
  background: linear-gradient(180deg, #3164fa 0%, rgba(49, 100, 250, 0) 100%);
`;

const LeftContent = styled.div.attrs({
  className: 'col-span-3 tablet:col-span-2 flex items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-4 cursor-pointer',
})``;

const RightContent = styled.div.attrs({
  className:
    'col-start-9 col-span-4 flex flex-row-reverse justify-between items-center',
})``;

const ActionsWrapper = styled.div.attrs({
  className: 'flex space-x-3 items-center',
})``;

const LanguageButtonGroup = styled.div.attrs({
  className: 'flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl p-0.5',
})``;

const LanguageButton = styled.button.attrs({
  className: 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
})<{active: boolean}>`
  ${({active}) =>
    active
      ? 'background: white; color: #3164fa; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);'
      : 'color: white; &:hover { background: rgba(255, 255, 255, 0.1); }'}
`;

export default ExploreNav;
