import {HeaderDao} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {BigNumber} from 'ethers';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {useGlobalModalContext} from 'context/globalModals';
import ProposalSnapshot from 'containers/proposalSnapshot';
import {ProposalListItem, ProposalPhase} from 'utils/types';
import {useClient2} from 'hooks/useClient2';
import {IProposalData, SortType} from 'votera-sdk-client';
import {useProposalQuery, PROPOSALS_PER_PAGE} from 'hooks/useProposalQuery';

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const daoAddressOrEns = '0x1234567890abcdef1234567890abcdef12345678';
  const {open} = useGlobalModalContext();
  const {client} = useClient2();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [proposals, setProposals] = useState<Array<IProposalData>>([]);
  const proposalQuery = useProposalQuery(undefined, page);

  useEffect(() => {
    if (proposalQuery.data) {
      const newProposals = proposalQuery.data as Array<IProposalData>;
      if (newProposals.length < PROPOSALS_PER_PAGE) {
        setHasMore(false);
      }
      if (page === 1) {
        setProposals(newProposals);
      } else {
        setProposals(prev => [...prev, ...newProposals]);
      }
    }
  }, [proposalQuery.data, page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <>
      <HeaderWrapper></HeaderWrapper>

      {isDesktop ? (
        <DashboardContent
          proposals={proposals}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoading={proposalQuery.isLoading}
        />
      ) : (
        <MobileDashboardContent
          proposals={proposals}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          isLoading={proposalQuery.isLoading}
        />
      )}
    </>
  );
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10 tablet:mt-3',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  proposals: Array<IProposalData>;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoading: boolean;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  proposals,
  hasMore,
  onLoadMore,
  isLoading,
}) => {
  return (
    <>
      <CenterWideContent>
        <ProposalSnapshot
          daoAddressOrEns={'0x1234567890abcdef1234567890abcdef12345678'}
          proposals={proposals}
          proposalLength={proposals.length}
          hasMore={hasMore}
          onLoadMore={onLoadMore}
          isLoading={isLoading}
        />
      </CenterWideContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const CenterWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  proposals,
  hasMore,
  onLoadMore,
  isLoading,
}) => {
  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={'0x1234567890abcdef1234567890abcdef12345678'}
        proposals={proposals}
        proposalLength={proposals.length}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        isLoading={isLoading}
      />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
