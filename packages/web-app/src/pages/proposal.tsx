// import {useApolloClient} from '@apollo/client';
// import {
//   // MultisigClient,
//   // MultisigProposal,
//   // TokenVotingClient,
//   // TokenVotingProposal,
//   // VoteValues,
//   // VotingMode,
// } from '@aragon/sdk-client';
import {MultisigProposal} from '../utils/aragon/sdk-client-multisig-types';
import {VoteValues} from '../utils/aragon/sdk-client-multisig-types';
import {VotingMode} from '../utils/aragon/sdk-client-multisig-types';
import {DaoAction, ProposalStatus} from 'utils/aragon/sdk-client-common-types';
import {
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  WidgetStatus,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
// import TipTapLink from '@tiptap/extension-link';
// import {useEditor} from '@tiptap/react';
// import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
// import sanitizeHtml from 'sanitize-html';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useSpecificProvider} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {MultisigMember, useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
// import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
// import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {CHAIN_METADATA} from 'utils/constants';
import {
  // decodeAddMembersToAction,
  // decodeMetadataToAction,
  // decodeMintTokensToAction,
  // decodeMultisigSettingsToAction,
  // decodePluginSettingsToAction,
  // decodeRemoveMembersToAction,
  // decodeToExternalAction,
  decodeWithdrawToAction,
  formatUnits,
  shortenAddress,
  toDisplayEns,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  // getLiveProposalTerminalProps,
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getVoteButtonLabel,
  getVoteStatus,
  // isEarlyExecutable,
  // isErc20VotingProposal,
  isMultisigProposal,
  stripPlgnAdrFromProposalId,
} from 'utils/proposals';
import {
  Action,
  ActionWithdraw,
  DetailedProposal,
  ProposalId,
} from 'utils/types';
import {PluginTypes} from '../utils/aragon/types';
// import {wallet} from '@aragon/ui-components/dist/components/illustrations/object';
import {format} from 'date-fns';
import {getFormattedUtcOffset, KNOWN_FORMATS} from '../utils/date';
// import {
//   ABIStorage,
//   ISmartContractFunctionData,
// } from 'multisig-wallet-sdk-client';
// import {fetchBalance, getTokenInfo, isNativeToken} from '../utils/tokens';
// import {constants} from 'ethers';
import {useWalletCanVote} from '../hooks/useWalletCanVote';
import {useLoadTokenLogoURL} from '../hooks/useDaoBalances';

// TODO: @Sepehr Please assign proper tags on action decoding
// const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;
const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const NumberFormatter = new Intl.NumberFormat('en-US');

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();

  const {dao, id: urlId} = useParams();
  const proposalId = useMemo(
    () => (urlId ? new ProposalId(urlId) : undefined),
    [urlId]
  );
  const {getImgUrl} = useLoadTokenLogoURL();
  // console.log('>>>>> tokenList :', tokenList)

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const {
    data: {members: daoMemebers},
    isLoading,
  } = useDaoMembers(daoDetails?.address || '', 'multisig.plugin.dao.eth');

  const {data: daoSettings} = usePluginSettings(
    daoDetails?.address as string,
    'multisig.plugin.dao.eth' as PluginTypes
  );
  // const {
  //   data: {members},
  // } = useDaoMembers(daoDetails?.address || '', 'multisig.plugin.dao.eth');
  //
  const multisigDAO = true;

  const allowVoteReplacement = false;
  // isTokenVotingSettings(daoSettings) &&
  // daoSettings.votingMode === VotingMode.VOTE_REPLACEMENT;

  const {client} = useClient();
  const {set, get} = useCache();
  // const apolloClient = useApolloClient();

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [voteStatus, setVoteStatus] = useState('');
  const [intervalInMills, setIntervalInMills] = useState(0);
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    pluginAddress,
    pluginType,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = useProposalTransactionContext();

  // console.log('voteSubmitted :', voteSubmitted);

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useDaoProposal(
    daoDetails?.address as string,
    proposalId!,
    pluginType,
    pluginAddress,
    intervalInMills
  );
  // const midday = useMemo(() => {
  //   const hours = Number(value?.match(/^(\d+)/)?.[1]);
  //   return hours > 11 ? 'pm' : 'am';
  // }, [value]);
  // const proposal = useMemo(() => {
  //   console.log('tempProposal : ', tempProposal)
  //   return tempProposal ?  tempProposal.slice(0, 5);
  // }, [tempProposal]);
  const {data: canVote} = useWalletCanVote(
    address,
    daoMemebers,
    proposal?.approval,
    proposal?.executed
  );
  // const canVote = true;
  // console.log('canVote >>>> :', canVote);

  // const pluginClient = usePluginClient(pluginType);

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

  // const editor = useEditor({
  //   editable: false,
  //   extensions: [
  //     StarterKit,
  //     TipTapLink.configure({
  //       openOnClick: false,
  //     }),
  //   ],
  // });

  /*************************************************
   *                     Hooks                     *
   *************************************************/

  // set editor data
  // useEffect(() => {
  //   if (proposal && editor) {
  //     editor.commands.setContent(
  //       // Default list of allowed tags and attributes - https://www.npmjs.com/package/sanitize-html#default-options
  //       sanitizeHtml(proposal.metadata.description, {
  //         // the disallowedTagsMode displays the disallowed tags to be rendered as a string
  //         disallowedTagsMode: 'recursiveEscape',
  //       }),
  //       true
  //     );
  //   }
  // }, [editor, proposal]);
  //
  useEffect(() => {
    if (proposal?.status) {
      setTerminalTab(
        proposal.status === ProposalStatus.EXECUTED ? 'breakdown' : 'info'
      );
    }
  }, [proposal?.status]);

  // decode proposal actions
  useEffect(() => {
    if (!proposal) return;

    const mintTokenActions: {
      actions: Uint8Array[];
      index: number;
    } = {actions: [], index: 0};

    const withdrawAction = {
      // amount: Number(formatUnits(decoded.amount, tokenInfo.decimals)),
      amount: proposal.amount,
      name: 'withdraw_assets',
      to: {address: proposal.to || ''},
      tokenBalance: 0,
      tokenAddress: proposal.tokenAddress,
      tokenImgUrl: getImgUrl(proposal.token.symbol, daoDetails?.chain || 1),
      tokenName: proposal.token.name,
      tokenPrice: 0,
      tokenSymbol: proposal.token.symbol,
      tokenDecimals: proposal.token.decimals,
      isCustomToken: false,
    } as unknown as ActionWithdraw;

    // );
    setDecodedActions([withdrawAction]);
  }, [client, daoDetails?.chain, getImgUrl, network, proposal, provider, t]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposal?.status]);

  // handle can vote and wallet connection status
  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      // reset ref
      statusRef.current.wasNotLoggedIn = false;

      // logged out technically wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // throw network modal
      if (isOnWrongNetwork) {
        open('network');
      }
    }
  }, [isConnected, isOnWrongNetwork, open, getImgUrl]);

  useEffect(() => {
    // all conditions unmet close voting in process
    // console.log('isOnWrongNetwork :', isOnWrongNetwork);
    // console.log('isConnected :', isConnected);
    // console.log('canVote :', canVote);
    if (isOnWrongNetwork || !isConnected || !canVote) {
      // console.log('vip false on wrongnetwork');
      setVotingInProcess(false);
    } else {
      setVotingInProcess(true);
    }
    // if (canVote) {
    //   // console.log('set vip true');
    //   setVotingInProcess(true);
    // }
    // was on the wrong network but now on the right one
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      // reset ref
      statusRef.current.wasOnWrongNetwork = false;

      // show voting in process
      if (canVote) {
        console.log('set vip true');
        setVotingInProcess(true);
      }
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  // show voter tab once user has voted
  // useEffect(() => {
  //   if (voteSubmitted) {
  //     setTerminalTab('voters');
  //     setVotingInProcess(false);
  //     // console.log('vip false on voteSubmmited');
  //   }
  // }, [voteSubmitted]);

  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));

      // const interval = setInterval(async () => {
      //   const v = getVoteStatus(proposal, t);
      //
      //   // remove interval timer once the proposal has started
      //   if (proposal.startDate.valueOf() <= new Date().valueOf()) {
      //     clearInterval(interval);
      //     setIntervalInMills(PROPOSAL_STATUS_INTERVAL);
      //     setVoteStatus(v);
      //   } else if (proposal.status === 'Pending') {
      //     setVoteStatus(v);
      //   }
      // }, PENDING_PROPOSAL_STATUS_INTERVAL);
      //
      // return () => clearInterval(interval);
    }
  }, [proposal, t]);

  /*************************************************
   *              Handlers and Callbacks           *
   *************************************************/
  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal && daoMemebers) {
      const data = {
        approvals: proposal.approval,
        minApproval: proposal.settings.minApprovals,
        voters: [
          ...daoMemebers.map(m => {
            m.wallet = m.address;
            m.option = proposal.approval.some(
              a =>
                // remove the call to strip plugin address when sdk returns proper plugin address
                stripPlgnAdrFromProposalId(a).toLowerCase() ===
                m.address.toLowerCase()
            )
              ? 'approved'
              : 'none';
            return m;
          }),
        ],
        isMember:
          address &&
          daoMemebers.some(
            a =>
              // remove the call to strip plugin address when sdk returns proper plugin address
              stripPlgnAdrFromProposalId(a.address).toLowerCase() ===
              address.toLowerCase()
          ),
        strategy: t('votingTerminal.multisig'),
        voteOptions: t('votingTerminal.approve'),
        startDate: `${format(
          new Date(),
          KNOWN_FORMATS.proposals
        )}  ${getFormattedUtcOffset()}`,

        endDate: `${format(
          new Date(),
          KNOWN_FORMATS.proposals
        )}  ${getFormattedUtcOffset()}`,
      };
      // console.log('data :', data);
      return data;
    }

    // return getLiveProposalTerminalProps(
    //   t,
    //   proposal,
    //   address,
    //   daoSettings,
    //   isMultisigProposal(proposal) ? (members as MultisigMember[]) : undefined
    // );
    // }
  }, [address, daoMemebers, proposal, t]);

  // get early execution status
  const canExecuteEarly = useMemo(
    () =>
      // isTokenVotingSettings(daoSettings)
      //   ? isEarlyExecutable(
      //       mappedProps?.missingParticipation,
      //       proposal,
      //       mappedProps?.results,
      //       daoSettings.votingMode
      //     )
      //   :
      (proposal as DetailedProposal)?.approval?.length >=
      daoSettings?.minApprovals,
    [
      daoSettings,
      mappedProps?.missingParticipation,
      mappedProps?.results,
      proposal,
    ]
  );

  // proposal execution status
  const executionStatus = useMemo(
    () =>
      getProposalExecutionStatus(
        proposal?.status,
        canExecuteEarly,
        executionFailed
      ),
    [canExecuteEarly, executionFailed, proposal?.status]
  );

  // whether current user has voted
  const voted = useMemo(() => {
    if (!address || !proposal) return false;
    // console.log('voted > proposal :', proposal);

    // if (isMultisigProposal(proposal)) {
    return proposal.approval.some(
      a =>
        // remove the call to strip plugin address when sdk returns proper plugin address
        stripPlgnAdrFromProposalId(a).toLowerCase() === address.toLowerCase()
    );
    // } else {
    //   return proposal.votes.some(
    //     voter =>
    //       voter.address.toLowerCase() === address.toLowerCase() &&
    //       voter.vote !== undefined
    //   );
    // }
  }, [address, proposal]);

  // vote button and status
  const buttonLabel = useMemo(() => {
    if (proposal) {
      return getVoteButtonLabel(proposal, canVote, voted, t);
    }
  }, [proposal, voted, canVote, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    // disable voting on non-active proposals
    if (proposal?.status !== 'Active') return {voteNowDisabled: true};

    // disable approval on multisig when wallet has voted
    if (multisigDAO && (voted || voteSubmitted)) return {voteNowDisabled: true};

    // disable voting on mv with no vote replacement when wallet has voted
    if (!allowVoteReplacement && (voted || voteSubmitted))
      return {voteNowDisabled: true};

    // not logged in
    if (!address) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('wallet');
          statusRef.current.wasNotLoggedIn = true;
        },
      };
    }

    // wrong network
    else if (isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (canVote) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          if (multisigDAO) {
            handleSubmitVote(VoteValues.YES);
          } else {
            setVotingInProcess(true);
          }
        },
      };
    } else return {voteNowDisabled: true};
  }, [
    address,
    allowVoteReplacement,
    canVote,
    handleSubmitVote,
    isOnWrongNetwork,
    multisigDAO,
    open,
    proposal?.status,
    voteSubmitted,
    voted,
  ]);

  // handler for execution
  const handleExecuteNowClicked = () => {
    if (!address) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      // don't allow execution on wrong network
      open('network');
    } else {
      handleExecuteProposal();
    }
  };

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (
      proposal &&
      proposal.status === 'Active' && // active proposal
      address && // logged in
      !isOnWrongNetwork && // on proper network
      !voted && // haven't voted
      !canVote // cannot vote
    ) {
      // presence of token delineates token voting proposal
      // people add types to these things!!
      return t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [address, canVote, isOnWrongNetwork, proposal, t, voted]);

  // status steps for proposal
  const proposalSteps = useMemo(() => {
    if (proposal) {
      return getProposalStatusSteps(
        t,
        proposal.status,
        pluginType,
        new Date(proposal.createdTime.toNumber()),
        new Date(proposal.createdTime.toNumber()),
        new Date(proposal.createdTime.toNumber()),
        // proposal.startDate,
        // proposal.endDate,
        // proposal.creationDate,
        '',
        false, //executionFailed,
        '',
        proposal.executed ? new Date() : undefined
      );
    } else return [];
  }, [proposal, t, pluginType, executionFailed]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  if (paramsAreLoading || proposalIsLoading || detailsAreLoading || !proposal) {
    return <Loading />;
  }

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(
                generatePath(path, {
                  network,
                  dao: daoDetails?.address,
                })
              )
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal?.title}</ProposalTitle>
        <ContentWrapper>
          {/* <BadgeContainer>
            {PROPOSAL_TAGS.map((tag: string) => (
              <Tag label={tag} key={tag} />
            ))}
          </BadgeContainer> */}
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creator.toLowerCase() === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creator || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creator}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.description}</SummaryText>
        {/*{proposal.description && !expandedProposal && (*/}
        {/*  <ButtonText*/}
        {/*    css={{}}*/}
        {/*    className="w-full tablet:w-max"*/}
        {/*    size="large"*/}
        {/*    label={t('governance.proposals.buttons.readFullProposal')}*/}
        {/*    mode="secondary"*/}
        {/*    iconRight={<IconChevronDown />}*/}
        {/*    onClick={() => setExpandedProposal(true)}*/}
        {/*  />*/}
        {/*)}*/}
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {proposal.description && expandedProposal && (
            <>
              {/*<StyledEditorContent editor={editor} />*/}
              <ButtonText
                css={{}}
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          <VotingTerminal
            status={proposal.status}
            statusLabel={voteStatus}
            selectedTab={terminalTab}
            alertMessage={alertMessage}
            onTabSelected={setTerminalTab}
            onVoteClicked={onClick}
            onCancelClicked={() => setVotingInProcess(false)}
            voteButtonLabel={buttonLabel}
            voteNowDisabled={voteNowDisabled}
            votingInProcess={votingInProcess}
            onVoteSubmitClicked={vote =>
              handleSubmitVote(
                vote,
                address || ''
                // (proposal as TokenVotingProposal).token?.address
              )
            }
            {...mappedProps}
          />

          <ExecutionWidget
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={transactionHash || proposal?.executionTxHash || undefined}
          />
        </ProposalContainer>
        <AdditionalInfoContainer>
          {/*<ResourceList links={proposal?.metadata.resources} />*/}
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

// const BadgeContainer = styled.div.attrs({
//   className: 'flex flex-wrap gap-x-1.5',
// })``;

const ProposerLink = styled.p.attrs({
  className: 'text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs(
  ({expandedProposal}: ContentContainerProps) => ({
    className: `${
      expandedProposal ? 'tablet:mt-5' : 'tablet:mt-8'
    } mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0`,
  })
)<ContentContainerProps>``;
