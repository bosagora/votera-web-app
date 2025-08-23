import {
  AlertInline,
  LinearProgress,
  NumberInput,
  NumberInputProps,
} from 'votera-ui-components';
import React from 'react';
import styled from 'styled-components';

type Props = NumberInputProps & {
  max: number;
  min: number;
  value: number | string;
  label: string;
  error?: any;
};
const IncreaseAmount: React.FC<Props> = ({max, min, ...rest}) => {
  const value = Number(rest.value);

  return (
    <>
      <Container>
        <LabelWrapper>
          <p className="text-sm font-bold text-ui-800 min-w-[220px]">
            {rest.label}
          </p>
        </LabelWrapper>
        <InputWrapper>
          <NumberInput {...rest} max={max} min={min} />
        </InputWrapper>

        <ProgressWrapper>
          <LinearProgressContainer>
            <LinearProgress max={max} value={value <= max ? value : max} />
            <ProgressInfo>
              <ApprovalAddresses
                style={{
                  flexBasis: `${((value <= max ? value : max) / max) * 100}%`,
                }}
              >
                {value <= max ? value : max}
              </ApprovalAddresses>
              <TotalAddresses>{max}</TotalAddresses>
            </ProgressInfo>
          </LinearProgressContainer>
        </ProgressWrapper>
      </Container>
      {rest.error && <AlertInline {...rest.error} />}
    </>
  );
};

export default IncreaseAmount;

const Container = styled.div.attrs({
  className:
    'flex flex-col desktop:flex-row items-center p-2 pt-4 desktop:p-3 gap-x-3 gap-y-4 rounded-xl bg-ui-0 w-full',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center',
})``;

const ProgressInfo = styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;

const ApprovalAddresses = styled.p.attrs({
  className: 'font-bold text-right text-primary-500',
})``;

const TotalAddresses = styled.p.attrs({className: 'text-ui-600 ft-text-sm'})``;

const LabelWrapper = styled.div.attrs({
  className: 'order-1 min-w-[220px] desktop:w-1/4 text-center',
})``;

const InputWrapper = styled.div.attrs({
  className: 'order-2 w-full desktop:w-1/4',
})``;

const ProgressWrapper = styled.div.attrs({
  className: 'order-3 flex flex-1 items-center w-full',
})``;
