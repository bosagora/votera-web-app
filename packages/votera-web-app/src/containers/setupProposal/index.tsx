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
  const {network} = useNetwork();
  const [assessmentPeriodData, setAssessmentPeriodData] = useState({
    default: 7,
    min: 7,
    max: 14,
  });

  const [votePeriodData, setVotePeriodData] = useState({
    default: 7,
    min: 14,
    max: 28,
  });

  const proposalType = useWatch({
    control,
    name: 'proposalType',
  });

  useEffect(() => {
    if (network === 'bosagora_devnet') {
      setAssessmentPeriodData({
        default: 30,
        min: 10,
        max: 14400,
      });
      setVotePeriodData({
        default: 30,
        min: 10,
        max: 14400,
      });
    } else if (network === 'bosagora_testnet') {
      setAssessmentPeriodData({
        default: 7,
        min: 7,
        max: 14,
      });
      setVotePeriodData({
        default: 7,
        min: 14,
        max: 28,
      });
    } else {
      setAssessmentPeriodData({
        default: 7,
        min: 7,
        max: 14,
      });
      setVotePeriodData({
        default: 7,
        min: 14,
        max: 28,
      });
    }
  }, [network]);

  return (
    <>
      {proposalType === ProposalType.FUND && (
        <FormItem>
          <Label
            label={t('labels.assessmentPeriod')}
            helpText={t('createProposal.step3.assessmentPeriodDesc')}
          />

          <Controller
            name="assessmentPeriod"
            control={control}
            defaultValue={assessmentPeriodData.default}
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
                  min={assessmentPeriodData.min}
                  max={assessmentPeriodData.max}
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
          helpText={t('createProposal.step3.votePeriodDesc')}
        />
        <Controller
          name="votePeriod"
          control={control}
          defaultValue={votePeriodData.default}
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
                min={votePeriodData.min}
                max={votePeriodData.max}
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
