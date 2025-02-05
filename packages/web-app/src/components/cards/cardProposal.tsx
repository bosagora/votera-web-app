import React from 'react';
import styled from 'styled-components';

import {AlertInline} from '@aragon/ui-components';
import {AvatarDao} from '@aragon/ui-components';
import {IconClock} from '@aragon/ui-components';
import {Link} from '@aragon/ui-components';
import {LinearProgress} from '@aragon/ui-components';
import {Tag} from '@aragon/ui-components';
import {ProposalPhase} from 'utils/types';
import {CardProposalDataProps} from 'components/proposalList';
import {ProposalPeriod} from 'votera-sdk-client';

type ProposalUseCase = 'list' | 'explore';

export function isExploreProposal(
  proposalUseCase: ProposalUseCase
): proposalUseCase is 'explore' {
  return proposalUseCase === 'explore';
}

export type CardProposalProps = {
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
  /** Indicates whether the proposal is in being used in list or in its special form (see explore page) */
  type?: ProposalUseCase;
  /** Url for the dao avatar */
  daoLogo?: 'string';
  /** The title that appears at the top of the progress bar */
  voteTitle: string;
  /** Progress bar value in percentage (max: 100) */
  voteProgress?: number | string;
  /** Vote label that appears at bottom of the progress bar */
  voteLabel?: string;
  /** Label indicating that current user has voted */
  votedAlertLabel?: string;
  /** Breakdown of the wining option */
  winningOptionValue?: string;
  /** Proposal token amount */
  tokenAmount?: string;
  /** Proposal token symbol */
  tokenSymbol?: string;
  /** Publish by sentence in any available languages */
  publishLabel: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is
   * explore */
  publisherAddress?: string;
  /** DAO name to display when type is explore */
  daoName?: string;
  /** Blockchain explorer URL */
  explorer?: string;

  alertMessage?: string;
  /**
   * ['Draft', 'Pending', 'Active', 'Executed', 'Succeeded', 'Defeated']
   */
  stateLabel: string[];
};

const getPhaseColor = (phase: ProposalPeriod) => {
  switch (phase) {
    case ProposalPeriod.ASSESSMENT:
      return 'text-primary-500';
    case ProposalPeriod.VOTE:
      return 'text-info-500';
    case ProposalPeriod.EXECUTION:
      return 'text-success-500';
    case ProposalPeriod.FINISHED:
      return 'text-neutral-500';
    default:
      return 'text-neutral-500';
  }
};

const getPhaseLabel = (phase: ProposalPeriod) => {
  switch (phase) {
    case ProposalPeriod.ASSESSMENT:
      return '평가 단계';
    case ProposalPeriod.VOTE:
      return '투표 단계';
    case ProposalPeriod.EXECUTION:
      return '실행 단계';
    case ProposalPeriod.FINISHED:
      return '종료';
    default:
      return '';
  }
};

export const CardProposal: React.FC<CardProposalDataProps> = ({
  phase,
  title,
  description,
  explorer,
  publisherAddress,
  publishLabel,
  addressLabel,
  onClick,
  type,
}) => {
  const addressExploreUrl = `${explorer}address/${publisherAddress}`;

  return (
    <Card data-testid="cardProposal" onClick={onClick}>
      <Header>
        <HeaderOptions phase={phase} type={type || ''} />
      </Header>
      <TextContent>
        <TitleWrapper>
          <Title>{title}</Title>
        </TitleWrapper>
        <DescriptionWrapper>
          <Description>{description}</Description>
        </DescriptionWrapper>
        <Publisher>
          <PublisherLabel>{publishLabel}</PublisherLabel>
          <Link
            external
            href={addressExploreUrl}
            label={addressLabel}
            className="text-sm"
          />
        </Publisher>
      </TextContent>
      {/* {phase === ProposalPhase.VOTE && voteProgress !== undefined && (
        <>
          <LoadingContent>
            <ProgressInfoWrapper>
              <ProgressTitle>{voteTitle}</ProgressTitle>
              <Amount>
                {tokenAmount && tokenSymbol
                  ? `${tokenAmount} ${tokenSymbol}`
                  : winningOptionValue}
              </Amount>
            </ProgressInfoWrapper>
            <LinearProgress max={100} value={voteProgress} />
            <ProgressInfoWrapper>
              <Vote>{voteLabel}</Vote>
              <Percentage>{voteProgress}%</Percentage>
            </ProgressInfoWrapper>
          </LoadingContent>
          {votedAlertLabel && (
            <VotedAlertWrapper>
              <AlertInline mode="success" label={votedAlertLabel} />
            </VotedAlertWrapper>
          )}
        </>
      )} */}
    </Card>
  );
};

type HeaderOptionProps = Pick<CardProposalDataProps, 'phase'> & {
  type: string;
};

const HeaderOptions: React.VFC<HeaderOptionProps> = ({phase, type}) => {
  switch (phase) {
    case ProposalPeriod.ASSESSMENT:
      return <Tag label={getPhaseLabel(phase)} colorScheme={'info'} />;
    case ProposalPeriod.VOTE:
      return <Tag label={getPhaseLabel(phase)} colorScheme={'primary'} />;
    case ProposalPeriod.EXECUTION:
      return <Tag label={getPhaseLabel(phase)} colorScheme={'success'} />;
    case ProposalPeriod.FINISHED:
      return <Tag label={getPhaseLabel(phase)} colorScheme={'critical'} />;
    default:
      return null;
  }
};

const Card = styled.button.attrs({
  className:
    'w-full bg-white rounded-xl p-2 space-y-3 box-border ' +
    'hover:border hover:border-ui-100 ' +
    'active:border active:border-ui-200 ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500',
})`
  &:hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
`;

const Header = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Title = styled.h1.attrs({
  className: 'font-bold text-neutral-800 text-left line-clamp-1',
})``;

const Description = styled.p.attrs({
  className: 'text-neutral-600 text-left line-clamp-2',
})``;

const Publisher = styled.span.attrs({
  className: 'flex space-x-1 text-ui-500 ft-text-sm',
})``;

const TextContent = styled.div.attrs({
  className: 'space-y-1.5 min-h-[80px]',
})``;

const LoadingContent = styled.div.attrs({
  className: 'space-y-2 p-2 bg-ui-50 rounded-xl',
})``;

const ProgressInfoWrapper = styled.div.attrs({
  className: 'flex justify-between',
})``;

const ProgressTitle = styled.h3.attrs({
  className: 'text-ui-800 ft-text-base font-bold',
})``;

const Amount = styled.span.attrs({
  className: 'text-ui-500 ft-text-base',
})``;

const Vote = styled.span.attrs({
  className: 'text-primary-500 font-bold ft-text-base',
})``;

const Percentage = styled.span.attrs({
  className: 'text-primary-500 font-bold ft-text-base',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-0.5'})``;

const VotedAlertWrapper = styled.div.attrs({
  className: 'flex justify-center desktop:justify-start',
})``;

const TitleWrapper = styled.div.attrs({
  className: 'h-[24px] flex items-center',
})``;

const DescriptionWrapper = styled.div.attrs({
  className: 'h-[40px] flex items-center',
})``;
