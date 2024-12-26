import React from 'react';
import {useFormContext, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import {useNetwork} from 'context/network';
import {generatePath} from 'react-router-dom';
import {toDisplayEns} from 'utils/library';
import {Finance} from 'utils/paths';
import {SupportedVotingSettings} from 'utils/types';
import ConfigureActions from 'containers/configureActions';
import {actionsAreValid} from 'utils/validators';
import {useActionsContext} from 'context/actions';
import {WalletDetails} from 'multisig-wallet-sdk-client';

interface WithdrawStepperProps {
  enableTxModal: () => void;
  daoDetails: WalletDetails;
  pluginSettings: SupportedVotingSettings;
}

const WithdrawStepper: React.FC<WithdrawStepperProps> = ({
  enableTxModal,
  daoDetails,
  pluginSettings,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {actions, addAction} = useActionsContext();

  const {control, getValues} = useFormContext();

  const {errors, dirtyFields} = useFormState({control: control});

  const [formActions] = useWatch({
    name: ['actions'],
    control,
  });

  /*************************************************
   *                    Render                     *
   *************************************************/

  return (
    <>
      <FullScreenStepper
        wizardProcessName={t('TransferModal.item2Title')}
        navLabel={t('allTransfer.newTransfer')}
        processType="ProposalCreation"
        returnPath={generatePath(Finance, {
          network,
          dao: toDisplayEns(daoDetails?.ensDomain) || daoDetails?.address,
        })}
      >
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
            addExtraActionLabel={t(
              'newWithdraw.configureWithdraw.ctaAddAnother'
            )}
            onAddExtraActionClick={() => {
              addAction({name: 'withdraw_assets'});
            }}
            hideAlert
            allowEmpty={false}
          />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
          isNextButtonDisabled={!setupVotingIsValid(errors)}
          onNextButtonClicked={next => {
            next();
          }}
        >
          <SetupVotingForm pluginSettings={pluginSettings} />
        </Step>
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
      </FullScreenStepper>
    </>
  );
};

export default WithdrawStepper;
