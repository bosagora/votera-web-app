import React from 'react';
import styled from 'styled-components';

import {AlertInline, IconBlock} from '@aragon/ui-components';
import {AvatarDao} from '@aragon/ui-components';
import {IconClock} from '@aragon/ui-components';
import {Link} from '@aragon/ui-components';
import {LinearProgress} from '@aragon/ui-components';
import {Tag} from '@aragon/ui-components';
import {getSupportedNetworkByChainId} from 'utils/constants';

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
  process:
    | 'draft'
    | 'pending'
    | 'active'
    | 'succeeded'
    | 'executed'
    | 'defeated';
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

export const CardProposal: React.FC<
  CardProposalProps & {addressLabel: string}
> = ({
  process = 'pending',
  title,
  description,
  voteTitle,
  voteProgress,
  voteLabel,
  votedAlertLabel,
  tokenAmount,
  tokenSymbol,
  winningOptionValue,
  publishLabel,
  publisherAddress,
  explorer = 'https://etherscan.io/',
  alertMessage,
  stateLabel,
  type = 'list',
  daoLogo,
  daoName,
  onClick,
  addressLabel,
}: CardProposalProps & {addressLabel: string}) => {
  const addressExploreUrl = `${explorer}address/${publisherAddress}`;
  return (
    <Card data-testid="cardProposal" onClick={onClick}>
      <TopContent>
        <Header>
          <HeaderOptions
            process={process}
            stateLabel={stateLabel}
            alertMessage={alertMessage}
            type={type}
          />
        </Header>

        <TextContent>
          <Title>{title}</Title>
          <Description>{description}</Description>
          <Publisher>
            {isExploreProposal(type) ? (
              <AvatarDao daoName={daoName!} size="small" src={daoLogo} />
            ) : (
              <PublisherLabel>{publishLabel}</PublisherLabel>
            )}

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
              <IconLabel>Ethereum</IconLabel>
            </IconWrapper>
          </ProposalMetadataWrapper>
        </TextContent>
      </TopContent>

      <LoadingContent>
        <ProgressInfoWrapper>
          <ProgressTitle>Assessmented by</ProgressTitle>
          <Amount>1 of 10 members</Amount>
        </ProgressInfoWrapper>
        {votedAlertLabel && (
          <VotedAlertWrapper>
            <AlertInline mode="success" label={votedAlertLabel} />
          </VotedAlertWrapper>
        )}
      </LoadingContent>
    </Card>
  );
};

type HeaderOptionProps = Pick<
  CardProposalProps,
  'alertMessage' | 'process' | 'stateLabel'
> & {
  type: NonNullable<CardProposalProps['type']>;
};

const HeaderOptions: React.VFC<HeaderOptionProps> = ({
  alertMessage,
  process,
  stateLabel,
  type,
}) => {
  switch (process) {
    case 'draft':
      return <Tag label={stateLabel[0]} />;
    case 'pending':
      return (
        <>
          <Tag label={stateLabel[1]} />
          {alertMessage && (
            <AlertInline
              label={alertMessage}
              icon={<IconClock className="text-info-500" />}
              mode="neutral"
            />
          )}
        </>
      );
    case 'active':
      return (
        <>
          {!isExploreProposal(type) && (
            <Tag label={stateLabel[2]} colorScheme={'info'} />
          )}
          {/*{alertMessage && (*/}
          {/*  <AlertInline*/}
          {/*    label={alertMessage}*/}
          {/*    icon={<IconClock className="text-info-500" />}*/}
          {/*    mode="neutral"*/}
          {/*  />*/}
          {/*)}*/}
        </>
      );
    case 'executed':
      return <Tag label={stateLabel[3]} colorScheme={'success'} />;
    case 'succeeded':
      return <Tag label={stateLabel[4]} colorScheme={'success'} />;
    case 'defeated':
      return <Tag label={stateLabel[5]} colorScheme={'critical'} />;
    default:
      return null;
  }
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

const ProposalMetadataWrapper = styled.div`
  flex: flex-row space-x-3;
`;

const IconLabel = styled.p.attrs({
  className: 'text-ui-600 ft-text-sm capitalize',
})``;

const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-1',
})``;

const DaoDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-1.5 flex-1',
})``;

const StyledIconBlock = styled(IconBlock).attrs({
  className: 'text-ui-600',
})``;

const TopContent = styled.div.attrs({
  className: 'flex flex-col space-y-3',
})``;
