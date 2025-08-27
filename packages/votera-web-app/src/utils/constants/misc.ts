import {IconDashboard, IconType} from 'votera-ui-components';

import {i18n} from '../../../i18n.config';
import {Dashboard} from '../paths';

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
