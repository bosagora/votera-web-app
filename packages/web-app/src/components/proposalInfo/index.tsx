import {AlertInline, ButtonText, Tag} from '@aragon/ui-components';
import {ListItemLink} from 'components/listItem/link';
import {BigNumber} from 'ethers';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IPFS_ENDPOINT} from 'utils/constants';
import {ProposalPhase} from 'utils/types';
import {Amount, ProposalPeriod, ProposalType} from 'votera-sdk-client';

const NumberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

interface ProposalInfoProps {
  period: ProposalPeriod;
  phase: ProposalPeriod;
  proposalType: ProposalType;
  fundAmount: BigNumber;
  extendedPhase: string;
  exPhaseMessage: string;
  assessmentStartDate: Date;
  assessmentEndDate: Date;
  voteStartDate: Date;
  voteEndDate: Date;
  documentId: string;
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

interface StageStatus {
  isActive: boolean;
  message: string;
  availableTransitionToVote?: boolean;
  availableTransitionToExecute?: boolean;
}

const ProposalInfo: React.FC<ProposalInfoProps> = ({
  period,
  phase,
  proposalType,
  fundAmount,
  extendedPhase,
  exPhaseMessage,
  assessmentStartDate,
  assessmentEndDate,
  voteStartDate,
  voteEndDate,
  documentId,
}) => {
  const {t} = useTranslation();

  const averageRating = 5.0;

  console.log('ProposalInfo phase', phase);

  return (
    <Container>
      <VStackSection>
        {/* <Header style={{borderBottom: '1px solid #E0E0E0'}}>
          <Heading1>단계 정보</Heading1>
        </Header> */}

        {/* 현재 상태 */}
        <InfoLine>
          <p>{t('proposalInfo.currentStatus')}</p>
          <Strong>{phase}</Strong>
        </InfoLine>

        {/* 참고 문서 */}
        <InfoLine>
          <p>{t('proposalInfo.proposalDocument')}</p>
          <Strong>
            {[
              {
                name: t('proposalInfo.download'),
                url: IPFS_ENDPOINT + documentId + '.pdf',
              },
            ].map(({name, url}) => (
              <ListItemLink label={name} href={url} key={url} />
            ))}
          </Strong>
        </InfoLine>

        {/* 제안 유형 */}
        <InfoLine>
          <p>{t('proposalInfo.proposalType')}</p>
          <Strong>
            {proposalType === ProposalType.SYSTEM
              ? t('proposalInfo.systemProposal')
              : t('proposalInfo.fundingProposal')}
          </Strong>
        </InfoLine>

        {/* 펀딩 금액 */}
        {proposalType === ProposalType.FUND && (
          <>
            <InfoLine>
              <p>{t('proposalInfo.fundAmount')}</p>
              <Strong>
                {new Amount(fundAmount, 18).toDisplayString(true, 2)} BOA
              </Strong>
            </InfoLine>
            <InfoLine>
              <p>{t('proposalInfo.assessmentPeriod')}</p>
              <Strong>
                {`${formatDate(assessmentStartDate)} ~ ${formatDate(
                  assessmentEndDate
                )}`}
                {period === ProposalPeriod.ASSESSMENT && (
                  <div className="text-sm text-ui-500">
                    {(() => {
                      const now = new Date();
                      const diff = assessmentEndDate.getTime() - now.getTime();
                      const minutes = Math.floor(diff / (1000 * 60));
                      return `(${minutes}분 남음)`;
                    })()}
                  </div>
                )}
              </Strong>
            </InfoLine>
          </>
        )}

        {/* Vote 기간 */}
        <InfoLine>
          <p>{t('proposalInfo.votePeriod')}</p>
          <Strong>
            {`${formatDate(voteStartDate)} ~ ${formatDate(voteEndDate)}`}
            {period === ProposalPeriod.VOTE && (
              <div className="text-sm text-ui-500">
                {(() => {
                  const now = new Date();
                  const diff = voteEndDate.getTime() - now.getTime();
                  const minutes = Math.floor(diff / (1000 * 60));
                  return `(${minutes}분 남음)`;
                })()}
              </div>
            )}
          </Strong>
        </InfoLine>
      </VStackSection>
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

const VStackSection = styled.div.attrs({
  className: 'space-y-1.5 p-2 tablet:p-3 -mx-2 tablet:-mx-3',
})``;

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
