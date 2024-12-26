import {ButtonText} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {
  ModalBody,
  StyledImage,
  WarningContainer,
  WarningTitle,
} from 'containers/networkErrorMenu';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
// import {PluginTypes} from 'hooks/usePluginClient';
import WalletIcon from 'public/wallet.svg';
import {Governance, Dashboard} from 'utils/paths';
// import {
//   DaoDetails,
//   Erc20TokenDetails,
//   Erc20WrapperTokenDetails,
// } from '@aragon/sdk-client';
// import {toDisplayEns} from 'utils/library';
// import {useExistingToken} from 'hooks/useExistingToken';
import {htmlIn} from 'utils/htmlIn';
import {PluginTypes} from '../../utils/aragon/types';
import {WalletDetails} from 'multisig-wallet-sdk-client';
// import {useGovTokensWrapping} from 'context/govTokensWrapping';

const TokenContainer = ({tokenName}: {tokenName: string}) => {
  const {t} = useTranslation();

  return (
    <WarningContainer>
      <WarningTitle>{t('alert.gatingUsers.tokenTitle')}</WarningTitle>
      <WarningDescription>
        {t('alert.gatingUsers.tokenDescription', {tokenName})}
      </WarningDescription>
    </WarningContainer>
  );
};

const WrappingRequiredContainer = ({tokenSymbol}: {tokenSymbol: string}) => {
  const {t} = useTranslation();

  return (
    <WarningContainer>
      <WarningTitle>{t('modalAlert.wrapToken.title')}</WarningTitle>
      <WarningDescription>
        <span
          dangerouslySetInnerHTML={{
            __html: htmlIn(t)('modalAlert.wrapToken.desc', {
              tokenSymbol,
            }),
          }}
        />
      </WarningDescription>
    </WarningContainer>
  );
};

const WalletContainer = () => {
  const {t} = useTranslation();
  return (
    <WarningContainer>
      <WarningTitle>{t('alert.gatingUsers.walletTitle1')}</WarningTitle>
      <WarningDescription>
        {t('alert.gatingUsers.walletDescription1')}
      </WarningDescription>
    </WarningContainer>
  );
};

type Props = {
  // daoDetails: DaoDetails;
  daoDetails: WalletDetails;
  pluginType: PluginTypes;
  // daoToken?: Erc20TokenDetails | Erc20WrapperTokenDetails;
};

export const GatingMenu: React.FC<Props> = ({
  daoDetails,
  pluginType,
  // daoToken,
}) => {
  const {close, isGatingOpen} = useGlobalModalContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork(); // TODO ensure this network is the dao network
  // const {handleOpenModal} = useGovTokensWrapping();
  const handleOpenModal = () => {};

  // const {isDAOTokenWrapped} = useExistingToken({daoDetails, daoToken});

  const isTokenAbsenceAlert = pluginType === 'token-voting.plugin.dao.eth';

  return (
    <ModalBottomSheetSwitcher isOpen={isGatingOpen}>
      <ModalBody>
        <StyledImage src={WalletIcon} />
        {/*{pluginType === 'token-voting.plugin.dao.eth' ? (*/}
        {/*  <>*/}
        {/*    {isDAOTokenWrapped ? (*/}
        {/*      <WrappingRequiredContainer*/}
        {/*        tokenSymbol={*/}
        {/*          (daoToken as Erc20WrapperTokenDetails | undefined)*/}
        {/*            ?.underlyingToken?.symbol || ''*/}
        {/*        }*/}
        {/*      />*/}
        {/*    ) : (*/}
        {/*      <TokenContainer tokenName={daoToken?.name || ''} />*/}
        {/*    )}*/}
        {/*  </>*/}
        {/*) : (*/}
        {/*  <WalletContainer />*/}
        {/*)}*/}
        {/*<WalletContainer />*/}
        {/*{isTokenAbsenceAlert && isDAOTokenWrapped ? (*/}
        {/*  <div className="grid grid-cols-2 gap-3">*/}
        {/*    <ButtonText*/}
        {/*      label={t('modalAlert.wrapToken.ctaLabel')}*/}
        {/*      onClick={() => {*/}
        {/*        close('gating');*/}
        {/*        handleOpenModal();*/}
        {/*        navigate(*/}
        {/*          generatePath(Community, {*/}
        {/*            network,*/}
        {/*            dao:*/}
        {/*              toDisplayEns(daoDetails.ensDomain) || daoDetails.address,*/}
        {/*          })*/}
        {/*        );*/}
        {/*      }}*/}
        {/*      size="large"*/}
        {/*    />*/}
        {/*    <ButtonText*/}
        {/*      label={t('modalAlert.wrapToken.cancleLabel')}*/}
        {/*      mode="secondary"*/}
        {/*      onClick={() => {*/}
        {/*        navigate(*/}
        {/*          generatePath(Governance, {*/}
        {/*            network,*/}
        {/*            dao:*/}
        {/*              toDisplayEns(daoDetails.ensDomain) || daoDetails.address,*/}
        {/*          })*/}
        {/*        );*/}
        {/*        close('gating');*/}
        {/*      }}*/}
        {/*      size="large"*/}
        {/*    />*/}
        {/*  </div>*/}
        {/*) : (*/}
        {/*  <ButtonText*/}
        {/*    label={t('alert.gatingUsers.buttonLabel')}*/}
        {/*    onClick={() => {*/}
        {/*      navigate(*/}
        {/*        generatePath(Governance, {*/}
        {/*          network,*/}
        {/*          dao: toDisplayEns(daoDetails.ensDomain) || daoDetails.address,*/}
        {/*        })*/}
        {/*      );*/}
        {/*      close('gating');*/}
        {/*    }}*/}
        {/*    size="large"*/}
        {/*  />*/}
        {/*)}*/}
        <WalletContainer />
        <ButtonText
          css={{}}
          label={t('alert.gatingUsers.buttonLabel')}
          onClick={() => {
            navigate(
              generatePath(Dashboard, {
                network,
                dao: daoDetails.address,
              })
            );
            close('gating');
          }}
          size="large"
        />
      </ModalBody>
    </ModalBottomSheetSwitcher>
  );
};

const WarningDescription = styled.p.attrs({
  className: 'text-base text-ui-500 text-center',
})``;
