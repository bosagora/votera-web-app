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

  // live DAO
  const {
    data: daoDetail,
    isLoading: daoDetailLoading,
    isSuccess,
  } = useDaoQuery(daoAddressOrEns, pollInterval);

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
  const {data: tempProposals, totalCount} = useProposals(
    daoAddressOrEns,
    'multisig.plugin.dao.eth',
    4
  );

  const proposals = useMemo(() => {
    return tempProposals ? tempProposals.slice(0, 4) : [];
  }, [tempProposals]);

  return (
    <>
      <LeftWideContent>
        <ProposalSnapshot
          daoAddressOrEns={daoAddressOrEns}
          proposals={proposals}
          proposalLength={totalCount || 0}
        />
      </LeftWideContent>

      <RightNarrowContent>
        <TreasurySnapshot
          multiSignatureWalletAddress={daoAddressOrEns}
          transfers={transfers}
          totalAssetValue={totalAssetValue}
        />

        <MembersWrapper>
          <MembershipSnapshot daoAddressOrEns={daoAddressOrEns} />
        </MembersWrapper>
      </RightNarrowContent>
    </>
  );
};

// NOTE: These Containers are built SPECIFICALLY FOR >= DESKTOP SCREENS. Since
// the mobile layout is much simpler, it has it's own component.

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
  const {transfers, totalAssetValue} = useDaoVault();
  const {data: tempProposals, totalCount} = useProposals(
    daoAddressOrEns,
    'multisig.plugin.dao.eth',
    4
  );

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
      <TreasurySnapshot
        multiSignatureWalletAddress={daoAddressOrEns}
        transfers={transfers}
        totalAssetValue={totalAssetValue}
      />
      <MembershipSnapshot daoAddressOrEns={daoAddressOrEns} />
    </MobileLayout>
  );
};

const MobileLayout = styled.div.attrs({
  className: 'col-span-full space-y-5',
})``;

export default withTransaction('Dashboard', 'component')(Dashboard);
