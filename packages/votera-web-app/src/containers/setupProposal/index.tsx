import {AlertInline, Label, ValueInput} from 'votera-ui-components';
import React, {useEffect, useState} from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import IncreaseAmount from 'components/increaseAmount';
import {ProposalType} from 'pages/createProposal';
import {useNetwork} from 'context/network';

export type SetupProposalProps = {
  arrayName?: string;
  isSettingPage?: boolean;
  bgWhite?: boolean;
};

type PeriodData = {
  default: number;
  min: number;
  max: number;
};

const SetupProposal: React.FC<SetupProposalProps> = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  const proposalType = useWatch({
    control,
    name: 'proposalType',
  });

  const blockchain = useWatch({
    control,
    name: 'blockchain',
  });

  return (
    <>
      {proposalType === ProposalType.FUND &&
        blockchain.label === 'bosagora_devnet' && (
          <FormItem>
            <Label
              label={t('labels.assessmentPeriod')}
              helpText={t('createProposal.step3.assessmentPeriodDesc_DevNet')}
            />
            <Controller
              name="assessmentPeriod"
              control={control}
              rules={{
                required: t('errors.required.name'),
                min: {
                  value: 0,
                  message: t('errors.required.minValue'),
                },
              }}
              render={({
                field: {onBlur, onChange, value, name},
                fieldState: {error},
              }) => (
                <>
                  <IncreaseAmount
                    {...{name, value, onBlur}}
                    onChange={onChange}
                    placeholder={''}
                    defaultValue={1}
                    min={1}
                    max={100}
                    label={''}
                  />
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                </>
              )}
            />
          </FormItem>
        )}
      {proposalType === ProposalType.FUND &&
        blockchain.label === 'bosagora_testnet' && (
          <FormItem>
            <Label
              label={t('labels.assessmentPeriod')}
              helpText={t('createProposal.step3.assessmentPeriodDesc_TestNet')}
            />
            <Controller
              name="assessmentPeriod"
              control={control}
              rules={{
                required: t('errors.required.name'),
                min: {
                  value: 0,
                  message: t('errors.required.minValue'),
                },
              }}
              render={({
                field: {onBlur, onChange, value, name},
                fieldState: {error},
              }) => (
                <>
                  <IncreaseAmount
                    {...{name, value, onBlur}}
                    onChange={onChange}
                    placeholder={''}
                    defaultValue={1}
                    min={1}
                    max={14}
                    label={''}
                  />
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                </>
              )}
            />
          </FormItem>
        )}
      {proposalType === ProposalType.FUND &&
        blockchain.label === 'bosagora_mainnet' && (
          <FormItem>
            <Label
              label={t('labels.assessmentPeriod')}
              helpText={t('createProposal.step3.assessmentPeriodDesc_MainNet')}
            />
            <Controller
              name="assessmentPeriod"
              control={control}
              rules={{
                required: t('errors.required.name'),
                min: {
                  value: 0,
                  message: t('errors.required.minValue'),
                },
              }}
              render={({
                field: {onBlur, onChange, value, name},
                fieldState: {error},
              }) => (
                <>
                  <IncreaseAmount
                    {...{name, value, onBlur}}
                    onChange={onChange}
                    placeholder={''}
                    defaultValue={7}
                    min={7}
                    max={14}
                    label={''}
                  />
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                </>
              )}
            />
          </FormItem>
        )}

      {blockchain.label === 'bosagora_devnet' && (
        <FormItem>
          <Label
            label={t('labels.votePeriod')}
            helpText={t('createProposal.step3.votePeriodDesc_DevNet')}
          />
          <Controller
            name="votePeriod"
            control={control}
            rules={{
              required: t('errors.required.name'),
              min: {value: 0, message: t('errors.required.minValue')},
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <>
                <IncreaseAmount
                  {...{name, value, onBlur}}
                  onChange={onChange}
                  placeholder={''}
                  defaultValue={1}
                  min={1}
                  max={100}
                  label={''}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}
      {blockchain.label === 'bosagora_testnet' && (
        <FormItem>
          <Label
            label={t('labels.votePeriod')}
            helpText={t('createProposal.step3.votePeriodDesc_TestNet')}
          />
          <Controller
            name="votePeriod"
            control={control}
            rules={{
              required: t('errors.required.name'),
              min: {value: 0, message: t('errors.required.minValue')},
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <>
                <IncreaseAmount
                  {...{name, value, onBlur}}
                  onChange={onChange}
                  placeholder={''}
                  defaultValue={1}
                  min={1}
                  max={28}
                  label={''}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}
      {blockchain.label === 'bosagora_mainnet' && (
        <FormItem>
          <Label
            label={t('labels.votePeriod')}
            helpText={t('createProposal.step3.votePeriodDesc_MainNet')}
          />
          <Controller
            name="votePeriod"
            control={control}
            rules={{
              required: t('errors.required.name'),
              min: {value: 0, message: t('errors.required.minValue')},
            }}
            render={({
              field: {onBlur, onChange, value, name},
              fieldState: {error},
            }) => (
              <>
                <IncreaseAmount
                  {...{name, value, onBlur}}
                  onChange={onChange}
                  placeholder={''}
                  defaultValue={14}
                  min={14}
                  max={28}
                  label={''}
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}
      {proposalType === ProposalType.FUND && (
        <FormItem>
          <Label
            label={t('labels.fundAmount')}
            helpText={t('newWithdraw.configureWithdraw.amountSubtitle')}
          />
          <Controller
            name="fundAmount"
            control={control}
            defaultValue={0}
            rules={{
              required: t('errors.required.amount'),
            }}
            render={({
              field: {name, onBlur, onChange, value},
              fieldState: {error},
            }) => (
              <>
                <StyledInput
                  mode={error ? 'critical' : 'default'}
                  name={name}
                  type="number"
                  value={value}
                  placeholder="0"
                  onBlur={onBlur}
                  onChange={onChange}
                  adornmentText={'BOA'}
                />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {error?.message && (
                      <AlertInline label={error.message} mode="critical" />
                    )}
                  </div>
                </div>
              </>
            )}
          />
        </FormItem>
      )}
    </>
  );
};

export default SetupProposal;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
