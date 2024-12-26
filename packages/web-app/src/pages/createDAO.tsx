import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useMemo} from 'react';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {MultisigWalletField} from 'components/multisigWallets/row';
import ConfigureCommunity from 'containers/configureCommunity';
import {OverviewDAOHeader, OverviewDAOStep} from 'containers/daoOverview';
import DefineMetadata from 'containers/defineMetadata';
import GoLive, {GoLiveFooter, GoLiveHeader} from 'containers/goLive';
import SelectChain from 'containers/selectChainForm';
import SetupCommunity from 'containers/setupCommunity';
import {CreateDaoProvider} from 'context/createDao';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {htmlIn} from 'utils/htmlIn';
import {Landing} from 'utils/paths';

export type CreateDaoFormData = {
  blockchain: {
    id: number;
    label: string;
    network: string;
  };
  daoName: string;
  daoSummary: string;
  multisigWallets: MultisigWalletField[];
  multisigMinimumApprovals: number;
};

const defaultValues = {};

const CreateDAO: React.FC = () => {
  const {t} = useTranslation();
  const {chainId} = useWallet();
  const {network, setNetwork} = useNetwork();
  const formMethods = useForm<CreateDaoFormData>({
    mode: 'onChange',
    defaultValues,
  });
  const {errors, dirtyFields} = useFormState({control: formMethods.control});
  const [multisigWallets, daoName] = useWatch({
    control: formMethods.control,
    name: ['multisigWallets', 'daoName'],
  });

  // Note: The wallet network determines the expected network when entering
  // the flow so that the process is more convenient for already logged in
  // users and so that the process doesn't start with a warning. Afterwards,
  // the select blockchain form dictates the expected network
  useEffect(() => {
    // get the default expected network using the connected wallet, use ethereum
    // mainnet in case user accesses the flow without wallet connection. Ideally,
    // this should not happen

    let defaultNetwork = getSupportedNetworkByChainId(chainId);
    if (defaultNetwork === undefined) defaultNetwork = 'bosagora_mainnet';
    setNetwork(defaultNetwork);

    // set the default value in the form
    formMethods.setValue('blockchain', {
      id: CHAIN_METADATA[defaultNetwork].id,
      label: CHAIN_METADATA[defaultNetwork].name,
      network: CHAIN_METADATA[defaultNetwork].testnet ? 'test' : 'main',
    });
  }, [chainId, formMethods, setNetwork]);

  /*************************************************
   *             Step Validation States            *
   *************************************************/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daoMetadataIsValid = useMemo(() => {
    // required fields not dirty
    if (!daoName) return false;

    return !(errors.daoName || errors.daoSummary);
  }, [daoName, dirtyFields.daoSummary, errors.daoName, errors.daoSummary]);

  const daoSetupCommunityIsValid = useMemo(() => {
    return multisigWallets?.length > 0 && !errors.multisigWallets;
  }, [multisigWallets, errors.multisigWallets]);

  const daoConfigureCommunityIsValid = useMemo(() => {
    if (errors.multisigMinimumApprovals) return false;
    return true;
  }, [errors.multisigMinimumApprovals]);

  const handleNextButtonTracking = (
    next: () => void,
    stepName: string,
    properties: Record<string, unknown>
  ) => {
    // trackEvent('daoCreation_continueBtn', {
    //   step: stepName,
    //   settings: properties,
    // });
    next();
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <CreateDaoProvider>
        <FullScreenStepper
          wizardProcessName={t('createDAO.title')}
          navLabel={t('createDAO.title')}
          returnPath={Landing}
          processType="DaoCreation"
        >
          <Step
            fullWidth
            hideWizard
            customHeader={
              <OverviewDAOHeader
                navLabel={t('createDAO.title')}
                returnPath={Landing}
              />
            }
            customFooter={<></>}
          >
            <OverviewDAOStep />
          </Step>
          <Step
            wizardTitle={t('createDAO.step1.title')}
            wizardDescription={htmlIn(t)('createDAO.step1.description')}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '1_select_blockchain', {
                network: formMethods.getValues('blockchain')?.network,
              })
            }
          >
            <SelectChain />
          </Step>
          <Step
            wizardTitle={t('createDAO.step2.title')}
            wizardDescription={htmlIn(t)('createDAO.step2.description')}
            isNextButtonDisabled={!daoMetadataIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '2_define_metadata', {
                dao_name: formMethods.getValues('daoName'),
                dao_summary: formMethods.getValues('daoSummary'),
              })
            }
          >
            <DefineMetadata />
          </Step>
          <Step
            wizardTitle={t('createDAO.step3.title')}
            wizardDescription={htmlIn(t)(
              'createDAO.step3.authorisedWalletsSubtitle'
            )}
            isNextButtonDisabled={!daoSetupCommunityIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '3_setup_community', {
                multisigWallets: formMethods.getValues('multisigWallets'),
              })
            }
          >
            <SetupCommunity />
          </Step>
          <Step
            wizardTitle={t('createDAO.step4.title')}
            wizardDescription={htmlIn(t)('createDAO.step4.description')}
            isNextButtonDisabled={!daoConfigureCommunityIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '4_configure_governance', {
                multisig_minimum_approvals: formMethods.getValues(
                  'multisigMinimumApprovals'
                ),
              })
            }
          >
            <ConfigureCommunity />
          </Step>
          <Step
            hideWizard
            fullWidth
            customHeader={<GoLiveHeader />}
            customFooter={<GoLiveFooter />}
          >
            <GoLive />
          </Step>
        </FullScreenStepper>
      </CreateDaoProvider>
    </FormProvider>
  );
};

export default withTransaction('CreateDAO', 'component')(CreateDAO);
