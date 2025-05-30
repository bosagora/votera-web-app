import {
  ButtonText,
  IconChevronRight,
  IconGovernance,
  ListItemHeader,
} from '@aragon/ui-components';
import {CardProposal} from 'components/cards/cardProposal';
import React, {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {proposal2CardDataProps} from 'components/proposalList';
import {StateEmpty} from 'components/stateEmpty';
import {useNetwork} from 'context/network';
import {htmlIn} from 'utils/htmlIn';
import {CreateProposal} from 'utils/paths';
import {ProposalData} from 'votera-sdk-client';
import {useWallet} from 'hooks/useWallet';

type Props = {
  proposals: ProposalData[];
  proposalLength: number;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
};

const ProposalSnapshot: React.FC<Props> = ({
  proposals,
  proposalLength,
  hasMore,
  onLoadMore,
  isLoading,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {address} = useWallet();
  const {network} = useNetwork(); // TODO ensure this is the dao network

  const mappedProposals = useMemo(
    () =>
      proposals.map(p => {
        return proposal2CardDataProps(p, network, navigate, t, address);
      }),
    [proposals, network, navigate, t, address]
  );

  if (proposalLength === 0) {
    return (
      <StateEmpty
        type="Human"
        mode="card"
        body={'voting'}
        expression={'smile'}
        hair={'middle'}
        accessory={'earrings_rhombus'}
        sunglass={'big_rounded'}
        title={t('governance.emptyState.title')}
        description={htmlIn(t)('governance.emptyState.description')}
        primaryButton={{
          label: t('TransactionModal.createProposal'),
          onClick: () => navigate(generatePath(CreateProposal, {network})),
        }}
        renderHtml
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={<IconGovernance />}
        value={proposalLength.toString()}
        label={t('dashboard.proposalsTitle')}
        buttonText={t('newProposal.title')}
        orientation="horizontal"
        onClick={() => navigate(generatePath(CreateProposal, {network}))}
      />

      <ProposalGrid>
        {mappedProposals.map(proposal => (
          <CardProposal {...proposal} key={proposal.id} />
        ))}
      </ProposalGrid>

      {hasMore && (
        <ButtonText
          css={{}}
          mode="secondary"
          size="large"
          iconRight={<IconChevronRight />}
          label={t('explore.showMore')}
          onClick={onLoadMore}
          disabled={isLoading}
        />
      )}
    </Container>
  );
};

export default ProposalSnapshot;

const Container = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2 w-full',
})``;

const ProposalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;
