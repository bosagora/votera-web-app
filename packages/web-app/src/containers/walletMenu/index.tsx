import {
  Avatar,
  ButtonIcon,
  ButtonText,
  IconClose,
  IconCopy,
  IconSwitch,
  IconTurnOff,
} from '@aragon/ui-components';
import {useGlobalModalContext} from 'context/globalModals';
import React, {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useAlertContext} from 'context/alert';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA} from 'utils/constants';
import {handleClipboardActions, shortenAddress} from 'utils/library';
import {LoginRequired} from './LoginRequired';
import {changeLanguage} from '../../../i18n.config';

export const WalletMenu = () => {
  const {close, isWalletOpen} = useGlobalModalContext();
  const {address, methods, chainId, isConnected, network, status, provider} =
    useWallet();
  const {isDesktop} = useScreen();
  const {t, i18n} = useTranslation();
  const {alert} = useAlertContext();

  useEffect(() => {
    if (status === 'connected' && !isConnected)
      alert(t('alert.chip.walletConnected'));
  }, [alert, isConnected, status, t]);

  const handleDisconnect = () => {
    methods
      .disconnect()
      .then(() => {
        trackEvent('wallet_disconnected', {
          network,
          wallet_address: address,
          wallet_provider: provider?.connection.url,
        });
        localStorage.removeItem('WEB3_CONNECT_CACHED_PROVIDER');
        close('wallet');
        alert(t('alert.chip.walletDisconnected'));
      })
      .catch((e: Error) => {
        console.error(e);
      });
  };
  const handleViewTransactions = () => {
    // TODO
    // this redirects to the explorer the user selected in his
    // wallet but does not take into account the network in the
    // url, or the fact that the network of the wallet is different
    // from the one on the url, so this must be reviewed-
    const baseUrl = Object.entries(CHAIN_METADATA).filter(
      chain => chain[1].id === chainId
    )[0][1].explorer;
    window.open(baseUrl + '/address/' + address, '_blank');
  };

  const handleLanguageChange = (lang: string) => {
    changeLanguage(lang);
  };

  if (!isConnected) return <LoginRequired />;

  return (
    <ModalBottomSheetSwitcher
      onClose={() => close('wallet')}
      isOpen={isWalletOpen}
    >
      <ModalHeader>
        <AvatarAddressContainer>
          <Avatar src={address || ''} size="small" />
          <AddressContainer>
            <Title>{shortenAddress(address)}</Title>
          </AddressContainer>
        </AvatarAddressContainer>
        <ButtonIcon
          mode="secondary"
          icon={<IconCopy />}
          size="small"
          onClick={() =>
            address ? handleClipboardActions(address, () => null, alert) : null
          }
          css={{}}
        />
        {isDesktop && (
          <ButtonIcon
            mode="ghost"
            icon={<IconClose />}
            size="small"
            onClick={() => close('wallet')}
            css={{}}
          />
        )}
      </ModalHeader>
      <ModalBody>
        <LanguageButtonGroup>
          <StyledButtonText
            size="large"
            mode={i18n.language === 'en' ? 'primary' : 'secondary'}
            label="EN"
            onClick={() => handleLanguageChange('en')}
            className="justify-center text-center"
            css={{}}
          />
          <StyledButtonText
            size="large"
            mode={i18n.language === 'ko' ? 'primary' : 'secondary'}
            label="한국어"
            onClick={() => handleLanguageChange('ko')}
            className="justify-center text-center"
            css={{}}
          />
        </LanguageButtonGroup>
        <StyledButtonText
          size="large"
          mode="ghost"
          iconLeft={<IconSwitch />}
          label={t('labels.viewTransactions')}
          onClick={handleViewTransactions}
          css={{}}
        />
        <StyledButtonText
          size="large"
          mode="ghost"
          iconLeft={<IconTurnOff />}
          label={t('labels.disconnectWallet')}
          onClick={handleDisconnect}
          css={{}}
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const ModalHeader = styled.div.attrs({
  className: 'flex p-3 bg-ui-0 rounded-xl gap-2 sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;
const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-ui-800',
})``;
const SubTitle = styled.div.attrs({
  className: 'flex-1 font-medium text-ui-500 text-sm',
})``;
const AvatarAddressContainer = styled.div.attrs({
  className: 'flex flex-1 gap-1.5 items-center',
})``;
const AddressContainer = styled.div.attrs({
  className: 'flex flex-col',
})``;
const ModalBody = styled.div.attrs({
  className: 'flex flex-col p-3 gap-1.5',
})``;

const StyledButtonText = styled(ButtonText)`
  justify-content: flex-start;
  text-align: center;
`;

const LanguageButtonGroup = styled.div.attrs({
  className: 'flex items-center gap-1.5 mb-1.5',
})`
  button {
    flex: 1;
    min-width: 50px;
    height: 40px;
    border-radius: 8px;
  }
`;
