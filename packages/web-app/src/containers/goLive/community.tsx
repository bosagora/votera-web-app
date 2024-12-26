import {Link} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';
import CommunityAddressesModal from 'containers/communityAddressesModal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';

const Community: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {multisigWallets, reviewCheckError} = getValues();

  return (
    <Controller
      name="reviewCheck.community"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.voters')}
          onEditClick={() => setStep(4)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dd>{t('labels.multisigMembers')}</Dd>
          </Dl>

          <Dl>
            <Dt>{t('labels.review.distribution')}</Dt>
            <Dd>
              <Link
                label={t('labels.review.distributionLink', {
                  walletCount: multisigWallets.length,
                })}
                onClick={() => open('addresses')}
              />
            </Dd>
          </Dl>

          <CommunityAddressesModal tokenMembership={false} />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Community;
