import React, {useEffect, useMemo} from 'react';
import {matchRoutes, useLocation} from 'react-router-dom';
import styled from 'styled-components';

import {ProcessType} from 'containers/exitProcessMenu';
import {selectedVoteraProposalVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useVoteraProposalDetailsQuery} from 'hooks/useVoteraProposalDetails';
import useScreen from 'hooks/useScreen';
import {CreateProposal, Landing} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import DesktopNav from './desktop';
import MobileNav from './mobile';
import {SupportedChainID} from '../../utils/constants';

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const {data: voteraProposalDetails} = useVoteraProposalDetailsQuery();

  const processInfo = useMemo(() => {
    const matches = matchRoutes(processPaths, pathname);
    if (matches) return getProcessInfo(matches[0].route.path) as ProcessInfo;
  }, [pathname]);

  // set current dao as selected dao
  useEffect(() => {
    if (voteraProposalDetails) {
      selectedVoteraProposalVar({
        proposalType: voteraProposalDetails.proposalType,
        title: voteraProposalDetails.title,
        description: voteraProposalDetails.description,
        proposer: voteraProposalDetails.proposer,
        proposalId: voteraProposalDetails.proposalId,
        fundAmount: voteraProposalDetails.fundAmount,
        documentId: voteraProposalDetails.documentId,
        beginAssess: voteraProposalDetails.beginAssess,
        endAssess: voteraProposalDetails.endAssess,
        beginVote: voteraProposalDetails.beginVote,
        endVote: voteraProposalDetails.endVote,
        systemType: voteraProposalDetails.systemType,
        assessmentResult: voteraProposalDetails.assessmentResult,
        voteResult: voteraProposalDetails.voteResult,
        chain: voteraProposalDetails.chain as SupportedChainID,
      });
    }
  }, [voteraProposalDetails, network]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleOnSelect = () => {
    handleWithFunctionalPreferenceMenu(() => open('selectProposal'));
  };

  const handleWalletButtonClick = () => {
    open('wallet');
  };

  const handleFeedbackButtonClick = () => {};

  if (isDesktop) {
    return (
      <DesktopNav
        isProcess={processInfo?.isProcess}
        returnURL={processInfo?.returnURL}
        processLabel={processInfo?.processLabel}
        processType={processInfo?.processType}
        onSelect={handleOnSelect}
        onWalletClick={handleWalletButtonClick}
      />
    );
  }
  return (
    <MobileNav
      isProcess={processInfo?.isProcess}
      onSelect={handleOnSelect}
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

export const processPaths = [{path: CreateProposal}];

export const processes: StringIndexed = {
  [CreateProposal]: {
    processLabel: i18n.t('createProposal.title'),
    returnURL: Landing,
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
    case CreateProposal:
      return 'DaoCreation';
  }
}
