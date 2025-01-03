import {HeaderDao} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {BigNumber} from 'ethers';

import {useAlertContext} from 'context/alert';
import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {useGlobalModalContext} from 'context/globalModals';
import ProposalSnapshot from 'containers/proposalSnapshot';
import { ProposalListItem } from 'utils/types';

const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const daoAddressOrEns = '0x1234567890abcdef1234567890abcdef12345678';
  const {open} = useGlobalModalContext();

  const mockProposals = [
    {
      id: BigNumber.from('1'),
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '첫 번째 제안',
      description: '이것은 첫 번째 테스트 제안입니다.',
      status: 'active',
      creator: '0x1234...', 
      createdAt: new Date('2024-03-15').getTime(),
      creationDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-22'),
      votes: {
        yes: 10,
        no: 2,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-15').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false
    },
    {
      id: BigNumber.from('2'),
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '두 번째 제안',
      description: '이것은 두 번째 테스트 제안입니다.',
      status: 'pending',
      creator: '0x1234...', 
      createdAt: new Date('2024-03-16').getTime(),
      creationDate: new Date('2024-03-16'),
      endDate: new Date('2024-03-23'),
      votes: {
        yes: 5,
        no: 3,
        abstain: 0
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-16').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false
    },
    {
      id: BigNumber.from('3'),
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '세 번째 제안',
      description: '이것은 세 번째 테스트 제안입니다.',
      status: 'succeeded',
      creator: '0x1234...', 
      createdAt: new Date('2024-03-17').getTime(),
      creationDate: new Date('2024-03-17'),
      endDate: new Date('2024-03-24'),
      votes: {
        yes: 15,
        no: 1,
        abstain: 2
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-17').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false
    },
    {
      id: BigNumber.from('4'),
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '네 번째 제안',
      description: '이것은 네 번째 테스트 제안입니다.',
      status: 'defeated',
      creator: '0x1234...', 
      createdAt: new Date('2024-03-18').getTime(),
      creationDate: new Date('2024-03-18'),
      endDate: new Date('2024-03-25'),
      votes: {
        yes: 8,
        no: 14,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1,
      createdTime: new Date('2024-03-18').getTime(),
      destination: '0x...',
      value: '0',
      data: '0x',
      executed: false
    }
  ];

  return (
    <>
      <HeaderWrapper>
      </HeaderWrapper>

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

const DashboardContent: React.FC<DashboardContentProps> = ({
  proposals,
}) => {
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
