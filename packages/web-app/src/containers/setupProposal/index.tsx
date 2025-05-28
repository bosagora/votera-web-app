import {AlertInline, Label, ValueInput} from '@aragon/ui-components';
import React from 'react';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import IncreaseAmount from 'components/increaseAmount';
import {ProposalType} from 'pages/createProposal';

export type SetupProposalProps = {
  arrayName?: string;
  isSettingPage?: boolean;
  bgWhite?: boolean;
};

const SetupProposal: React.FC<SetupProposalProps> = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();

  const proposalType = useWatch({
    control,
    name: 'proposalType',
  });

  return (
    <>
      {proposalType === ProposalType.FUND && (
        <FormItem>
          <Label
            label={t('labels.assessmentPeriod')}
            helpText={t('createDAO2.step3.assessmentPeriodDesc')}
          />

          <Controller
            name="assessmentPeriod"
            control={control}
            defaultValue={7}
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
      <FormItem>
        <Label
          label={t('labels.votePeriod')}
          helpText={t('createDAO2.step3.votePeriodDesc')}
        />
        <Controller
          name="votePeriod"
          control={control}
          defaultValue={7}
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
              // validate: amountValidator,
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
                  // onAdornmentClick={() => handleMaxClicked(onChange)}
                />
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    {error?.message && (
                      <AlertInline label={error.message} mode="critical" />
                    )}
                    {/* {renderWarning(value)} */}
                  </div>
                  {/* {tokenBalance && (
                    <TokenBalance>
                      {`${t(
                        'labels.maxBalance'
                      )}: ${tokenBalance} ${tokenSymbol}`}
                    </TokenBalance>
                  )} */}
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

const InputCount = styled.div.attrs({
  className: 'ft-text-sm mt-1',
})``;

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
