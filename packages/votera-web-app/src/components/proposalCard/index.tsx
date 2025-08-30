import React from 'react';
import styled from 'styled-components';

import {
  Avatar,
  AvatarWallet,
  AvatarDao,
  IconBlock,
  IconCommunity,
  IconFinance,
  IconGovernance,
  IconPerson,
  Link,
} from 'votera-ui-components';
import {Amount, ProposalPeriod} from 'votera-sdk-client';
import {TFunction, useTranslation} from 'react-i18next';
import {ProposalType} from 'votera-sdk-client/src/interfaces';
import {BigNumber} from 'ethers';

type ProposalUseCase = 'list' | 'explore';

export function isExploreProposal(
  proposalUseCase: ProposalUseCase
): proposalUseCase is 'explore' {
  return proposalUseCase === 'explore';
}

export type ProposalCardProps = {
  proposalId: string;
  proposalType: ProposalType;
  fundAmount: BigNumber;
  /** Proposal Title / Title of the card */
  title: string;
  /** Proposal Description / Description of the card */
  description: string;
  /**
   * Will be called when the button is clicked.
   * */
  onClick: () => void;
  /**
   * Available states that proposal card have. by changing the status,
   * the headers & buttons wil change to proper format also the progress
   * section only available on active state.
   * */
  phase: ProposalPeriod;
  blockchain?: string;
  /** Proposal token amount */
  tokenAmount?: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is
   * explore */
  publisherAddress?: string;
  /** Blockchain explorer URL */
  explorer?: string;
  addressLabel?: string;
  progressLabel?: string;
};

const getPhaseColor = (phase: ProposalPeriod) => {
  switch (phase) {
    case ProposalPeriod.ASSESSMENT:
      return 'text-info-500';
    case ProposalPeriod.VOTE:
      return 'text-info-800';
    case ProposalPeriod.EXECUTION:
      return 'text-warning-500';
    case ProposalPeriod.FINISHED:
      return 'text-success-500';
    default:
      return 'text-neutral-500';
  }
};

const getPhaseLabel = (phase: ProposalPeriod, t: TFunction) => {
  switch (phase) {
    case ProposalPeriod.ASSESSMENT:
      return t('voteSteps.step1.title');
    case ProposalPeriod.VOTE:
      return t('voteSteps.step2.title');
    case ProposalPeriod.EXECUTION:
      return t('voteSteps.step3.title');
    case ProposalPeriod.FINISHED:
      return t('voteSteps.step3.title');
    default:
      return '';
  }
};

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposalId,
  phase,
  title,
  description,
  blockchain,
  explorer,
  publisherAddress,
  addressLabel,
  onClick,
  progressLabel,
  proposalType,
  fundAmount,
}: ProposalCardProps) => {
  const {t} = useTranslation();
  const addressExploreUrl = `${explorer}address/${publisherAddress}`;
  return (
    <Card data-testid="ProposalCard" onClick={onClick}>
      <TopContent>
        <TextContent>
          <ProposalDataWrapper>
            <HeaderContainer>
              <AvatarDao
                proposalTitle={
                  proposalType === ProposalType.FUND ? 'Fund' : 'System'
                }
                src={proposalId}
                size={'medium'}
              />
              <div className="space-y-0.25 desktop:space-y-0.5 text-left">
                <Title>{title}</Title>
              </div>
            </HeaderContainer>
            <Description>
              {description.length > 80
                ? `${description.substring(0, 80)}...`
                : description}
            </Description>
          </ProposalDataWrapper>

          <ProposalMetadataWrapper>
            <IconWrapper>
              <StyledIconWallet />
              <IconLabel>
                <Link
                  external
                  href={addressExploreUrl}
                  label={addressLabel}
                  className="text-sm"
                />
              </IconLabel>
            </IconWrapper>

            <IconWrapper>
              <StyledIconGovernance />
              <IconLabel>
                {proposalType === ProposalType.FUND
                  ? t('proposalInfo.fundingProposal')
                  : t('proposalInfo.systemProposal')}
              </IconLabel>
            </IconWrapper>
            <IconWrapper>
              <StyledIconFinance />
              <IconLabel>
                {new Amount(BigNumber.from(fundAmount)).toDisplayString(
                  true,
                  0
                ) + ' BOA'}
              </IconLabel>
            </IconWrapper>
            <IconWrapper>
              <StyledIconBlock />
              <IconLabel>{blockchain}</IconLabel>
            </IconWrapper>
          </ProposalMetadataWrapper>
        </TextContent>
      </TopContent>
      <LoadingContent>
        <ProgressInfoWrapper>
          <PhaseTitle>{getPhaseLabel(phase, t)}</PhaseTitle>
          <ProgressTitle>{progressLabel}</ProgressTitle>
        </ProgressInfoWrapper>
      </LoadingContent>
    </Card>
  );
};

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-row space-x-2 items-center',
})``;

const Card = styled.button.attrs({
  className:
    'w-full bg-white rounded-xl p-2 box-border flex flex-col justify-between ' +
    'hover:border hover:border-ui-100 ' +
    'active:border active:border-ui-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
})`
  @media (min-width: 768px) {
    min-height: 240px;
  }

  &:hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
`;

const Header = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Title = styled.p.attrs({
  className: 'text-ui-800 text-left font-bold ft-text-xl line-clamp-1',
})``;

const Description = styled.p.attrs({
  className:
    'text-ui-600 text-left font-normal ft-text-base line-clamp-2 ' +
    'min-h-[4.5rem]',
})``;

const TextContent = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const LoadingContent = styled.div.attrs({
  className: 'space-y-2 p-2 bg-ui-50 rounded-xl mt-auto',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

const PhaseTitle = styled.h3.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const ProgressTitle = styled.h3.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-0.5'})``;

const ProposalDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-1.5 flex-1',
})``;

const ProposalMetadataWrapper = styled.div`
  flex: flex-row space-x-3;
`;

const IconLabel = styled.p.attrs({
  className: 'text-ui-600 ft-text-sm capitalize',
})``;

const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-1',
})``;

const StyledIconBlock = styled(IconBlock).attrs({
  className: 'text-ui-600',
})``;

const TopContent = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;

const StyledIconCommunity = styled(IconCommunity).attrs({
  className: 'text-ui-600',
})``;

const StyledIconFinance = styled(IconFinance).attrs({
  className: 'text-ui-600',
})``;

const StyledIconGovernance = styled(IconGovernance).attrs({
  className: 'text-ui-600',
})``;

const StyledIconWallet = styled(IconPerson).attrs({
  className: 'text-ui-600',
})``;
