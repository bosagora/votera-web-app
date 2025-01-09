import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';
import { ProposalType } from 'votera-sdk-client';

const SetupProposal: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    proposalType,
    assessmentPeriod, 
    votePeriod, 
    fundAmount,
    reviewCheckError
  } = getValues();

  return (
    <Controller
      name="reviewCheck.proposalSetup"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.proposalSetup'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.setupProposal')}
          onEditClick={() => setStep(4)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          {proposalType === ProposalType.FUND && (
            <Dl>
              <Dt>{t('labels.assessmentPeriod')}</Dt>
              <Dd>{assessmentPeriod} days ({new Date().toISOString().slice(0,10)} ~ {new Date(Date.now() + assessmentPeriod * 24 * 60 * 60 * 1000).toISOString().slice(0,10)})</Dd>
            </Dl>
          )}
          <Dl>
            <Dt>{t('labels.votePeriod')}</Dt>
            <Dd>{votePeriod} days ({new Date(Date.now() + assessmentPeriod * 24 * 60 * 60 * 1000).toISOString().slice(0,10)} ~ {new Date(Date.now() + (assessmentPeriod + votePeriod) * 24 * 60 * 60 * 1000).toISOString().slice(0,10)})</Dd>
          </Dl>
          {proposalType === ProposalType.FUND && (
            <Dl>
              <Dt>{t('labels.fundAmount')}</Dt>
              <Dd>{typeof fundAmount === 'object' && 'toString' in fundAmount ? fundAmount.toString() : fundAmount} BOA</Dd>
            </Dl>
          )}
        </DescriptionListContainer>
      )}
    />
  );
};

export default SetupProposal; 