import {AlertInline, ButtonText, IconReload, Tag} from 'votera-ui-components';
import {ListItemLink} from 'components/listItem/link';
import {BigNumber} from 'ethers';
import React from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import styled from 'styled-components';
import {IPFS_ENDPOINT} from 'utils/constants';
import {Amount, ProposalPeriod, ProposalType} from 'votera-sdk-client';
import moment from 'moment';

const Icon = styled(IconReload).attrs({className: 'ml-1 w-1.5 h-1.5'})``;

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
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

const getTimeRemaining = (endDate: Date, t: TFunction) => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return t('proposalInfo.daysLeft', {days});
  } else if (hours > 0) {
    return t('proposalInfo.hoursLeft', {hours});
  } else if (minutes > 0) {
    return t('proposalInfo.minutesLeft', {minutes});
  } else {
    return '';
  }
};

const ProposalInfo: React.FC<ProposalInfoProps> = ({
  period,
  phase,
  proposalType,
  fundAmount,
  assessmentStartDate,
  assessmentEndDate,
  voteStartDate,
  voteEndDate,
  documentId,
}) => {
  const {t} = useTranslation();

  return (
    <Container>
      <VStackSection>
        {/* 현재 상태 */}
        <InfoLine>
          <p>{t('proposalInfo.currentStatus')}</p>
          <div className="flex items-center">
            <Strong>{phase}</Strong>
            <button
              className="p-0 hover:bg-ui-100 rounded-full"
              onClick={() => window.location.reload()}
            >
              <Icon />
            </button>
          </div>
        </InfoLine>

        {/* 참고 문서 */}
        <InfoLine>
          <p>{t('proposalInfo.proposalDocument')}</p>
          <div className="flex flex-col gap-y-1">
            {[
              {
                name: t('proposalInfo.download'),
                url: IPFS_ENDPOINT + documentId + '.pdf',
              },
            ].map(({name, url}) => (
              <ListItemLink label={name} href={url} key={url} />
            ))}
          </div>
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
              </Strong>
              {period === ProposalPeriod.ASSESSMENT &&
                !!getTimeRemaining(assessmentEndDate, t) && (
                  <div className="text-sm text-ui-500">
                    {getTimeRemaining(assessmentEndDate, t)}
                  </div>
                )}
            </InfoLine>
          </>
        )}

        {/* Vote 기간 */}
        <InfoLine>
          <p>{t('proposalInfo.votePeriod')}</p>
          <Strong>
            {`${formatDate(voteStartDate)} ~ ${formatDate(voteEndDate)}`}
          </Strong>
          {period === ProposalPeriod.VOTE &&
            !!getTimeRemaining(voteEndDate, t) && (
              <div className="text-sm text-ui-500">
                {getTimeRemaining(voteEndDate, t)}
              </div>
            )}
        </InfoLine>
      </VStackSection>
    </Container>
  );
};

export default ProposalInfo;

const VStackSection = styled.div.attrs({
  className: 'space-y-1.5 p-2 tablet:p-3 -mx-2 tablet:-mx-3',
})``;

const InfoLine = styled.div.attrs({
  className: 'flex justify-between text-ui-600',
})``;

const Strong = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const Container = styled.div.attrs({
  className: 'tablet:p-3 py-2.5 px-2 rounded-xl bg-ui-0 border border-ui-100',
})``;
