import {IconDashboard, IconType} from '@aragon/ui-components';

import {i18n} from '../../../i18n.config';
import {Dashboard} from '../paths';

/** Time period options for token price change */
export const enum TimeFilter {
  day = 'day',
  week = 'week',
  month = 'month',
  year = 'year',
  // max = 'max',
}

export const enum TransactionState {
  WAITING = 'WAITING',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export type NavLinkData = {
  path: string;
  label: string;
  icon: IconType;
};

export const NAV_LINKS_DATA: NavLinkData[] = [
  {
    label: i18n.t('navLinks.dashboard'),
    path: Dashboard,
    icon: IconDashboard,
  },
];

export const EXPLORE_NAV_LINKS = [
  {
    label: i18n.t('navLinks.exploreLinkLabel'),
    path: i18n.t('navLinks.exploreLinkURL'),
  },
  {
    label: i18n.t('navLinks.learnLinkLabel'),
    path: i18n.t('navLinks.learnLinkURL'),
  },
  {
    label: i18n.t('navLinks.buildLinkLabel'),
    path: i18n.t('navLinks.buildLinkURL'),
  },
  {
    label: i18n.t('navLinks.helpLinkLabel'),
    path: i18n.t('navLinks.helpLinkURL'),
  },
];

export const PRIVACY_NAV_LINKS = [
  {
    label: i18n.t('navLinks.termsLinkLabel'),
    path: i18n.t('navLinks.termsLinkURL'),
  },
  {
    label: i18n.t('navLinks.privacyLinkLabel'),
    path: i18n.t('navLinks.privacyLinkURL'),
  },
];

export const enum TransferTypes {
  Deposit = 'VaultDeposit',
  Withdraw = 'VaultWithdraw',
}

// date time
export const HOURS_IN_DAY = 24;
export const MINS_IN_HOUR = 60;
export const MINS_IN_DAY = HOURS_IN_DAY * MINS_IN_HOUR;

export const PROPOSAL_STATE_LABELS = [
  i18n.t('governance.proposals.states.draft'),
  i18n.t('governance.proposals.states.pending'),
  i18n.t('governance.proposals.states.active'),
  i18n.t('governance.proposals.states.executed'),
  i18n.t('governance.proposals.states.succeeded'),
  i18n.t('governance.proposals.states.defeated'),
];

// Storage and cacheing keys
export const FAVORITE_VOTERA_PROPOSAL_KEY = 'favoriteVoteraProposals';
