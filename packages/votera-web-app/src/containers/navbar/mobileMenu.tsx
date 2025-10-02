import {useReactiveVar} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import BottomSheet from 'components/bottomSheet';
import {VoteraProposalSelector} from 'components/voteraProposalSelector';
import NavLinks from 'components/navLinks';
import {selectedVoteraProposalVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {usePrivacyContext} from 'context/privacyContext';
import {ProposalType} from 'votera-sdk-client';
import {i18n, changeLanguage} from '../../../i18n.config';

const MobileNavMenu = () => {
  const currentProposal = useReactiveVar(selectedVoteraProposalVar);
  const {open, close, isMobileMenuOpen} = useGlobalModalContext();
  const {t} = useTranslation();

  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  return (
    <BottomSheet isOpen={isMobileMenuOpen} onClose={() => close('mobileMenu')}>
      <div className="tablet:w-50">
        <CardWrapper className="rounded-xl">
          <VoteraProposalSelector
            proposalId={currentProposal?.proposalId}
            proposalTitle={currentProposal?.title}
            proposalType={
              currentProposal?.proposalType === ProposalType.FUND
                ? 'Fund'
                : 'System'
            }
            proposer={currentProposal?.proposer}
            onClick={() => {
              close('mobileMenu');
              handleWithFunctionalPreferenceMenu(() => open('selectProposal'));
            }}
          />
        </CardWrapper>
        <div className="py-3 px-2 space-y-3">
          <NavLinks onItemClick={() => close('mobileMenu')} />
          <LanguageSection>
            <LanguageLabel>{t('settings.language') || 'Language'}</LanguageLabel>
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
          </LanguageSection>
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileNavMenu;

const CardWrapper = styled.div`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const LanguageSection = styled.div.attrs({
  className: 'px-2 py-3 space-y-2',
})``;

const LanguageLabel = styled.div.attrs({
  className: 'text-sm font-semibold text-ui-800',
})``;

const LanguageButtonGroup = styled.div.attrs({
  className: 'flex gap-2',
})``;

const LanguageButton = styled.button.attrs({
  className: 'flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all',
})<{active: boolean}>`
  ${({active}) =>
    active
      ? 'background: #003da5; color: white;'
      : 'background: #f5f7fa; color: #9aa5b1; &:hover { background: #e5e9ef; }'}
`;
