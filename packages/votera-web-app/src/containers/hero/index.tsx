import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {GridLayout} from 'components/layout';
import {useNetwork} from 'context/network';
import {useSwitchNetwork} from 'hooks/useSwitchNetwork';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from 'context/globalModals';
import {i18n, changeLanguage} from '../../../i18n.config';

function Hero() {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {switchWalletNetwork} = useSwitchNetwork();
  const {isConnected} = useWallet();
  const {open} = useGlobalModalContext();

  const handleChainChange = async (
    chainKey: 'bosagora_mainnet' | 'bosagora_testnet'
  ) => {
    if (!isConnected) {
      open('wallet');
      return;
    }
    await switchWalletNetwork(chainKey);
  };

  return (
    <Container>
      <GridLayout>
        <Wrapper>
          <ContentWrapper>
            <Title>{t('explore.hero.title')}</Title>
            <Subtitle>{t('explore.hero.subtitle1')}</Subtitle>
            <Subtitle>{t('explore.hero.subtitle2')}</Subtitle>
            <Subtitle>{t('explore.hero.subtitle3')}</Subtitle>
          </ContentWrapper>
          <ChainSelectorWrapper>
            <ChainButtonGroup>
              <ChainButton
                active={network === 'bosagora_mainnet'}
                onClick={() => handleChainChange('bosagora_mainnet')}
              >
                Mainnet
              </ChainButton>
              <ChainButton
                active={network === 'bosagora_testnet'}
                onClick={() => handleChainChange('bosagora_testnet')}
              >
                Testnet
              </ChainButton>
            </ChainButtonGroup>
          </ChainSelectorWrapper>
          <LanguageSelectorWrapper>
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
          </LanguageSelectorWrapper>
        </Wrapper>
      </GridLayout>
    </Container>
  );
}

// NOTE: "h-56 -mt-10 pt-10" is the "simplest" way to achieve a sticky header
// with a gradient AND a primary 400 background. What it does it is extends the
// hero by a height of 12, moves it up using the negative margin and compensates
// by lowering the content using the padding-top. Same with factor 12 on
// desktop.
const Container = styled.div.attrs({
  className:
    'bg-primary-400 h-56 -mt-10 pt-10  desktop:h-62 desktop:pt-12 desktop:-mt-12 overflow-hidden',
})``;

const Wrapper = styled.div.attrs({
  className:
    'flex justify-center desktop:justify-between col-span-full desktop:col-start-2 desktop:col-end-12 relative',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'desktop:space-y-0.95 space-y-1 pt-4.5 desktop:pt-2',
})``;

const Title = styled.h1.attrs({
  className:
    'text-ui-0 font-bold ft-text-5xl desktop:text-left text-center desktop:leading-7.5 leading-4.5',
})`
  // font-family: Syne;
  letter-spacing: -0.03em;
`;

const Subtitle = styled.h3.attrs({
  className:
    'text-ui-0 ft-text-lg font-normal text-center desktop:text-left leading-3 desktop:leading-3.75',
})``;

const ImageWrapper = styled.div.attrs({
  className: 'h-full',
})``;

const StyledImage = styled.img.attrs({
  className: 'w-71 hidden desktop:block',
})``;

const GradientContainer = styled.div.attrs({
  className: 'absolute top-64 desktop:top-20 right-0 w-71',
})``;

const GradientWrapper = styled.div.attrs({
  className: 'relative w-full h-full',
})``;

const GradientGreen = styled.img.attrs({
  className: 'h-40 absolute desktop:-left-14 desktop:-top-20 -top-19 left-14',
})``;

const GradientPurple = styled.img.attrs({
  className:
    'desktop:h-40 h-30 absolute desktop:-right-20 desktop:top-5 -right-5 -top-6',
})``;

const ChainSelectorWrapper = styled.div.attrs({
  className: 'absolute top-1 right-52 desktop:top-1 desktop:right-60',
})``;

const ChainButtonGroup = styled.div.attrs({
  className: 'flex gap-0.5 bg-white/10 backdrop-blur-sm rounded-xl p-1',
})``;

const ChainButton = styled.button.attrs({
  className:
    'px-2 py-1 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
})<{active: boolean}>`
  ${({active}) =>
    active
      ? 'background: white; color: #3164fa; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);'
      : 'color: white; &:hover { background: rgba(255, 255, 255, 0.1); }'}
`;

const LanguageSelectorWrapper = styled.div.attrs({
  className: 'absolute top-1 right-4 desktop:top-1 desktop:right-6',
})``;

const LanguageButtonGroup = styled.div.attrs({
  className: 'flex gap-0.5 bg-white/10 backdrop-blur-sm rounded-xl p-1',
})``;

const LanguageButton = styled.button.attrs({
  className: 'px-2 py-1 rounded-lg text-sm font-medium transition-all',
})<{active: boolean}>`
  ${({active}) =>
    active
      ? 'background: white; color: #3164fa; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);'
      : 'color: white; &:hover { background: rgba(255, 255, 255, 0.1); }'}
`;

export default Hero;
