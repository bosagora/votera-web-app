import {
  AlertInline,
  InputImageSingle,
  Label,
  TextareaSimple,
  TextInput,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {Controller, FieldError, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddLinks from 'components/addLinks';
import {URL_PATTERN} from 'utils/constants';
import {isOnlyWhitespace} from 'utils/library';
import {isDaoEnsNameValid} from 'utils/validators';
import {useProviders} from 'context/providers';
import {useNetwork} from 'context/network';

export type DefineMetadataProps = {
  arrayName?: string;
  isSettingPage?: boolean;
  bgWhite?: boolean;
};

const DefineMetadata: React.FC<DefineMetadataProps> = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  return (
    <>
      {/* Name */}
      <FormItem>
        <Label
          label={t('labels.daoName')}
          helpText={t('createDAO.step2.nameSubtitle')}
        />

        <Controller
          name="daoName"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.name'),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                {...{name, value, onBlur, onChange}}
                placeholder={t('placeHolders.daoName')}
              />
              <InputCount>{`${value.length}/128`}</InputCount>
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Summary */}
      <FormItem>
        <Label
          label={t('labels.description')}
          helpText={t('createDAO.step2.descriptionSubtitle')}
        />
        <Controller
          name="daoSummary"
          rules={{
            required: t('errors.required.summary'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.summary') : true,
          }}
          control={control}
          render={({field, fieldState: {error}}) => (
            <>
              <TextareaSimple
                {...field}
                placeholder={t('placeHolders.daoDescription')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default DefineMetadata;

const InputCount = styled.div.attrs({
  className: 'ft-text-sm mt-1',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
