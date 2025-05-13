import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {Breadcrumb, ButtonText, IconChevronRight} from '@aragon/ui-components';
import {useNavigate} from 'react-router-dom';

import SelectChain from './selectChain';
import DefineMetadata from './defineMetadata';
import SetupProposal from './setupProposal';
import goLive from 'public/goLive.svg';
import {Landing} from 'utils/paths';
import {useCreateProposalContext} from 'context/createProposal';
import {useWallet} from 'hooks/useWallet';
import {useGlobalModalContext} from 'context/globalModals';
import {useFormContext} from 'react-hook-form';

export const GoLiveHeader: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const clickHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="tablet:p-3 desktop:p-6 px-2 pt-2 desktop:pt-3 pb-3 bg-ui-0 tablet:rounded-xl">
      <div className="desktop:hidden">
        <Breadcrumb
          crumbs={{label: t('createDAO.title'), path: Landing}}
          onClick={clickHandler}
        />
      </div>
      <div className="flex justify-between">
        <div className="pt-3 w-full">
          <h1 className="text-3xl font-bold text-ui-800">
            {t('createDAO2.deploy.title')}
          </h1>
          <p className="mt-2 text-lg text-ui-600">
            {t('createDAO2.deploy.description')}
          </p>
        </div>
        <ImageContainer src={goLive} />
      </div>
    </div>
  );
};

const GoLive: React.FC = () => {
  return (
    <Container>
      <SelectChain />
      <DefineMetadata />
      <SetupProposal />
    </Container>
  );
};

export const GoLiveFooter: React.FC = () => {
  const {watch, setValue, getValues} = useFormContext();
  const {reviewCheck} = watch();
  const {t} = useTranslation();
  const {handlePublishProposal} = useCreateProposalContext();
  const {open} = useGlobalModalContext();
  const {isConnected, isOnWrongNetwork} = useWallet();

  const IsButtonDisabled = () =>
    !Object.values(reviewCheck).every(v => v === true);

  const publishDao = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      } else {
        handlePublishProposal();
      }
    } else {
      open('wallet');
    }
  };

  const showInvalidFields = () => {
    if (IsButtonDisabled()) {
      setValue('reviewCheckError', true);
    }
  };

  return (
    <div className="flex justify-center pt-3">
      <div onClick={showInvalidFields}>
        <ButtonText
          css={{}}
          size="large"
          iconRight={<IconChevronRight />}
          label={t('createDAO2.deploy.title')}
          onClick={publishDao}
          disabled={IsButtonDisabled()}
        />
      </div>
    </div>
  );
};

export default GoLive;

const Container = styled.div.attrs({
  className: 'tablet:mx-auto tablet:w-3/4 space-y-5',
})``;

const ImageContainer = styled.img.attrs({
  className: 'w-25 hidden tablet:block',
})``;
