import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';

const Governance: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {
    reviewCheckError,
    multisigMinimumApprovals,
    multisigWallets,
    isCustomToken,
    tokenType,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.governance"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.votingParameters')}
          onEditClick={() => setStep(5)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>
              {multisigMinimumApprovals}&nbsp;
              {t('labels.review.multisigMinimumApprovals', {
                count: multisigWallets.length,
              })}
            </Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default Governance;
