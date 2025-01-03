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
  ListItemLink,
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
import { FundVoteWidget } from 'components/fundVoteWidget';
import { FundAssessmentWidget } from 'components/fundAssessmentWidget';
import ProposalInfo from 'components/proposalInfo';
import CommentList from 'components/commentList';
import VoterList from 'components/voterList';

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

  // Mock useLoadTokenLogoURL hook
  const mockUseLoadTokenLogoURL = {
    getImgUrl: (symbol: string, chainId: number) => {
      // Return a mock URL for token logos
      return `https://mock-token-logos.com/${symbol}-${chainId}.png`;
    }
  };

  // Replace actual hook with mock
  const {getImgUrl} = mockUseLoadTokenLogoURL;

  // Mock data for daoDetails
  const mockDaoDetails = {
    data: {
      address: '0x1234567890123456789012345678901234567890',
      ensDomain: 'test-dao.dao.eth',
      metadata: {
        name: 'Test DAO',
        description: 'This is a test DAO',
        avatar: 'https://example.com/avatar.png',
        links: []
      },
      plugins: {
        multisig: {
          id: 'multisig.plugin.dao.eth'
        }
      },
      chain: 1 // Ethereum Mainnet
    },
    isLoading: false
  };

  // Replace actual hook with mock data
  const {data: daoDetails, isLoading: detailsAreLoading} = mockDaoDetails;

  // Mock data for daoMembers
  const mockDaoMembers = {
    data: {
      members: [
        {
          address: '0x1234567890123456789012345678901234567890',
          role: 'member',
          delegatedVotingPower: '1000000000000000000',
          votingPower: '1000000000000000000',
        },
        {
          address: '0x2345678901234567890123456789012345678901',
          role: 'member',
          delegatedVotingPower: '2000000000000000000',
          votingPower: '2000000000000000000',
        },
        {
          address: '0x3456789012345678901234567890123456789012',
          role: 'member',
          delegatedVotingPower: '3000000000000000000',
          votingPower: '3000000000000000000',
        }
      ]
    },
    isLoading: false
  };

  // Replace actual hook with mock data
  const {
    data: {members: daoMemebers},
    isLoading,
  } = mockDaoMembers;

  // Mock data for plugin settings
  const mockPluginSettings = {
    data: {
      minApprovals: 2,
      onlyListed: true,
      votingMode: VotingMode.STANDARD, // assuming VotingMode is imported
      minDuration: 7200, // 2 hours in seconds
      minProposerVotingPower: BigInt(1), // minimum voting power required to create proposal
      multisigSettings: {
        minApprovals: 2,
        onlyListed: true
      }
    }
  };

  // Replace actual hook with mock data
  const {data: daoSettings} = mockPluginSettings;

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

  // Mock data for proposal transaction context
  const mockProposalTransactionContext = {
    handleSubmitVote: (voteValue: VoteValues) => {
      console.log('Mock submit vote:', voteValue);
      return Promise.resolve();
    },
    handleExecuteProposal: () => {
      console.log('Mock execute proposal');
      return Promise.resolve();
    },
    isLoading: false,
    pluginAddress: '0x1234567890123456789012345678901234567890',
    pluginType: 'multisig.plugin.dao.eth' as PluginTypes,
    voteSubmitted: false,
    executionFailed: false,
    transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
  };

  // Mock data for proposal
  const mockProposal = {
    data: {
      id: proposalId?.toString(),
      dao: daoDetails?.address,
      creator: '0x1234567890123456789012345678901234567890',
      metadata: {
        title: 'Test Proposal',
        description: '이 제안서는 우리 프로젝트의 미래 발전 방향성을 제시하고 있으며, 현재 당면한 문제점들을 해결하기 위한 구체적인 실행 계획과 예산 할당 방안을 포함하고 있습니다. 또한 이 제안이 실현되었을 때 기대할 수 있는 긍정적인 효과와 잠재적인 위험 요소에 대한 분석도 함께 담고 있습니다.'
      },
      status: ProposalStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000), // 24 hours from now
      createdTime: {
        toNumber: () => Date.now()
      },
      settings: {
        minApprovals: 2,
        onlyListed: true
      },
      approval: [] as string[],
      token: {
        name: 'Test Token',
        symbol: 'TEST',
        decimals: 18
      },
      amount: BigInt(1000000000000000000), // 1 token
      to: '0x2345678901234567890123456789012345678901',
      tokenAddress: '0x3456789012345678901234567890123456789012',
      executed: false,
      executionTxHash: null,
      title: 'Test Proposal',
      description: '이 제안서는 우리 프로젝트의 미래 발전 방향성을 제시하고 있으며, 현재 당면한 문제점들을 해결하기 위한 구체적인 실행 계획과 예산 할당 방안을 포함하고 있습니다. 또한 이 제안이 실현되었을 때 기대할 수 있는 긍정적인 효과와 잠재적인 위험 요소에 대한 분석도 함께 담고 있습니다.'
    },
    error: null,
    isLoading: false
  };

  // Replace actual hooks with mock data
  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    pluginAddress,
    pluginType,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = mockProposalTransactionContext;

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = mockProposal;

  // Mock data for wallet can vote
  const mockWalletCanVote = {
    data: true, // 투표 가능한 상태로 설정
    isLoading: false
  };

  // Replace actual hook with mock data
  const {data: canVote} = mockWalletCanVote;

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

  // proposal status effect
  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));
    }
  }, []);

  // editor content effect
  // useEffect(() => {
  //   if (proposal && editor) {
  //     editor.commands.setContent(
  //       sanitizeHtml(proposal.metadata.description, {
  //         disallowedTagsMode: 'recursiveEscape',
  //       }),
  //       true
  //     );
  //   }
  // }, [editor, proposal]);

  // proposal status tab effect
  useEffect(() => {
    if (proposal?.status) {
      setTerminalTab(
        proposal.status === ProposalStatus.EXECUTED ? 'breakdown' : 'info'
      );
    }
  }, []);

  // cache status effect
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus')) {
      set('proposalStatus', proposal.status);
    }
  }, []);

  // voting process effect
  useEffect(() => {
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    }
  }, []);

  // voter tab effect
  useEffect(() => {
    if (voteSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteSubmitted]);

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
  }, []);

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
  }, [isConnected, isOnWrongNetwork]);

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
 
  ]);

  // show voter tab once user has voted
  // useEffect(() => {
  //   if (voteSubmitted) {
  //     setTerminalTab('voters');
  //     setVotingInProcess(false);
  //     // console.log('vip false on voteSubmmited');
  //   }
  // }, [voteSubmitted]);

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
    []
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
  }, []);

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
  }, []);

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
  }, []);

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

        {[
          {
            name: '프로젝트 깃허브',
            url: 'https://github.com/example/project'
          },
        ].map(({name, url}) => (
          <ListItemLink label={name} href={url} key={url} />
        ))}

        <SummaryText>{proposal?.description}</SummaryText>
 
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

          {/* <VotingTerminal
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
          /> */}

          <ProposalInfo
            currentStage={'ASSESSMENT'} // 또는 'VOTE'
            assessmentStartDate={new Date('2024-03-01')}
            assessmentEndDate={new Date('2024-03-15')}
            voteStartDate={new Date('2024-03-16')}
            voteEndDate={new Date('2024-03-30')}
          />

          <FundAssessmentWidget
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={transactionHash || proposal?.executionTxHash || undefined}
          />

          <FundVoteWidget
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={transactionHash || proposal?.executionTxHash || undefined}
          />


        </ProposalContainer>

        <AdditionalInfoContainer>
          {/*<ResourceList links={proposal?.metadata.resources} />*/}
          {/* <WidgetStatus steps={proposalSteps} /> */}
          <CommentList comments={[
            {
              id: '1',
              author: '0x1234567890123456789012345678901234567890',
              content: '이 제안은 매우 혁신적인 아이디어를 담고 있습니다. 특히 기술적 완성도가 인상적입니다.',
              createdAt: '2024-03-10 14:23'
            },
            {
              id: '2',
              author: '0x2345678901234567890123456789012345678901', 
              content: '실현 가능성에 대해 좀 더 구체적인 계획이 필요해 보입니다.',
              createdAt: '2024-03-10 15:45'
            },
            {
              id: '3',
              author: '0x3456789012345678901234567890123456789012',
              content: '시장성과 수익성이 매우 긍정적으로 보입니다. 지지합니다.',
              createdAt: '2024-03-11 09:12'
            },
            {
              id: '4',
              author: '0x4567890123456789012345678901234567890123',
              content: '확장 가능성이 높아 보이며, 커뮤니티에도 긍정적인 영향을 줄 것 같습니다.',
              createdAt: '2024-03-11 10:30'
            }
          ]} />
          <VoterList comments={[
            {
              id: '1',
              author: '0x1234567890123456789012345678901234567890',
              vote: 'yes',
              createdAt: '2024-03-10 14:23'
            },
            {
              id: '2',
              author: '0x2345678901234567890123456789012345678901',
              vote: 'no',
              createdAt: '2024-03-10 15:45'
            },
            {
              id: '3', 
              author: '0x3456789012345678901234567890123456789012',
              vote: 'yes',
              createdAt: '2024-03-11 09:12'
            },
            {
              id: '4',
              author: '0x4567890123456789012345678901234567890123',
              vote: 'yes',
              createdAt: '2024-03-11 10:30'
            },
            {
              id: '5',
              author: '0x5678901234567890123456789012345678901234',
              vote: 'abstain',
              createdAt: '2024-03-11 11:45'
            },
          ]} />
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
