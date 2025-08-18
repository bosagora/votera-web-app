import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useMemo} from 'react';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {
  OverviewProposalHeader,
  OverviewProposalStep,
} from '../containers/proposalOverview';
import DefineMetadata from 'containers/defineMetadata';
import GoLive, {GoLiveFooter, GoLiveHeader} from '../containers/goLive';
import SelectChain from 'containers/selectChainForm';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {htmlIn} from 'utils/htmlIn';
import {Landing} from 'utils/paths';

import {BigNumber} from 'ethers';
import {CreateProposalProvider} from 'context/createProposal';
import SetupProposal from 'containers/setupProposal';
import {defaultAbiCoder} from '@ethersproject/abi';
import {keccak256} from '@ethersproject/keccak256';
import {randomBytes} from '@ethersproject/random';
import {trackEvent} from 'services/analytics';

const getRandomId = () => {
  const encodedResult = defaultAbiCoder.encode(
    ['bytes32', 'bytes32'],
    [randomBytes(32), randomBytes(32)]
  );
  return keccak256(encodedResult);
};

export enum ProposalType {
  SYSTEM,
  FUND,
}

export enum SystemProposalType {
  NORMAL,
  PARAMETER,
}

export type CreateProposalFormData = {
  blockchain: {
    id: number;
    label: string;
    network: string;
  };
  proposalType: ProposalType;
  proposer: string;
  title: string;
  description: string;
  proposalId: string;
  fundAmount: BigNumber;
  assessmentPeriod: number;
  votePeriod: number;
  documentId: string;
  file: File | null;
  systemType: SystemProposalType;
  params: any[];
};

const CreateProposal: React.FC = () => {
  const {t} = useTranslation();
  const {network, setNetwork} = useNetwork();
  const {address, chainId} = useWallet();

  const defaultValues: CreateProposalFormData = {
    blockchain: {
      id: CHAIN_METADATA[network].id,
      label: CHAIN_METADATA[network].name,
      network: CHAIN_METADATA[network].testnet ? 'test' : 'main',
    },
    proposalType: ProposalType.FUND,
    proposer: address || '',
    title: 'test',
    description: 'test',
    proposalId: getRandomId(),
    fundAmount: BigNumber.from(0),
    assessmentPeriod: 7,
    votePeriod: 14,
    documentId: '',
    file: null,
    systemType: SystemProposalType.NORMAL,
    params: [],
  };

  const formMethods = useForm<CreateProposalFormData>({
    mode: 'onChange',
    defaultValues,
  });
  const {errors, dirtyFields} = useFormState({control: formMethods.control});
  const [title, proposalId] = useWatch({
    control: formMethods.control,
    name: ['title', 'proposalId'],
  });
  const watchedValues = useWatch({control: formMethods.control});
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

  useEffect(() => {
    console.log('Form values changed:', watchedValues);
  }, [watchedValues]); // watchedValues가 변경될 때마다 실행

  /*************************************************
   *             Step Validation States            *
   *************************************************/

  const handleNextButtonTracking = (
    next: () => void,
    stepName: string,
    properties: Record<string, unknown>
  ) => {
    trackEvent('daoCreation_continueBtn', {
      step: stepName,
      settings: properties,
    });
    next();
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <CreateProposalProvider>
        <FullScreenStepper
          wizardProcessName={t('createProposal.title') as string}
          navLabel={t('createProposal.title') as string}
          returnPath={Landing}
          processType="DaoCreation"
        >
          <Step
            fullWidth
            hideWizard
            customHeader={
              <OverviewProposalHeader
                navLabel={t('createProposal.title')}
                returnPath={Landing}
              />
            }
            customFooter={<></>}
          >
            <OverviewProposalStep />
          </Step>
          <Step
            wizardTitle={t('createProposal.step1.title')}
            wizardDescription={htmlIn(t)('createProposal.step1.description')}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '1_select_blockchain', {
                network: formMethods.getValues('blockchain')?.network,
              })
            }
          >
            <SelectChain />
          </Step>
          <Step
            wizardTitle={t('createProposal.step2.title')}
            wizardDescription={htmlIn(t)('createProposal.step2.description')}
            isNextButtonDisabled={
              !formMethods.getValues('title') ||
              !formMethods.getValues('description') ||
              !formMethods.getValues('documentId')
            }
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '2_define_metadata', {
                proposalType: formMethods.getValues('proposalType'),
                title: formMethods.getValues('title'),
                description: formMethods.getValues('description'),
                documentId: formMethods.getValues('documentId'),
              })
            }
          >
            <DefineMetadata />
          </Step>
          <Step
            wizardTitle={t('createDAO2.step3.title')}
            wizardDescription={htmlIn(t)('createDAO2.step3.description')}
            isNextButtonDisabled={
              !formMethods.getValues('votePeriod') ||
              (formMethods.getValues('proposalType') === ProposalType.FUND &&
                (!formMethods.getValues('assessmentPeriod') ||
                  !BigNumber.from(formMethods.getValues('fundAmount')).gt(0)))
            }
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '3_setup_proposal', {
                assessmentPeriod: formMethods.getValues('assessmentPeriod'),
                votePeriod: formMethods.getValues('votePeriod'),
                fundAmount: formMethods.getValues('fundAmount'),
              })
            }
          >
            <SetupProposal />
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
      </CreateProposalProvider>
    </FormProvider>
  );
};

export default withTransaction('CreateProposal', 'component')(CreateProposal);
