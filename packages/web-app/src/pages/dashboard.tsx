import {HeaderDao} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {MembershipSnapshot} from 'containers/membershipSnapshot';
import TreasurySnapshot from 'containers/treasurySnapshot';
import {useAlertContext} from 'context/alert';
import {NavigationDao} from 'context/apolloClient';
import {useNetwork} from 'context/network';
import {useDaoQuery} from 'hooks/useDaoDetails';
import {
  useAddFavoriteDaoMutation,
  useFavoritedDaosQuery,
  useRemoveFavoriteDaoMutation,
} from 'hooks/useFavoritedDaos';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, SupportedChainID} from 'utils/constants';
import {formatDate} from 'utils/date';
import {NotFound} from 'utils/paths';
import {useGlobalModalContext} from 'context/globalModals';
import {useDaoVault} from '../hooks/useDaoVault';
import ProposalSnapshot from 'containers/proposalSnapshot';
import {useProposals} from '../hooks/useProposals';
const Dashboard: React.FC = () => {
  const {t} = useTranslation();
  const {alert} = useAlertContext();
  const {isDesktop, isMobile} = useScreen();

  const navigate = useNavigate();
  const {network} = useNetwork();
  const {dao: daoAddressOrEns} = useParams();
  const {open} = useGlobalModalContext();

  const [pollInterval, setPollInterval] = useState(0);
  // favoring DAOS
  const addFavoriteDaoMutation = useAddFavoriteDaoMutation(() =>
    alert(t('alert.chip.favorited'))
  );

  const removeFavoriteDaoMutation = useRemoveFavoriteDaoMutation(() =>
    alert(t('alert.chip.unfavorite'))
  );

  const {data: favoritedDaos, isLoading: favoritedDaosLoading} =
    useFavoritedDaosQuery();

  // Mock 데이터 추가
  const mockDaoDetail = {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    chain: 1,
    creationDate: new Date('2023-01-01'),
    metadata: {
      name: '테스트 DAO',
      description: '이것은 테스트 목적의 DAO입니다.',
      avatar: 'https://example.com/avatar.png',
    },
    plugins: [
      {
        id: 'multisig.plugin.dao.eth',
        instanceAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      }
    ]
  };

  // Mock 제안 데이터 추가
  const mockProposals = [
    {
      id: 'proposal-1',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '첫 번째 제안',
      description: '이것은 첫 번째 테스트 제안입니다.',
      status: 'active',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-22'),
      votes: {
        yes: 10,
        no: 2,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-2',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '두 번째 제안',
      description: '이것은 두 번째 테스트 제안입니다.',
      status: 'pending',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-16'),
      endDate: new Date('2024-03-23'),
      votes: {
        yes: 5,
        no: 3,
        abstain: 0
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-3',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '세 번째 제안',
      description: '이것은 세 번째 테스트 제안입니다.',
      status: 'succeeded',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-17'),
      endDate: new Date('2024-03-24'),
      votes: {
        yes: 15,
        no: 1,
        abstain: 2
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-4',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '네 번째 제안',
      description: '이것은 네 번째 테스트 제안입니다.',
      status: 'defeated',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-18'),
      endDate: new Date('2024-03-25'),
      votes: {
        yes: 8,
        no: 14,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    }
  ];

  // useDaoQuery 호출 부분 교체
  const {
    data: daoDetail = mockDaoDetail, // 기본값으로 mock 데이터 사용
    isLoading: daoDetailLoading = false,
    isSuccess = true,
  } = {
    // useDaoQuery(daoAddressOrEns, pollInterval) 대신 mock 객체 반환
  };

  // useProposals 호출 부분 교체
  const {
    data: tempProposals = mockProposals,
    totalCount = mockProposals.length
  } = {
    // useProposals(daoAddressOrEns, 'multisig.plugin.dao.eth', 4) 대신 mock 객체 반환
  };

  const favoriteDaoMatchPredicate = useCallback(
    (favoriteDao: NavigationDao) => {
      return (
        favoriteDao.address.toLowerCase() ===
          daoDetail?.address.toLowerCase() &&
        favoriteDao.chain === CHAIN_METADATA[network].id
      );
    },
    [daoDetail?.address, network]
  );

  const isFavoritedDao = useMemo(() => {
    if (daoDetail?.address && favoritedDaos)
      return Boolean(favoritedDaos.some(favoriteDaoMatchPredicate));
    else return false;
  }, [favoriteDaoMatchPredicate, favoritedDaos, daoDetail?.address]);

  /*************************************************
   *                    Hooks                      *
   *************************************************/
  /*************************************************
   *                    Handlers                   *
   *************************************************/

  const handleClipboardActions = useCallback(async () => {
    await navigator.clipboard.writeText(
      `${window.location.origin}/#/multisig-wallets/${network}/${daoAddressOrEns}`
    );
    alert(t('alert.chip.inputCopied'));
  }, [alert, daoAddressOrEns, network, t]);

  const handleFavoriteClick = useCallback(
    async (dao: NavigationDao) => {
      try {
        if (isFavoritedDao) {
          await removeFavoriteDaoMutation.mutateAsync({dao});
        } else {
          await addFavoriteDaoMutation.mutateAsync({dao});
        }
      } catch (error) {
        const action = isFavoritedDao
          ? 'removing DAO from favorites'
          : 'adding DAO to favorites';

        console.error(`Error ${action}`, error);
      }
    },
    [isFavoritedDao, removeFavoriteDaoMutation, addFavoriteDaoMutation]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (daoDetailLoading || favoritedDaosLoading) {
    return <Loading />;
  }
  console.log('isDesktop : ', isDesktop)
  if (daoDetail && daoAddressOrEns) {
    return (
      <>
        <HeaderWrapper>
          <HeaderDao
            daoName={daoDetail.metadata.name}
            daoUrl={`${window.location.origin}/#/multisig-wallets/${network}/${daoAddressOrEns}`}
            description={daoDetail.metadata.description}
            created_at={formatDate(
              daoDetail.creationDate.getTime() / 1000,
              'MMMM yyyy'
            ).toString()}
            daoChain={network}
            favorited={isFavoritedDao}
            copiedOnClick={handleClipboardActions}
            onFavoriteClick={() =>
              handleFavoriteClick({
                address: daoDetail.address.toLowerCase(),
                chain: daoDetail.chain as SupportedChainID,
                metadata: {
                  name: daoDetail.metadata.name,
                  description: daoDetail.metadata.description,
                },
              })
            }
          />
        </HeaderWrapper>

        {isDesktop ? (
          <DashboardContent daoAddressOrEns={daoAddressOrEns} />
        ) : (
          <MobileDashboardContent daoAddressOrEns={daoAddressOrEns} />
        )}
        {/* <DashboardContent daoAddressOrEns={daoAddressOrEns} /> */}
      </>
    );
  } else if (!daoDetail) {
    // if DAO isn't loading and there is no pending or live DAO, then
    // navigate to notFound
    navigate(NotFound, {
      replace: true,
      state: {incorrectDao: daoAddressOrEns},
    });
  }

  return null;
};

const HeaderWrapper = styled.div.attrs({
  className:
    'w-screen -mx-2 tablet:col-span-full tablet:w-full tablet:mx-0 desktop:col-start-2 desktop:col-span-10 tablet:mt-3',
})``;

/* DESKTOP DASHBOARD ======================================================== */

type DashboardContentProps = {
  daoAddressOrEns: string;
};

const DashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
}) => {
  const {transfers, totalAssetValue} = useDaoVault();
  const mockProposals = [
    {
      id: 'proposal-1',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '첫 번째 제안',
      description: '이것은 첫 번째 테스트 제안입니다.',
      status: 'active',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-22'),
      votes: {
        yes: 10,
        no: 2,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-2',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '두 번째 제안',
      description: '이것은 두 번째 테스트 제안입니다.',
      status: 'pending',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-16'),
      endDate: new Date('2024-03-23'),
      votes: {
        yes: 5,
        no: 3,
        abstain: 0
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-3',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '세 번째 제안',
      description: '이것은 세 번째 테스트 제안입니다.',
      status: 'succeeded',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-17'),
      endDate: new Date('2024-03-24'),
      votes: {
        yes: 15,
        no: 1,
        abstain: 2
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-4',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '네 번째 제안',
      description: '이것은 네 번째 테스트 제안입니다.',
      status: 'defeated',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-18'),
      endDate: new Date('2024-03-25'),
      votes: {
        yes: 8,
        no: 14,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    }
  ];
  
  // useProposals 호출 부분 교체
  const {
    data: tempProposals = mockProposals,
    totalCount = mockProposals.length
  } = {
    // useProposals(daoAddressOrEns, 'multisig.plugin.dao.eth', 4) 대신 mock 객체 반환
  };

  const proposals = useMemo(() => {
    return tempProposals ? tempProposals.slice(0, 4) : [];
  }, [tempProposals]);

  return (
    <>
      <CenterWideContent>
        <ProposalSnapshot
          daoAddressOrEns={daoAddressOrEns}
          proposals={proposals}
          proposalLength={totalCount || 0}
        />
      </CenterWideContent>

      {/* <RightNarrowContent>
        <TreasurySnapshot
          multiSignatureWalletAddress={daoAddressOrEns}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />

        <MembersWrapper>
          <MembershipSnapshot daoAddressOrEns={daoAddressOrEns} />
        </MembersWrapper>
      </RightNarrowContent> */}
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

const CenterWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-10',
})``;

const LeftWideContent = styled.div.attrs({
  className: 'desktop:space-y-5 desktop:col-start-2 desktop:col-span-6',
})``;

const RightNarrowContent = styled.div.attrs({
  className: 'desktop:col-start-8 desktop:col-span-4 desktop:space-y-3',
})``;

const EqualDivide = styled.div.attrs({
  className:
    'desktop:col-start-2 desktop:col-span-10 desktop:flex desktop:space-x-3',
})``;

const MembersWrapper = styled.div.attrs({
  className: 'desktop:col-start-2 desktop:col-span-10',
})``;

/* MOBILE DASHBOARD CONTENT ================================================= */

const MobileDashboardContent: React.FC<DashboardContentProps> = ({
  daoAddressOrEns,
}) => {
  // const {transfers, totalAssetValue} = useDaoVault();
  const mockProposals = [
    {
      id: 'proposal-1',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '첫 번째 제안',
      description: '이것은 첫 번째 테스트 제안입니다.',
      status: 'active',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-15'),
      endDate: new Date('2024-03-22'),
      votes: {
        yes: 10,
        no: 2,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-2',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '두 번째 제안',
      description: '이것은 두 번째 테스트 제안입니다.',
      status: 'pending',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-16'),
      endDate: new Date('2024-03-23'),
      votes: {
        yes: 5,
        no: 3,
        abstain: 0
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-3',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '세 번째 제안',
      description: '이것은 세 번째 테스트 제안입니다.',
      status: 'succeeded',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-17'),
      endDate: new Date('2024-03-24'),
      votes: {
        yes: 15,
        no: 1,
        abstain: 2
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    },
    {
      id: 'proposal-4',
      dao: {
        address: daoAddressOrEns,
        name: '테스트 DAO'
      },
      title: '네 번째 제안',
      description: '이것은 네 번째 테스트 제안입니다.',
      status: 'defeated',
      creator: '0x1234...', 
      creationDate: new Date('2024-03-18'),
      endDate: new Date('2024-03-25'),
      votes: {
        yes: 8,
        no: 14,
        abstain: 1
      },
      executionTxHash: '0x...',
      approval: ['0x...'],
      minApprovals: 1
    }
  ];

  // useProposals 호출을 mock 데이터로 대체
  const {
    data: tempProposals = mockProposals,
    totalCount = mockProposals.length
  } = {
    // useProposals(daoAddressOrEns, 'multisig.plugin.dao.eth', 4) 대신 mock 객체 반환
  };

  const proposals = useMemo(() => {
    return tempProposals ? tempProposals.slice(0, 4) : [];
  }, [tempProposals]);

  return (
    <MobileLayout>
      <ProposalSnapshot
        daoAddressOrEns={daoAddressOrEns}
        proposals={proposals}
        proposalLength={totalCount || 0}
      />
      {/* <TreasurySnapshot
        multiSignatureWalletAddress={daoAddressOrEns}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot daoAddressOrEns={daoAddressOrEns} /> */}
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
