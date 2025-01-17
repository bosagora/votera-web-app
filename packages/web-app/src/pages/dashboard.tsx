import {HeaderDao} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect} from 'react';
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
import {SortType} from 'votera-sdk-client';

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const daoAddressOrEns = '0x1234567890abcdef1234567890abcdef12345678';
  const {open} = useGlobalModalContext();
  const {client} = useClient2();

  useEffect(() => {
    const fetchProposals = async () => {
      const proposalCount = await client?.methods.getProposalLength();
      console.log('fetched proposal count :', proposalCount);

      const proposals = await client?.methods.getProposalList(
        0,
        10,
        SortType.ASC
      );
      console.log('fetched proposals :', proposals);
    };

    fetchProposals();
  }, [client]);

  const mockProposals = [
    {
      id: '0xd000322295848b860447b090b2a1e5e9e26f398304ed6a96dd787c36bc397655',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO',
      },
      title: '첫 번째 제안',
      description: '이것은 첫 번째 테스트 제안입니다.',
      phase: ProposalPhase.VOTE,
      creator: '0x1234...',
      beginAssess: new Date('2024-03-15').getTime(),
      endAssess: new Date('2024-03-22').getTime(),
      beginVote: new Date('2024-03-22').getTime(),
      endVote: new Date('2024-03-29').getTime(),
      votes: {
        yes: 10,
        no: 2,
        abstain: 1,
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-15').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false,
    },
    {
      id: BigNumber.from('2'),
      dao: {
        address: daoAddressOrEns,
        name: 'Test DAO',
      },
      title: 'Second Proposal for Treasury Management',
      description:
        'This is the second test proposal that aims to improve our treasury management process.',
      phase: ProposalPhase.ASSESSMENT,
      creator: '0x1234...',
      beginAssess: new Date('2024-03-16').getTime(),
      endAssess: new Date('2024-03-23').getTime(),
      beginVote: new Date('2024-03-23').getTime(),
      endVote: new Date('2024-03-30').getTime(),
      votes: {
        yes: 5,
        no: 3,
        abstain: 0,
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-16').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false,
    },
    {
      id: BigNumber.from('3'),
      dao: {
        address: daoAddressOrEns,
        name: 'Test DAO',
      },
      title: 'Third Proposal',
      description: 'This is the third test proposal.',
      phase: ProposalPhase.EXECUTION,
      creator: '0x1234...',
      beginAssess: new Date('2024-03-17').getTime(),
      endAssess: new Date('2024-03-24').getTime(),
      beginVote: new Date('2024-03-24').getTime(),
      endVote: new Date('2024-03-31').getTime(),
      votes: {
        yes: 15,
        no: 1,
        abstain: 2,
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-17').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false,
    },
    {
      id: BigNumber.from('4'),
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO',
      },
      title: '네 번째 제안',
      description: '이것은 네 번째 테스트 제안입니다.',
      phase: ProposalPhase.FINISHED,
      creator: '0x1234...',
      beginAssess: new Date('2024-03-18').getTime(),
      endAssess: new Date('2024-03-25').getTime(),
      beginVote: new Date('2024-03-25').getTime(),
      endVote: new Date('2024-04-01').getTime(),
      votes: {
        yes: 8,
        no: 14,
        abstain: 1,
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-18').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false,
    },
  ];

  return (
    <>
      <HeaderWrapper></HeaderWrapper>

      {isDesktop ? (
        <DashboardContent proposals={mockProposals} />
      ) : (
        <MobileDashboardContent proposals={mockProposals} />
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
  proposals: Array<ProposalListItem>;
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
