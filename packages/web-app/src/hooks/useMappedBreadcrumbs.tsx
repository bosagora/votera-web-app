import {
  IconCommunity,
  IconDashboard,
  IconFinance,
  IconGovernance,
  IconSettings,
  Tag,
  TagProps,
} from '@aragon/ui-components';
import React, {useMemo} from 'react';
import {useMatch} from 'react-router-dom';
import useBreadcrumbs, {BreadcrumbData} from 'use-react-router-breadcrumbs';

import * as Paths from 'utils/paths';
import {useCache} from './useCache';
import {ProposalStatus} from '../utils/aragon/sdk-client-common-types';

type MappedBreadcrumbs = {
  breadcrumbs: {
    path: string;
    label: string;
  }[];
  tag?: React.FunctionComponentElement<TagProps>;
  icon: JSX.Element;
};

const routes = Object.values(Paths).map(path => {
  if (path === Paths.Proposal) {
    return {path, breadcrumb: 'Proposal'};
  }
  return {path};
});

function basePathIcons(path: string) {
  if (path.includes('dashboard')) return <IconDashboard />;
  if (path.includes('community')) return <IconCommunity />;
  if (path.includes('finance')) return <IconFinance />;
  if (path.includes('settings')) return <IconSettings />;
  else return <IconGovernance />;
}

export function useMappedBreadcrumbs(): MappedBreadcrumbs {
  const {get, cache} = useCache();

  // TODO this is temporary solution to update status in navigation bar
  // This useCache should be removed in future
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const proposalStatus = useMemo(() => get('proposalStatus'), [get, cache]);
  const breadcrumbs = useBreadcrumbs(routes, {
    excludePaths: [
      Paths.Dashboard,
      Paths.NotFound,
      '/multisig-wallets/:network/:dao/governance/proposals',
      '/multisig-wallets/:network/:dao/',
      '/multisig-wallets/:network/',
      '/multisig-wallets/',
      '/',
    ],
  }).map((item: BreadcrumbData<string>) => {
    return {
      path: item.match.pathname,
      label: item.breadcrumb as string,
    };
  });

  const icon = breadcrumbs[0]
    ? basePathIcons(breadcrumbs[0].path)
    : basePathIcons('governance');

  const isProposalDetail = useMatch(Paths.Proposal) !== null;

  let tag;
  if (isProposalDetail && proposalStatus)
    tag =
      proposalStatus === ProposalStatus.EXECUTED ? (
        <Tag
          label={proposalStatus}
          colorScheme="success"
          className="capitalize"
        />
      ) : (
        <Tag label={proposalStatus} className="capitalize" />
      );

  return {breadcrumbs, icon, tag};
}
