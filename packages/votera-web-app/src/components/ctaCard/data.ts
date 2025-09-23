import {CreateProposal} from 'utils/paths';

import createProposalImg from '../../public/createProposal.svg';
import learnImg from '../../public/learnVotera.svg';
import buildFaster from '../../public/buildFaster.svg';
import {i18n} from '../../../i18n.config';

// temporary for review
const CTACards = [
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.create.actionLabel'),
    path: CreateProposal,
    imgSrc: createProposalImg,
    subtitle: i18n.t('cta.create.description'),
    title: i18n.t('cta.create.title'),
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.grant.actionLabel'),
    path: i18n.t('explore.grant.linkURL'),
    imgSrc: buildFaster,
    subtitle: i18n.t('cta.grant.description'),
    title: i18n.t('cta.grant.title'),
  },
  {
    actionAvailable: true,
    actionLabel: i18n.t('cta.learn.actionLabel'),
    path: i18n.t('explore.learn.linkURL'),
    imgSrc: learnImg,
    subtitle: i18n.t('cta.learn.description'),
    title: i18n.t('cta.learn.title'),
  },
];

export {CTACards};
