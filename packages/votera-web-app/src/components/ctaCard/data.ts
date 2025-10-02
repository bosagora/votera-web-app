import {CreateProposal} from 'utils/paths';

import createProposalImg from '../../public/createProposal.svg';
import learnImg from '../../public/learnVotera.svg';
import buildFaster from '../../public/buildFaster.svg';
import {i18n} from '../../../i18n.config';

export type CTACardData = {
  actionAvailable: boolean;
  actionLabel: string;
  path: string;
  imgSrc: string;
  subtitle: string;
  title: string;
  // i18n keys for dynamic translation
  actionLabelKey?: string;
  subtitleKey?: string;
  titleKey?: string;
  pathKey?: string;
};

// temporary for review
const CTACards: CTACardData[] = [
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.create.actionLabel'),
    actionLabelKey: 'cta.create.actionLabel',
    path: CreateProposal,
    imgSrc: createProposalImg,
    subtitle: i18n.t('cta.create.description'),
    subtitleKey: 'cta.create.description',
    title: i18n.t('cta.create.title'),
    titleKey: 'cta.create.title',
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.grant.actionLabel'),
    actionLabelKey: 'cta.grant.actionLabel',
    path: i18n.t('explore.grant.linkURL'),
    pathKey: 'explore.grant.linkURL',
    imgSrc: buildFaster,
    subtitle: i18n.t('cta.grant.description'),
    subtitleKey: 'cta.grant.description',
    title: i18n.t('cta.grant.title'),
    titleKey: 'cta.grant.title',
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.learn.actionLabel'),
    actionLabelKey: 'cta.learn.actionLabel',
    path: i18n.t('explore.learn.linkURL'),
    pathKey: 'explore.learn.linkURL',
    imgSrc: learnImg,
    subtitle: i18n.t('cta.learn.description'),
    subtitleKey: 'cta.learn.description',
    title: i18n.t('cta.learn.title'),
    titleKey: 'cta.learn.title',
  },
];

export {CTACards};
