import {AlertInline, ButtonText, Tag} from '@aragon/ui-components';
import React, { useEffect, useState } from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

const NumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

interface ProposalInfoProps {
  currentStage: 'ASSESSMENT' | 'VOTE';
  assessmentStartDate: Date;
  assessmentEndDate: Date;
  voteStartDate: Date;
  voteEndDate: Date;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

interface StageStatus {
  isActive: boolean;
  message: string;
  availableTransitionToVote?: boolean;
  availableTransitionToExecute?: boolean;
}

const ProposalInfo: React.FC<ProposalInfoProps> = ({
  currentStage,
  assessmentStartDate,
  assessmentEndDate,
  voteStartDate,
  voteEndDate
}) => {
  const {t} = useTranslation();

  const averageRating = 5.0;
  const [stageStatus, setStageStatus] = useState<StageStatus>({
    isActive: false,
    availableTransitionToVote: false,
    availableTransitionToExecute: false,
    message: ''
  });

  useEffect(() => {
    const checkStageStatus = () => {
      const now = new Date();
      const isAssessmentPeriod = now >= assessmentStartDate && now <= assessmentEndDate;
      const isVotePeriod = now >= voteStartDate && now <= voteEndDate;
      
      const isAssessmentEnded = now > assessmentEndDate;
      const hasPassingGrade = averageRating >= 5.0;

      let newStatus: StageStatus;

      switch (currentStage) {
        case 'ASSESSMENT':
          newStatus = {
            isActive: isAssessmentPeriod,
            availableTransitionToVote: isAssessmentEnded && hasPassingGrade,
            message: isAssessmentPeriod ? '평가 진행 중' : '평가 기간이 아닙니다'
          };
          break;
        case 'VOTE':
          // 평가 단계가 끝나고 평점이 5.0 이상인 경우에만 투표 상태 표시
          if (isAssessmentEnded && hasPassingGrade) {
            newStatus = {
              isActive: isVotePeriod,
              availableTransitionToExecute: isAssessmentEnded && hasPassingGrade,
              message: isVotePeriod ? '투표 진행 중' : '투표 기간이 아닙니다'
            };
          } else {
            newStatus = {
              isActive: false,
              message: '평가 기준을 충족하지 못했습니다'
            };
          }
          break;
        default:
          newStatus = {
            isActive: false,
            message: '유효하지 않은 단계입니다'
          };
      }
      console.log(newStatus);

      setStageStatus(newStatus);
    };

    checkStageStatus();
  }, [currentStage, assessmentStartDate, assessmentEndDate, voteStartDate, voteEndDate, averageRating]);

  return (
    <Container>
      <VStackSection>
      <Header>
        <Heading1>제안 단계 정보</Heading1>
        </Header>
        
        {/* 현재 단계 */}
        <InfoLine>
          <p>{t('votingTerminal.currentStage')}</p>
          <Strong>
            {currentStage === 'ASSESSMENT' ? '평가 단계' : '투표 단계'}
          </Strong>
        </InfoLine>

        {/* Assessment 기간 */}
        <InfoLine>
          <p>{t('votingTerminal.assessmentPeriod')}</p>
          <Strong>
            {`${formatDate(assessmentStartDate)} ~ ${formatDate(assessmentEndDate)}`}
          </Strong>
        </InfoLine>

        {/* Vote 기간 */}
        <InfoLine>
          <p>{t('votingTerminal.votePeriod')}</p>
          <Strong>
            {`${formatDate(voteStartDate)} ~ ${formatDate(voteEndDate)}`}
          </Strong>
        </InfoLine>

        {/* 현재 상태 */}
        <InfoLine>
          <p>{t('votingTerminal.currentStatus')}</p>
          <Strong>
            {stageStatus.message}
          </Strong>
        </InfoLine>
      </VStackSection>

       { stageStatus.availableTransitionToVote ?(
          <WidgetFooter
          status={'executable'}
          onTransitionClicked={() => {
            console.log('실행 버튼이 클릭되었습니다');
            // 실행 로직 추가
          }}
        />
      ) : null}


    </Container>
  );
};

type ExecutionStatus =
  | 'defeated'
  | 'executed'
  | 'executable'
  | 'executable-failed'
  | 'default';

type ExecutionWidgetProps = {
    txhash?: string;
    status?: ExecutionStatus;
    onAddAction?: () => void;
    onTransitionClicked?: () => void;
  };

type FooterProps = Pick<
  ExecutionWidgetProps,
  'status' | 'txhash' | 'onTransitionClicked'
>;

const WidgetFooter: React.FC<FooterProps> = ({
  status = 'default',
  onTransitionClicked,
}) => {
  const {t} = useTranslation();

  return (
    <Footer>
      <StyledButtonText
        css={{}}
        label={t('governance.proposals.buttons.execute')}
        size="large"
        onClick={onTransitionClicked}
      />
      <AlertInline label={t('governance.executionCard.status.succeeded')} />
    </Footer>
  );
};


export default ProposalInfo;

const EndDateWrapper = styled.div.attrs({
  className: 'space-y-0.5 text-right',
})``;

const CurrentParticipationWrapper = styled.div.attrs({
  className: 'space-y-0.5 text-right',
})``;

const VStackSection = styled.div.attrs(({isLast}: {isLast?: boolean}) => ({
  className: `space-y-1.5 p-2 tablet:p-3 -mx-2 tablet:-mx-3 ${
    isLast ? 'pb-0 border-b-0' : 'border-b border-ui-100'
  }`,
}))<{isLast?: boolean}>``;

const InfoLine = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const Strong = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const SectionHeader = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;
const Container = styled.div.attrs({
    className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
  })``;
  
  const Header = styled.div.attrs({
    className:
      'tablet:flex tablet:justify-between tablet:items-center space-y-2 tablet:space-y-0',
  })``;

  const Heading1 = styled.h1.attrs({
    className: 'ft-text-xl font-bold text-ui-800 flex-grow',
  })``;


const Footer = styled.div.attrs({
    className:
      'flex flex-col tablet:flex-row items-center gap-y-2 tablet:gap-y-0 tablet:gap-x-3',
  })``;
  
  const StyledButtonText = styled(ButtonText).attrs({
    className: 'w-full tablet:w-max',
  })``;
  