import {Spinner} from 'votera-ui-components';
import {CardProposal, CardProposalProps} from 'components/cards/cardProposal';
import React, {useMemo} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {NavigateFunction, generatePath, useNavigate} from 'react-router-dom';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {Dashboard} from 'utils/paths';
import {useWallet} from 'hooks/useWallet';
import {shortenAddress} from '../../utils/library';
import {ProposalData, ProposalPeriod} from 'votera-sdk-client';
import {getExtendedPhase} from '../../pages/dashboard';

export type CardProposalDataProps = {
  id: string;
  title: string;
  description: string;
  explorer: string;
  publisherAddress: string;
  publishLabel: string;
  addressLabel: string;
  phase: ProposalPeriod;
  onClick: () => void;
  type?: string;
  progressLabel?: string;
};
type ProposalDataListProps = {
  proposals: Array<ProposalData>;
  isLoading: boolean;
};
const ProposalList: React.FC<ProposalDataListProps> = ({
  proposals,
  isLoading,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {address} = useWallet();
  const navigate = useNavigate();

  const mappedProposals: CardProposalDataProps[] = useMemo(
    () =>
      proposals.map(p =>
        proposal2CardDataProps(p, network, navigate, t, address)
      ),
    [proposals, network, navigate, t, address]
  );

  if (isLoading) {
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
      {mappedProposals.map(proposal => (
        <CardProposal {...proposal} key={proposal.id} />
      ))}
    </div>
  );
};

const getInProgressPhase = (proposal: any, t: TFunction) => {
  const extendedPhase = getExtendedPhase(proposal);
  if (extendedPhase.toLowerCase().includes('opened')) {
    return t('governance.statusWidget.active');
  } else if (extendedPhase.toLowerCase().includes('closed')) {
    return t('governance.statusWidget.finished');
  }
};

/**
 * Map SDK proposals to proposals to be displayed as CardProposals
 * @param proposals proposal list from SDK
 * @param network supported network name
 * @returns list of proposals ready to be display as CardProposals
 */
export function proposal2CardDataProps(
  proposal: ProposalData,
  network: SupportedNetworks,
  navigate: NavigateFunction,
  t: TFunction,
  address: string | null
): CardProposalDataProps {
  const props: CardProposalDataProps = {
    id: proposal.proposalId,
    title: proposal.title,
    description: proposal.description,
    explorer: CHAIN_METADATA[network].explorer,
    publisherAddress: proposal.proposer,
    publishLabel: t('governance.proposals.publishedBy'),
    addressLabel:
      proposal?.proposer.toLowerCase() === address?.toLowerCase()
        ? t('labels.you')
        : shortenAddress(proposal?.proposer || ''),
    phase: proposal.period,
    onClick: () => {
      navigate(
        generatePath(Dashboard, {
          network,
          id: proposal.proposalId,
        })
      );
    },
    progressLabel: getInProgressPhase(proposal, t),
  };

  return props;
}

export default ProposalList;
