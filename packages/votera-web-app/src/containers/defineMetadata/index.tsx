import {
  AlertInline,
  ButtonText,
  Label,
  TextareaSimple,
  TextInput,
} from 'votera-ui-components';
import React, {useCallback, useState} from 'react';
import {Controller, FieldError, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {isOnlyWhitespace} from 'utils/library';
import {ProposalType} from 'pages/createProposal';
import useScreen from 'hooks/useScreen';
import {useFileUpload} from 'hooks/useFileUpload';
import {InputPdfSingle} from 'components/uploadFile';
export type DefineMetadataProps = {
  arrayName?: string;
  isSettingPage?: boolean;
  bgWhite?: boolean;
};

const DefineMetadata: React.FC<DefineMetadataProps> = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const {control} = useFormContext();
  const [proposalType, setProposalType] = useState<ProposalType>(
    ProposalType.FUND
  );
  const formMethods = useFormContext();

  const {uploadFile, isUploading} = useFileUpload();

  const handleFileUpload = async (file: File) => {
    try {
      const cid = await uploadFile(file);
      console.log('File uploaded with CID:', cid);
      formMethods.setValue('documentId', cid);
      // CID를 폼 상태에 저장하거나 다른 처리
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <>
      {/* Proposal Type */}
      <FormItem>
        <Label
          label={t('labels.proposalType')}
          helpText={t('createProposal.step2.proposalType')}
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
                  css={{}}
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
                  css={{}}
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
          helpText={t('createProposal.step2.metaTitle')}
        />

        <Controller
          name="title"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.title'),
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                {...{name, value, onBlur, onChange}}
                placeholder={t('placeHolders.proposalTitle')}
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
          helpText={t('createProposal.step2.descriptionSubtitle')}
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
                placeholder={t('placeHolders.description')}
              />
              <InputCount>{`${field.value.length}/1024`}</InputCount>
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Upload Document */}
      <FormItem>
        <Label
          label={t('labels.uploadDocument')}
          helpText={t('createProposal.step2.documentSubtitle')}
        />
        <Controller
          name="documentId"
          control={control}
          render={({field: {onChange}, fieldState: {error}}) => (
            <InputPdfSingle
              onChange={async (file: File | null) => {
                if (file) {
                  await handleFileUpload(file);
                  formMethods.setValue('file', file);
                } else {
                  formMethods.setValue('file', null);
                  formMethods.setValue('documentId', '');
                }
              }}
              onError={error => {
                console.error(error);
                alert('Please provide a PDF file');
              }}
            />
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

const StyledButtonText = styled(ButtonText).attrs(
  ({isActive}: {isActive: boolean}) => ({
    className: `flex-1 ${
      isActive ? 'bg-primary-400 text-ui-0' : 'text-ui-600'
    }`,
  })
)`
  &:hover {
    ${({isActive}) => !isActive && 'background-color: rgba(71, 123, 238, 0.1);'}
  }
`;
