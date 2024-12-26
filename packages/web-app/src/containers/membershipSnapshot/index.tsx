import {
  ButtonText,
  IconChevronRight,
  IconCommunity,
  ListItemHeader,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {MembersList} from 'components/membersList';
import {Loading} from 'components/temporary';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
// import {PluginTypes} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {
  Community,
  ManageMembersProposal,
  MintTokensProposal,
} from 'utils/paths';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
// import {useExistingToken} from 'hooks/useExistingToken';
// import {useGovTokensWrapping} from 'context/govTokensWrapping';

type Props = {
  daoAddressOrEns: string;
  pluginType?: string;
  horizontal?: boolean;
};

export const MembershipSnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  pluginType = 'multisig.plugin.dao.eth',
  horizontal = false,
}) => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork(); // TODO ensure this is the dao network
  const {isDesktop} = useScreen();
  //console.log('isDesktop :', isDesktop);
  // const {handleOpenModal} = useGovTokensWrapping();

  const {
    data: {members},
    isLoading,
  } = useDaoMembers(daoAddressOrEns, pluginType);
  const totalMemberCount = members.length;

  // const {data: daoDetails} = useDaoDetailsQuery();

  // const {isDAOTokenWrapped, isTokenMintable} = useExistingToken({
  //   daoToken,
  //   daoDetails,
  // });
  //
  const walletBased = pluginType === 'multisig.plugin.dao.eth';

  const headerButtonHandler = () => {
    generatePath(ManageMembersProposal, {network, dao: daoAddressOrEns});
  };

  if (isLoading) return <Loading />;

  if (members.length === 0) return null;

  //console.log('horizontal && isDesktop :', horizontal && isDesktop);
  if (horizontal && isDesktop) {
    return (
      <div className="flex space-x-3">
        <div className="w-1/3">
          <ListItemHeader
            icon={<IconCommunity />}
            value={`${totalMemberCount} ${t('labels.members')}`}
            label={
              walletBased
                ? t('explore.explorer.walletBased')
                : t('explore.explorer.tokenBased')
            }
            buttonText={
              // walletBased ? t('labels.manageMember') : t('labels.seeCommunity')
              ''
            }
            orientation="vertical"
            onClick={headerButtonHandler}
          />
        </div>
        <div className="space-y-2 w-2/3">
          <ListItemGrid>
            <MembersList members={members} />
          </ListItemGrid>
          <ButtonText
            css={{}}
            mode="secondary"
            size="large"
            iconRight={<IconChevronRight />}
            label={t('labels.seeAll')}
            onClick={() =>
              navigate(generatePath(Community, {network, dao: daoAddressOrEns}))
            }
          />
        </div>
      </div>
    );
  }

  return (
    <VerticalContainer>
      <ListItemHeader
        icon={<IconCommunity />}
        value={`${totalMemberCount} ${t('labels.members')}`}
        label={
          walletBased
            ? t('explore.explorer.walletBased')
            : t('explore.explorer.tokenBased')
        }
        buttonText={
          // walletBased ? t('labels.manageMember') : t('labels.seeCommunity')
          ''
        }
        orientation="vertical"
        onClick={headerButtonHandler}
      />
      <MembersList members={members.slice(0, 3)} />
      <ButtonText
        css={{}}
        mode="secondary"
        size="large"
        iconRight={<IconChevronRight />}
        label={t('labels.seeAll')}
        onClick={() =>
          navigate(generatePath(Community, {network, dao: daoAddressOrEns}))
        }
      />
    </VerticalContainer>
  );
};

const VerticalContainer = styled.div.attrs({
  className: 'space-y-1.5 desktop:space-y-2',
})``;

const ListItemGrid = styled.div.attrs({
  className:
    'desktop:grid desktop:grid-cols-2 desktop:grid-flow-row desktop:gap-2',
})``;
