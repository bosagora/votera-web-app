import {Spinner} from '@aragon/ui-components';
import {CardProposal, CardProposalProps} from 'components/cards/cardProposal';
import React, {useMemo} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {NavigateFunction, generatePath, useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {
  CHAIN_METADATA,
  PROPOSAL_STATE_LABELS,
  SupportedNetworks,
} from 'utils/constants';
import {Proposal} from 'utils/paths';
import {ProposalListItem, ProposalPhase} from 'utils/types';
import {PluginTypes} from 'utils/aragon/types';
import {useWallet} from 'hooks/useWallet';
import {stripPlgnAdrFromProposalId} from '../../utils/proposals';
import {shortenAddress} from '../../utils/library';

type ProposalListProps = {
  proposals: Array<ProposalListItem>;
  daoAddressOrEns: string;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading?: boolean;
};

const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  daoAddressOrEns,
  pluginAddress,
  pluginType,
  isLoading,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const navigate = useNavigate();

  const {data: members, isLoading: areMembersLoading} = useDaoMembers(
    pluginAddress,
    pluginType
  );

  const mappedProposals: ({id: string} & CardProposalProps)[] = useMemo(
    () =>
      proposals.map(p =>
        proposal2CardProps(
          p,
          members.members.length,
          network,
          navigate,
          t,
          daoAddressOrEns,
          address
        )
      ),
    [
      proposals,
      members.members.length,
      network,
      navigate,
      t,
      daoAddressOrEns,
      address,
    ]
  );

  if (isLoading || areMembersLoading) {
    return (
      <div className="flex justify-center items-center h-7">
        <Spinner size="default" />
      </div>
    );
  }

  if (mappedProposals.length === 0) {
    return (
      <div className="flex justify-center items-center h-7 text-gray-600">
        <p data-testid="proposalList">{t('governance.noProposals')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="proposalList">
      {mappedProposals.map(({id, ...p}) => (
        <CardProposal {...p} key={id} />
      ))}
    </div>
  );
};

function relativeVoteCount(optionCount: number, totalCount: number) {
  if (totalCount === 0) {
    return 0;
  }
  return Math.round((optionCount / totalCount) * 100);
}

export type CardViewProposal = Omit<CardProposalProps, 'onClick'> & {
  id: string;
};

/**
 * Map SDK proposals to proposals to be displayed as CardProposals
 * @param proposals proposal list from SDK
 * @param network supported network name
 * @returns list of proposals ready to be display as CardProposals
 */
export function proposal2CardProps(
  proposal: ProposalListItem,
  memberCount: number,
  network: SupportedNetworks,
  navigate: NavigateFunction,
  t: TFunction,
  daoAddressOrEns: string,
  address: string | null
): {id: string; addressLabel: string} & CardProposalProps {
  const props = {
    id: proposal.id.toString(),
    title: proposal.title,
    description: proposal.description,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.creator,
    publishLabel: t('governance.proposals.publishedBy'),
    addressLabel:
      proposal?.creator.toLowerCase() === address?.toLowerCase()
        ? t('labels.you')
        : shortenAddress(proposal?.creator || ''),
    phase: proposal.phase,
    onClick: () => {
      navigate(
        generatePath(Proposal, {
          network,
          dao: daoAddressOrEns,
          id: proposal.id.toString(),
        })
      );
    },
  };

  const specificProps = {
    voteTitle: t('votingTerminal.approvedBy'),
    stateLabel: PROPOSAL_STATE_LABELS,
    alertMessage: 'alert message',
  };

  if (proposal.phase === ProposalPhase.VOTE) {
    const votedAlertLabel = proposal.approval?.some(
      v =>
        stripPlgnAdrFromProposalId(v).toLowerCase() === address?.toLowerCase()
    )
      ? t('governance.proposals.alert.voted')
      : undefined;

    const activeProps = {
      votedAlertLabel,
      voteProgress: relativeVoteCount(proposal.approval.length, memberCount),
      winningOptionValue: `${proposal.approval.length} ${t(
        'votingTerminal.ofMemberCount',
        {memberCount}
      )}`,
    };
    return {...props, ...specificProps, ...activeProps};
  } else {
    return {...props, ...specificProps};
  }
}

export default ProposalList;
