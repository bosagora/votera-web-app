import React from 'react';
import styled from 'styled-components';

import {IconBlock} from 'votera-ui-components';
import {Link} from 'votera-ui-components';
import {ProposalPeriod} from 'votera-sdk-client';
import {TFunction, useTranslation} from 'react-i18next';

type ProposalUseCase = 'list' | 'explore';

export function isExploreProposal(
  proposalUseCase: ProposalUseCase
): proposalUseCase is 'explore' {
  return proposalUseCase === 'explore';
}

export type ProposalCardProps = {
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
  /** Publish by sentence in any available languages */
  publishLabel: string;
  /** Publisher's ethereum address, ENS name **or** DAO address when type is
   * explore */
  publisherAddress?: string;
  /** Blockchain explorer URL */
  explorer?: string;
  /**
   * ['Draft', 'Pending', 'Active', 'Executed', 'Succeeded', 'Defeated']
   */
  stateLabel: string[];

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
  phase,
  title,
  description,
  blockchain,
  explorer,
  publisherAddress,
  publishLabel,
  addressLabel,
  onClick,
  progressLabel,
}: ProposalCardProps) => {
  const {t} = useTranslation();
  const addressExploreUrl = `${explorer}address/${publisherAddress}`;
  return (
    <Card data-testid="ProposalCard" onClick={onClick}>
      <TopContent>
        <TextContent>
          <Title>{title}</Title>
          <Description>
            {description.length > 80
              ? `${description.substring(0, 80)}...`
              : description}
          </Description>
          <Publisher>
            <PublisherLabel>{publishLabel}</PublisherLabel>
            <Link
              external
              href={addressExploreUrl}
              label={addressLabel}
              className="text-sm"
            />
          </Publisher>

          <ProposalMetadataWrapper>
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

const Publisher = styled.span.attrs({
  className: 'flex space-x-1 text-ui-500 ft-text-sm',
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

const Amount = styled.span.attrs({
  className: 'text-ui-500 ft-text-base',
})``;

const PublisherLabel = styled.p.attrs({className: '-mr-0.5'})``;

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
