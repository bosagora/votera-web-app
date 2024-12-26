import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
// import {MultisigVotingSettings} from '@aragon/sdk-client';
import {Link} from '@aragon/ui-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useNetwork} from 'context/network';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {Community} from 'utils/paths';
import {usePluginSettings} from 'hooks/usePluginSettings';
// import {PluginTypes} from 'hooks/usePluginClient';
import {IPluginSettings} from 'pages/settings';
import {MultisigVotingSettings} from '../../../utils/aragon/sdk-client-multisig-types';
import {PluginTypes} from '../../../utils/aragon/types';

const MultisigSettings: React.FC<IPluginSettings> = ({daoDetails}) => {
  const {t} = useTranslation();
  const {network} = useNetwork(); // TODO get the network from daoDetails
  const navigate = useNavigate();

  const {data: votingSettings} = usePluginSettings(
    daoDetails?.address || '',
    'multisig.plugin.dao.eth' as PluginTypes
  );

  const {data: daoMembers} = useDaoMembers(daoDetails?.address || '', '');

  const daoSettings = votingSettings as MultisigVotingSettings;

  return (
    <div className="space-y-5">
      {/* COMMUNITY SECTION */}
      <DescriptionListContainer title={t('navLinks.community')}>
        <Dl>
          <Dt>{t('labels.review.eligibleVoters')}</Dt>
          <Dd>{t('createDAO.step3.multisigMembers')}</Dd>
        </Dl>

        <Dl>
          <Dt>{t('labels.members')}</Dt>
          <Dd>
            <Link
              label={t('createDAO.review.distributionLink', {
                count: daoMembers?.members?.length,
              })}
              onClick={() =>
                navigate(
                  generatePath(Community, {network, dao: daoDetails?.address})
                )
              }
            />
          </Dd>
        </Dl>
      </DescriptionListContainer>

      {/* GOVERNANCE SECTION */}
      <DescriptionListContainer title={t('labels.review.governance')}>
        <Dl>
          <Dt>{t('labels.minimumApproval')}</Dt>
          <Dd>
            {`${daoSettings?.minApprovals} of ${daoMembers?.members.length} ${t(
              'labels.authorisedWallets'
            )}`}
          </Dd>
        </Dl>

        <Dl>
          <Dt>{t('labels.proposalCreation')}</Dt>
          <Dd>
            {daoSettings?.onlyListed
              ? t('createDAO.step3.multisigMembers')
              : t('createDAO.step3.eligibility.anyWallet.title')}
          </Dd>
        </Dl>
      </DescriptionListContainer>
    </div>
  );
};

export default MultisigSettings;
