import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const SetupProposal: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
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
          title={t('labels.review.proposalSetup')}
          onEditClick={() => setStep(4)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.assessmentPeriod')}</Dt>
            <Dd>{assessmentPeriod}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.votePeriod')}</Dt>
            <Dd>{votePeriod}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.fundAmount')}</Dt>
            <Dd>{fundAmount} BOA</Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default SetupProposal; 