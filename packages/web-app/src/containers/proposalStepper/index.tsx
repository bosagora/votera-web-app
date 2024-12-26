import React from 'react';
import {useFormContext, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import ConfigureActions from 'containers/configureActions';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import {useActionsContext} from 'context/actions';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';

import {useWallet} from 'hooks/useWallet';
import {Governance} from 'utils/paths';
import {actionsAreValid} from 'utils/validators';

type ProposalStepperType = {
  enableTxModal: () => void;
};

const ProposalStepper: React.FC<ProposalStepperType> = ({
  enableTxModal,
}: ProposalStepperType) => {
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();
  const {actions, addAction} = useActionsContext();
  const {open} = useGlobalModalContext();

  const {t} = useTranslation();
  const {network} = useNetwork();
  const {trigger, control, getValues, setValue} = useFormContext();
  const {address, isConnected} = useWallet();
  const [formActions] = useWatch({
    name: ['actions'],
    control,
  });

  const {errors, dirtyFields} = useFormState({
    control,
  });

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (isLoading) {
    return <Loading />;
  }

  if (!daoDetails) return null;
  return (
    <FullScreenStepper
      wizardProcessName={t('newProposal.title')}
      processType="ProposalCreation"
      navLabel={t('newProposal.title')}
      returnPath={generatePath(Governance, {network, dao: daoDetails.address})}
    >
      <Step
        wizardTitle={t('newWithdraw.defineProposal.heading')}
        wizardDescription={t('newWithdraw.defineProposal.description')}
        isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
        onNextButtonClicked={next => {
          next();
        }}
      >
        <DefineProposal />
      </Step>

      <Step
        wizardTitle={t('newWithdraw.configureWithdraw.title')}
        wizardDescription={t('newWithdraw.configureWithdraw.subtitle')}
        isNextButtonDisabled={
          !actions.length || !actionsAreValid(formActions, actions, errors)
        }
        onNextButtonClicked={next => {
          next();
        }}
      >
        <ConfigureActions
          label=""
          initialActions={['withdraw_assets']}
          whitelistedActions={['withdraw_assets']}
          hideAlert
          allowEmpty={false}
        />
      </Step>
      <Step
        wizardTitle={t('newWithdraw.reviewProposal.heading')}
        wizardDescription={t('newWithdraw.reviewProposal.description')}
        nextButtonLabel={t('labels.submitProposal')}
        onNextButtonClicked={() => {
          if (!isConnected) {
            open('wallet');
          } else {
            enableTxModal();
          }
        }}
        fullWidth
      >
        <ReviewProposal defineProposalStepNumber={1} addActionsStepNumber={3} />
      </Step>
    </FullScreenStepper>
  );
};

export default ProposalStepper;
