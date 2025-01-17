import {
  AlertInline,
  AlertInlineProps,
  LinearProgress,
  NumberInput,
  NumberInputProps,
} from '@aragon/ui-components';
import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

interface Assessment {
  completeness: number;
  possibility: number;
  profitability: number;
  attractiveness: number;
  scalability: number;
}

type Props = {
  assessmentLength: number;
  values: Assessment[];
};

const AssessmentResult: React.FC<Props> = ({values, assessmentLength}) => {
  const {t} = useTranslation();
  const [average, setAverage] = useState(0);
  const max = 10;
  const min = 0;

  const calculateAssessmentAverage = (assessment: Assessment) => {
    return (
      (assessment.completeness +
        assessment.possibility +
        assessment.profitability +
        assessment.attractiveness +
        assessment.scalability) /
      5
    );
  };

  useEffect(() => {
    if (values?.length > 0) {
      const totalAverage = values.reduce(
        (sum, assessment) => sum + calculateAssessmentAverage(assessment),
        0
      );
      const calculatedAverage = (totalAverage / values.length).toFixed(1);
      setAverage(Number(calculatedAverage));
    } else {
      setAverage(0);
    }
  }, [values]);

  const assessmentTypes = [
    {key: 'completeness', label: '완성도'},
    {key: 'possibility', label: '실현가능성'},
    {key: 'profitability', label: '수익성'},
    {key: 'attractiveness', label: '매력도'},
    {key: 'scalability', label: '확장성'},
  ] as const;

  const calculateItemAverage = (key: keyof Assessment) => {
    return (
      values.reduce((sum, assessment) => sum + assessment[key], 0) /
      values.length
    );
  };

  return (
    <>
      <Container>
        <InputWrapper>
          <AverageWrapper>{average}</AverageWrapper>
          <NodeInfoWrapper>참여한 노드 {assessmentLength}</NodeInfoWrapper>
        </InputWrapper>

        <ProgressWrapper>
          {assessmentTypes.map(({key, label}) => (
            <ProgressInfoWrapper key={key}>
              <AssessmentLabel>{label}</AssessmentLabel>
              <LinearProgressContainer>
                <LinearProgress max={max} value={calculateItemAverage(key)} />
                <ProgressInfo>
                  <ApprovalAddresses
                    style={{
                      flexBasis: `${(calculateItemAverage(key) / max) * 100}%`,
                    }}
                  >
                    {calculateItemAverage(key).toFixed(1)}
                  </ApprovalAddresses>
                  <TotalAddresses>{t(` of ${max}`)}</TotalAddresses>
                </ProgressInfo>
              </LinearProgressContainer>
            </ProgressInfoWrapper>
          ))}
        </ProgressWrapper>
      </Container>
    </>
  );
};

export default AssessmentResult;

const Container = styled.div.attrs({
  className:
    'flex flex-col desktop:flex-row items-center p-2 pt-4 desktop:p-3 gap-x-3 gap-y-4 rounded-xl bg-ui-0 w-full',
})``;

const LinearProgressContainer = styled.div.attrs({
  className: 'flex relative flex-1 items-center w-full',
})``;

const ProgressInfo = styled.div.attrs({
  className:
    'flex absolute whitespace-nowrap -top-2.5 justify-between space-x-0.5 w-full text-sm',
})``;

const ApprovalAddresses = styled.p.attrs({
  className: 'font-bold text-right text-primary-500',
})``;

const TotalAddresses = styled.p.attrs({className: 'text-ui-600 ft-text-sm'})``;

const InputWrapper = styled.div.attrs({
  className: 'w-full desktop:w-1/4 order-1 desktop:order-none',
})``;

const ProgressWrapper = styled.div.attrs({
  className:
    'flex flex-1 flex-col items-stretch w-full gap-y-4 order-2 desktop:order-none',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex w-full items-center gap-x-4',
})``;

const AverageWrapper = styled.div.attrs({
  className:
    'flex w-full justify-center items-center text-3xl font-bold text-ui-800',
})``;

const NodeInfoWrapper = styled.div.attrs({
  className: 'flex w-full justify-center items-center text-base text-ui-600',
})``;

const AssessmentLabel = styled.div.attrs({
  className: 'text-ui-800 font-bold w-32 desktop:w-24 flex-shrink-0',
})``;
