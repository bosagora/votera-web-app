import React, {useEffect, useMemo} from 'react';
import {matchRoutes, useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {ProcessType} from 'containers/exitProcessMenu';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, FEEDBACK_FORM, SupportedChainID} from 'utils/constants';
import {
  Community,
  CreateDAO,
  EditSettings,
  Finance,
  Governance,
  Landing,
  ManageMembersProposal,
  MintTokensProposal,
  NewDeposit,
  NewProposal,
  NewWithDraw,
  ProposeNewSettings,
  Dashboard
} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import DesktopNav from './desktop';
import MobileNav from './mobile';

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const {data: walletDetails} = useDaoDetailsQuery();

  const processInfo = useMemo(() => {
    const matches = matchRoutes(processPaths, pathname);
    //console.log('Navbar processPaths', processPaths);
    //console.log('Navbar pathname', pathname);
    //console.log('Navbar matches', matches);
    if (matches) return getProcessInfo(matches[0].route.path) as ProcessInfo;
  }, [pathname]);

  // set current dao as selected dao
  useEffect(() => {
    if (walletDetails) {
      selectedDaoVar({
        address: walletDetails.address,
        metadata: {
          name: walletDetails.metadata.name,
          description: walletDetails.metadata.description,
        },
        chain: walletDetails.chain as SupportedChainID,
        creationDate: walletDetails.creationDate,
      });
    }
  }, [walletDetails, network]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleOnDaoSelect = () => {
    handleWithFunctionalPreferenceMenu(() => open('selectDao'));
  };

  const handleWalletButtonClick = () => {
    open('wallet');
  };

  const handleFeedbackButtonClick = () => {
    window.open(FEEDBACK_FORM, '_blank');
  };

  //console.log('Navbar isDesktop', isDesktop);
  //console.log('Navbar processInfo', processInfo);
  if (isDesktop) {
    return (
      <DesktopNav
        isProcess={processInfo?.isProcess}
        returnURL={processInfo?.returnURL}
        processLabel={processInfo?.processLabel}
        processType={processInfo?.processType}
        onDaoSelect={handleOnDaoSelect}
        onWalletClick={handleWalletButtonClick}
      />
    );
  }
  return (
    <MobileNav
      isProcess={processInfo?.isProcess}
      onDaoSelect={handleOnDaoSelect}
      onWalletClick={handleWalletButtonClick}
    />
  );
};

export default Navbar;

export const NavigationBar = styled.nav.attrs({
  className: `flex tablet:order-1 h-12 justify-between items-center px-2 pb-2 pt-1.5
    tablet:py-2 tablet:px-3 desktop:py-3 desktop:px-5 wide:px-25 text-ui-600`,
})``;

/* PROCESS ================================================================= */
type StringIndexed = {[key: string]: {processLabel: string; returnURL: string}};

export const processPaths = [
  {path: NewDeposit},
  {path: NewWithDraw},
  {path: CreateDAO},
  {path: NewProposal},
  {path: ProposeNewSettings},
  {path: MintTokensProposal},
  {path: ManageMembersProposal},
];

export const processes: StringIndexed = {
  [CreateDAO]: {processLabel: i18n.t('createDAO.title'), returnURL: Landing},
  [NewDeposit]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewWithDraw]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewProposal]: {
    processLabel: i18n.t('newProposal.title'),
    returnURL: Dashboard,
  },
  [ProposeNewSettings]: {
    processLabel: i18n.t('settings.proposeSettings'),
    returnURL: EditSettings,
  },
  [MintTokensProposal]: {
    processLabel: i18n.t('labels.addMember'),
    returnURL: Community,
  },
  [ManageMembersProposal]: {
    processLabel: i18n.t('labels.manageMember'),
    returnURL: Community,
  },
};

type ProcessInfo = {
  isProcess: boolean;
  processLabel: string | undefined;
  returnURL: string | undefined;
  processType: 'DaoCreation' | 'ProposalCreation' | undefined;
  processName: string | undefined;
};

function getProcessInfo(
  processPath: string | undefined
): ProcessInfo | undefined {
  if (processPath) {
    return {
      isProcess: true,
      ...processes[processPath],
      processName: processPath,
      processType: getExitProcessType(processPath),
    };
  }
}

function getExitProcessType(processPath: string): ProcessType | undefined {
  switch (processPath) {
    case CreateDAO:
      return 'DaoCreation';

    case ManageMembersProposal:
    case MintTokensProposal:
    case NewProposal:
    case NewWithDraw:
    case ProposeNewSettings:
      return 'ProposalCreation';
  }
}
