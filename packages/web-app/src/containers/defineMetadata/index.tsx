import {
  AlertInline,
  ButtonGroup,
  ButtonText,
  DropdownInput,
  InputImageSingle,
  Label,
  TextareaSimple,
  TextInput,

} from '@aragon/ui-components';
import React, {useCallback, useState} from 'react';
import {Controller, FieldError, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddLinks from 'components/addLinks';
import {URL_PATTERN} from 'utils/constants';
import {isOnlyWhitespace} from 'utils/library';
import {isDaoEnsNameValid} from 'utils/validators';
import {useProviders} from 'context/providers';
import {useNetwork} from 'context/network';
import { ProposalType } from 'pages/createProposal';
import useScreen from 'hooks/useScreen';
export type DefineMetadataProps = {
  arrayName?: string;
  isSettingPage?: boolean;
  bgWhite?: boolean;
};

const DefineMetadata: React.FC<DefineMetadataProps> = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const {control} = useFormContext();
  const [proposalType, setProposalType] = useState<ProposalType>(ProposalType.FUND);
  const formMethods = useFormContext();
  return (
    <>
      {/* Proposal Type */}
      <FormItem>
        <Label
          label={t('labels.proposalType')}
          helpText={t('createDAO2.step2.nameSubtitle')}
        />
        <Controller
          name="proposalType"
          control={control}
          defaultValue={ProposalType.FUND}
          rules={{
            required: t('errors.required.proposalType'),
          }}
          render={({field, fieldState: {error}}) => (
            <>
              <ProposalTypeSwitcher>
                <StyledButtonText
                  mode="ghost"
                  bgWhite
                  size={isMobile ? 'small' : 'medium'}
                  label={t('labels.fund')}
                  isActive={proposalType === ProposalType.FUND}
                  onClick={() => {
                    setProposalType(ProposalType.FUND);
                    formMethods.setValue('proposalType', ProposalType.FUND);
                  }}
                />
                <StyledButtonText
                  mode="ghost"
                  bgWhite
                  size={isMobile ? 'small' : 'medium'}
                  label={t('labels.system')}
                  isActive={proposalType === ProposalType.SYSTEM}
                  onClick={() => {
                    setProposalType(ProposalType.SYSTEM);
                    formMethods.setValue('proposalType', ProposalType.SYSTEM);
                  }}
                />
              </ProposalTypeSwitcher>
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Title */}
      <FormItem>
        <Label
          label={t('labels.title')}
          helpText={t('createDAO2.step2.nameSubtitle')}
        />

        <Controller
          name="title"
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

      {/* Description */}
      <FormItem>
        <Label
          label={t('labels.description')}
          helpText={t('createDAO2.step2.descriptionSubtitle')}
        />
        <Controller
          name="description"
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

      {/* Upload Document */}
      <FormItem>
        <Label label={t('labels.document')} />
        <InputImageSingle 
          onChange={() => {}}
          onError={() => {}}
        />
      <Controller
        name="document"
        control={control}
        render={({field: {value, onChange}}) => (
          <div className="flex flex-col gap-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange(file);
                }
              }}
              className="block w-full text-sm text-ui-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-500
                hover:file:bg-primary-100"
            />
            {value && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-ui-600">{value.name}</span>
                <button
                  onClick={() => onChange(null)}
                  className="text-ui-500 hover:text-ui-600"
                >
                  {t('labels.clear')}
                </button>
              </div>
            )}
          </div>
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

const Option = styled(ButtonText).attrs({
  className: 'bg-ui-0 text-ui-600',
})``;

const ProposalTypeSwitcher = styled.div.attrs({
  className: 'flex w-full gap-x-2 p-1 bg-ui-0 rounded-xl',
})``;

const StyledButtonText = styled(ButtonText).attrs(({isActive}: {isActive: boolean}) => ({
  className: `flex-1 ${
    isActive 
      ? 'bg-primary-400 text-ui-0'
      : 'text-ui-600'
  }`,
}))`
  &:hover {
    ${({isActive}) => !isActive && 'background-color: rgba(71, 123, 238, 0.1);'}
  }
`;