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
import {useProposalQuery} from 'hooks/useProposalQuery';

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const daoAddressOrEns = '0x1234567890abcdef1234567890abcdef12345678';
  const {open} = useGlobalModalContext();
  const {client} = useClient2();
  const [proposalCount, setProposalCount] = useState(0);
  const [proposals, setProposals] = useState<Array<IProposalData>>([]);
  const proposalQuery = useProposalQuery();

  useEffect(() => {
    const fetchProposals = async () => {
      const count = await client?.methods.getProposalLength();
      console.log('fetched proposal count :', count);
      setProposalCount(count ?? 0);

      if (proposalQuery.data) {
        console.log('fetched proposals :', proposalQuery.data);
        setProposals((proposalQuery.data as Array<IProposalData>) ?? []);
      }
    };

    fetchProposals();
  }, [client, proposalQuery.data]);

  return (
    <>
      <HeaderWrapper></HeaderWrapper>

      {isDesktop ? (
        <DashboardContent proposals={proposals} />
      ) : (
        <MobileDashboardContent proposals={proposals} />
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
};

const DashboardContent: React.FC<DashboardContentProps> = ({proposals}) => {
  return (
    <>
      <CenterWideContent>
        <ProposalSnapshot
          daoAddressOrEns={'0x1234567890abcdef1234567890abcdef12345678'}
          proposals={proposals}
          proposalLength={proposals.length}
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
}) => {
  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={'0x1234567890abcdef1234567890abcdef12345678'}
        proposals={proposals}
        proposalLength={proposals.length}
      />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
