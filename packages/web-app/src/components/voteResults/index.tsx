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

interface Vote {
  voter: string;
  timestamp: number;
  choice: number; // 0: no, 1: yes, 2: abstain
}

type Props = {
  voteSummary: Array<number>;
};

const VoteResults: React.FC<Props> = ({voteSummary}) => {
  const {t} = useTranslation();

  // 초기 상태값 설정
  const [voteCounts, setVoteCounts] = useState<{[key: string]: number}>({
    yes: 0,
    no: 0,
    abstain: 0,
  });

  const [votePercentages, setVotePercentages] = useState<{
    [key: string]: number;
  }>({
    yes: 0,
    no: 0,
    abstain: 0,
  });

  const voteTypes = [
    {key: 'yes', label: t('voteWidget.yes'), value: 1},
    {key: 'no', label: t('voteWidget.no'), value: 2},
    {key: 'abstain', label: t('voteWidget.abstain'), value: 0},
  ] as const;

  useEffect(() => {
    const counts = {
      yes: voteSummary[1] || 0,
      no: voteSummary[2] || 0,
      abstain: voteSummary[0] || 0,
    };

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const percentages = voteTypes.reduce((acc, {key}) => {
      acc[key] = total === 0 ? 0 : (counts[key] / total) * 100;
      return acc;
    }, {} as {[key: string]: number});

    setVoteCounts(counts);
    setVotePercentages(percentages);
  }, [voteSummary]);

  return (
    <>
      <Container>
        <ProgressWrapper>
          {voteTypes.map(({key, label}) => (
            <ProgressInfoWrapper key={key}>
              <AssessmentLabel>{label}</AssessmentLabel>
              <LinearProgressContainer>
                <LinearProgress max={100} value={votePercentages[key] || 0} />
                <ProgressInfo>
                  <ApprovalAddresses
                    style={{
                      flexBasis: `${votePercentages[key] || 0}%`,
                    }}
                  >
                    {voteCounts[key] || 0}
                  </ApprovalAddresses>
                  <TotalAddresses>
                    ({(votePercentages[key] || 0).toFixed(1)}%)
                  </TotalAddresses>
                </ProgressInfo>
              </LinearProgressContainer>
            </ProgressInfoWrapper>
          ))}
        </ProgressWrapper>
      </Container>
    </>
  );
};

export default VoteResults;

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

const AssessmentLabel = styled.div.attrs({
  className: 'text-ui-800 font-bold w-32 desktop:w-24 flex-shrink-0 mb-2',
})``;
