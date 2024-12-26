import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const DaoMetadata: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {daoName, daoSummary, reviewCheckError} = getValues();

  return (
    <Controller
      name="reviewCheck.daoMetadata"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.daoMetadata')}
          onEditClick={() => setStep(3)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.daoName')}</Dt>
            <Dd>{daoName}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{daoSummary}</Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default DaoMetadata;
