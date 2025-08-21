import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconLinkExternal,
  ListItemDao,
} from 'votera-ui-components';
import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {useReactiveVar} from '@apollo/client';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {selectedVoteraProposalVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import useScreen from 'hooks/useScreen';

const ProposalSelectMenu: React.FC = () => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const currentVoteraProposal = useReactiveVar(selectedVoteraProposalVar);
  const {isSelectDaoOpen, close, open} = useGlobalModalContext();

  const handleBackButtonClick = useCallback(() => {
    close('selectDao');
    if (!isDesktop) open('mobileMenu');
  }, [close, isDesktop, open]);

  return (
    <ModalBottomSheetSwitcher
      isOpen={isSelectDaoOpen}
      onClose={() => close('selectDao')}
      onOpenAutoFocus={(e: any) => e.preventDefault()}
    >
      <div className="flex flex-col h-full" style={{maxHeight: '75vh'}}>
        <ModalHeader>
          <ButtonIcon
            css={{}}
            mode="secondary"
            size="small"
            bgWhite
            icon={<IconChevronLeft />}
            onClick={handleBackButtonClick}
          />
          <Title>{t('voteraSwitcher.title')}</Title>
          <div role="presentation" className="w-4 h-4" />
        </ModalHeader>
        <ModalContentContainer>
          <ListGroup>
            <ListItemDao
              selected
              proposalId={currentVoteraProposal?.address}
              proposalTitle={currentVoteraProposal?.title}
              onClick={() => close('selectDao')}
            />
          </ListGroup>
        </ModalContentContainer>
        <div className="p-3">
          <ButtonText
            css={{}}
            mode="secondary"
            size="large"
            label={t('voteraSwitcher.subtitle')}
            iconLeft={<IconLinkExternal />}
            className="w-full"
            onClick={() => {
              navigate('/');
              close('selectDao');
            }}
          />
        </div>
      </div>
    </ModalBottomSheetSwitcher>
  );
};

export default ProposalSelectMenu;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-center text-ui-800',
})``;

const ModalContentContainer = styled.div.attrs({
  className: 'p-3 pb-0 space-y-3 tablet:w-50 desktop:w-auto overflow-auto',
})``;

const ListGroup = styled.div.attrs({
  className: 'space-y-1.5',
})``;
