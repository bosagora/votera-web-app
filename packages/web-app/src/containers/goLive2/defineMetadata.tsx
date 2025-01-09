import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';
import {DescriptionListContainer, Dl, Dt, Dd} from 'components/descriptionList';

const DefineMetadata: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {title, description, file, reviewCheckError} = getValues();

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
          title={t('labels.review.proposalMetadata')}
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
            <Dd>{title}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.summary')}</Dt>
            <Dd>{description}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.uploadDocument')}</Dt>
            <Dd>
              {file?.name ? (
                file.name.length > 20 ? 
                  file.name.substring(0, 20 - file.name.split('.').pop()!.length) + 
                  '...' + 
                  '.' + 
                  file.name.split('.').pop() 
                : file.name
              ) : ''}
            </Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default DefineMetadata;
