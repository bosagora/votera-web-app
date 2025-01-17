import {MultisigProposal} from '../utils/aragon/sdk-client-multisig-types';
import {VoteValues} from '../utils/aragon/sdk-client-multisig-types';
import {VotingMode} from '../utils/aragon/sdk-client-multisig-types';
import {DaoAction} from 'utils/aragon/sdk-client-common-types';
import {ProposalPhase} from '../utils/types';
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
import {FundVoteWidget} from 'components/fundVoteWidget';
import {FundAssessmentWidget} from 'components/fundAssessmentWidget';
import ProposalInfo from 'components/proposalInfo';
import CommentList from 'components/commentList';
import VoterList from 'components/voterList';
import {
  IVoteBallotData,
  IScoreData,
  AssessmentResult,
  ExecutionStates,
  IProposalData,
  ProposalPeriod,
  ProposalStates,
  SortType,
  VoteResult,
} from 'votera-sdk-client';
import {useClient2} from 'hooks/useClient2';

// TODO: @Sepehr Please assign proper tags on action decoding
// const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;
const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const NumberFormatter = new Intl.NumberFormat('en-US');

enum ProposalStatus {
  OPENED = 'OPENED', // 시작
  CLOSED = 'CLOSED', // 종료
  INVALID = 'INVALID', // 탈락
  EXPIRED = 'EXPIRED', // 기간 만료
}

enum AssessmentStatus {
  NONE = 'NONE', // 평가 없음
  NOT_STARTED = 'NOT_STARTED', // 시작 전
  IN_PROGRESS = 'IN_PROGRESS', // 진행 중
  APPROVED = 'APPROVED', // 승인됨
  REJECTED = 'REJECTED', // 탈락됨
  EXPIRED = 'EXPIRED', // 기간 만료
}

enum VoteStatus {
  NONE = 'NONE', // 투표 없음
  NOT_STARTED = 'NOT_STARTED', // 시작 전
  IN_PROGRESS = 'IN_PROGRESS', // 진행 중
  APPROVED = 'APPROVED', // 승인됨
  REJECTED = 'REJECTED', // 부결됨
  EXPIRED = 'EXPIRED', // 기간 만료
}

enum ExecutionStatus {
  NONE = 'NONE', // 실행 없음
  IN_PROGRESS = 'IN_PROGRESS', // 실행 중
  FINISHED = 'FINISHED', // 완료됨
}

export enum ProposalPhaseExtended {
  UNDEFINED = 'UNDEFINED', // 정의되지 않은 상태
  UNKNOWN = 'UNKNOWN', // 알 수 없는 상태
  ERROR = 'ERROR', // 오류 상태
  OPENED_ASSESSMENT = 'OPENED_ASSESSMENT', // 평가가 진행중
  OPENED_VOTE = 'OPENED_VOTE', // 투표가 진행중
  OPENED_EXECUTION = 'OPENED_EXECUTION', // 실행이 진행중
  CLOSED_EXPIRED_ASSESSMENT = 'CLOSED_EXPIRED_ASSESSMENT', // OPENED 상태이지만, 평가/투표 기간이 지나 더이상 진행할 수 없는 상태
  CLOSED_EXPIRED_VOTE = 'CLOSED_EXPIRED_VOTE', // OPENED 상태이지만, 평가/투표 기간이 지나 더이상 진행할 수 없는 상태
  CLOSED_REJECTED_ASSESSMENT = 'CLOSED_REJECTED_ASSESSMENT', // 평가에서 거절되어 종료된 상태
  CLOSED_REJECTED_VOTE = 'CLOSED_REJECTED_VOTE', // 투표에서 거절되어 종료된 상태
  CLOSED_FINISHED = 'CLOSED_FINISHED', // 모든 단계가 정상적으로 종료되어 실행까지 완료된 상태
}

const getExtendedPhase = (proposal: any): ProposalPhaseExtended => {
  try {
    // 제안서가 없는 경우
    if (!proposal) return ProposalPhaseExtended.UNDEFINED;

    const assessStatus = checkAssessmentStatus(proposal);
    const voteStatus = checkVoteStatus(proposal);
    const execStatus = checkExecutionStatus(proposal);

    // 평가 단계 확인
    if (assessStatus === AssessmentStatus.IN_PROGRESS) {
      return ProposalPhaseExtended.OPENED_ASSESSMENT;
    }

    // 평가 탈락
    if (assessStatus === AssessmentStatus.REJECTED) {
      return ProposalPhaseExtended.CLOSED_REJECTED_ASSESSMENT;
    }

    // 평가 만료
    if (assessStatus === AssessmentStatus.EXPIRED) {
      return ProposalPhaseExtended.CLOSED_EXPIRED_ASSESSMENT;
    }

    // 투표 단계 확인
    if (
      assessStatus === AssessmentStatus.APPROVED &&
      voteStatus === VoteStatus.IN_PROGRESS
    ) {
      return ProposalPhaseExtended.OPENED_VOTE;
    }

    // 투표 탈락
    if (voteStatus === VoteStatus.REJECTED) {
      return ProposalPhaseExtended.CLOSED_REJECTED_VOTE;
    }

    // 투표 만료
    if (voteStatus === VoteStatus.EXPIRED) {
      return ProposalPhaseExtended.CLOSED_EXPIRED_VOTE;
    }

    // 실행이 진행 중인 경우
    if (execStatus === ExecutionStatus.IN_PROGRESS) {
      return ProposalPhaseExtended.OPENED_EXECUTION;
    }

    // 실행이 완료된 경우
    if (execStatus === ExecutionStatus.FINISHED) {
      return ProposalPhaseExtended.CLOSED_FINISHED;
    }

    // 그 외의 경우는 만료된 것으로 처리
    return ProposalPhaseExtended.UNKNOWN;
  } catch (error) {
    console.error('Error in getExtendedPhase:', error);
    return ProposalPhaseExtended.ERROR;
  }
};

const checkAssessmentStatus = (proposal: any): AssessmentStatus => {
  try {
    const now = Date.now();

    if (now < proposal.beginAssess) {
      return AssessmentStatus.NOT_STARTED;
    }

    // 평가 결과가 이미 있는 경우
    if (proposal.assessmentResult === AssessmentResult.APPROVED) {
      return AssessmentStatus.APPROVED;
    }

    if (proposal.assessmentResult === AssessmentResult.REJECTED) {
      return AssessmentStatus.REJECTED;
    }

    // 평가 기간이 지난 경우
    if (now > proposal.endAssess) {
      return proposal.assessmentResult === AssessmentResult.NONE
        ? AssessmentStatus.EXPIRED
        : proposal.assessmentResult === AssessmentResult.APPROVED
        ? AssessmentStatus.APPROVED
        : AssessmentStatus.REJECTED;
    }

    return AssessmentStatus.IN_PROGRESS;
  } catch (error) {
    console.error('Error in checkAssessmentStatus:', error);
    return AssessmentStatus.NONE;
  }
};

const checkVoteStatus = (proposal: any): VoteStatus => {
  try {
    const now = Date.now();

    if (!proposal || proposal.state !== ProposalStates.OPENED) {
      return VoteStatus.NONE;
    }

    if (now < proposal.beginVote) {
      return VoteStatus.NOT_STARTED;
    }

    // 투표 결과가 이미 있는 경우
    if (proposal.voteResult === VoteResult.APPROVED) {
      return VoteStatus.APPROVED;
    }

    if (proposal.voteResult === VoteResult.REJECTED) {
      return VoteStatus.REJECTED;
    }

    // 투표 기간이 지난 경우
    if (now > proposal.endVote) {
      if (proposal.voteResult === VoteResult.NONE) {
        return VoteStatus.EXPIRED;
      }
      return proposal.voteResult === VoteResult.APPROVED
        ? VoteStatus.APPROVED
        : VoteStatus.REJECTED;
    }

    return VoteStatus.IN_PROGRESS;
  } catch (error) {
    console.error('Error in checkVoteStatus:', error);
    return VoteStatus.NONE;
  }
};

const checkExecutionStatus = (proposal: any): ExecutionStatus => {
  try {
    if (!proposal || proposal.state !== ProposalStates.OPENED) {
      return ExecutionStatus.NONE;
    }

    if (proposal.executed) {
      return ExecutionStatus.FINISHED;
    }

    if (proposal.executionTxHash) {
      return ExecutionStatus.IN_PROGRESS;
    }

    // 투표가 승인되었고 실행 가능한 상태
    if (
      proposal.voteResult === VoteResult.APPROVED &&
      proposal.executionState === ExecutionStates.NONE
    ) {
      return ExecutionStatus.IN_PROGRESS;
    }

    return ExecutionStatus.NONE;
  } catch (error) {
    console.error('Error in checkExecutionStatus:', error);
    return ExecutionStatus.NONE;
  }
};

// 제안서의 상태(proposal.checkStatus) : 시작(OPENED), 종료(CLOSED), 탈락(INVALID)
// 제안서의 단계(proposal.checkPhase) : 평가 단계(ASSESSMENT), 투표 단계(VOTE), 실행 단계(EXECUTION), 가 있다.
// 평가 단계, 투표 단계는 완료(FINISHED)되거나 만료(EXPIRED)되지 않늗다면 APPROVED, REJECTED 상태가 된다.
// 실행 단계가 완료되지 않았다면 IN_PROCESS 상태가 된다.
// 만료(EXPIRED)란 각 단계의 기간내에 APPROVED, REJECTED 상태가 되지 않았음을 의미한다.

// UI에서 상태에 따른 메시지를 표시하기 위한 헬퍼 함수
const getProposalStatusMessage = (phase: ProposalPhaseExtended): string => {
  switch (phase) {
    case ProposalPhaseExtended.OPENED_ASSESSMENT:
      return '평가가 진행 중입니다.';
    case ProposalPhaseExtended.OPENED_VOTE:
      return '투표가 진행 중입니다.';
    case ProposalPhaseExtended.OPENED_EXECUTION:
      return '실행이 진행 중입니다.';
    case ProposalPhaseExtended.CLOSED_EXPIRED_ASSESSMENT:
      return '평가 기간이 만료되었습니다.';
    case ProposalPhaseExtended.CLOSED_EXPIRED_VOTE:
      return '투표 기간이 만료되었습니다.';
    case ProposalPhaseExtended.CLOSED_REJECTED_ASSESSMENT:
      return '평가 단계에서 탈락되었습니다.';
    case ProposalPhaseExtended.CLOSED_REJECTED_VOTE:
      return '투표 결과 부결되었습니다.';
    case ProposalPhaseExtended.CLOSED_FINISHED:
      return '제안이 성공적으로 완료되었습니다.';
    case ProposalPhaseExtended.ERROR:
      return '오류가 발생했습니다.';
    case ProposalPhaseExtended.UNDEFINED:
    case ProposalPhaseExtended.UNKNOWN:
    default:
      return '알 수 없는 상태입니다.';
  }
};

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();
  const {client} = useClient2();
  const {dao, id: urlId} = useParams();
  const proposalId = useMemo(
    () => (urlId ? new ProposalId(urlId) : undefined),
    [urlId]
  );

  console.log('proposalId :', proposalId);

  const {set, get} = useCache();
  // const apolloClient = useApolloClient();

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  const {address, isConnected, isOnWrongNetwork} = useWallet();

  // const [voteStatus, setVoteStatus] = useState('');
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
    transactionHash:
      '0x0000000000000000000000000000000000000000000000000000000000000000',
  };

  // 상태 관리를 위한 상태들
  const [proposal, setProposal] = useState<any | null>(null);
  const [proposalError, setProposalError] = useState<Error | null>(null);
  const [proposalIsLoading, setProposalIsLoading] = useState(true);
  const [myScore, setMyScore] = useState<IScoreData | null>(null);
  const [myBallot, setMyBallot] = useState<IVoteBallotData | null>(null);
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [expandedProposal, setExpandedProposal] = useState(false);
  const [paramsAreLoading, setParamsAreLoading] = useState(true);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [extendedPhase, setExtendedPhase] = useState<ProposalPhaseExtended>(
    ProposalPhaseExtended.UNKNOWN
  );

  // Mock proposal transaction context
  const {handleSubmitVote, handleExecuteProposal} =
    mockProposalTransactionContext;

  // proposal 데이터를 가져오는 useEffect 수정
  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        setParamsAreLoading(true);

        const proposalCount = await client?.methods.getProposalLength();
        console.log('fetched proposal count :', proposalCount);

        const proposals = await client?.methods.getProposalList(
          0,
          10,
          SortType.ASC
        );
        console.log('fetched proposals :', proposals);

        let fetchedProposal = null;
        if (proposalId?.toString()) {
          fetchedProposal = await client?.methods.getProposal(
            proposalId.toString()
          );
          console.log('fetched proposal :', fetchedProposal);
        }
        // 제안서가 없거나 proposals 배열이 있는 경우
        if (fetchedProposal === null && proposals && proposals.length > 0) {
          fetchedProposal = proposals[0];
        }

        // 제안서가 있는 경우에만 점수와 투표 정보 조회
        if (fetchedProposal) {
          // 평가 점수 조회
          const score = await client?.methods.getScore(
            fetchedProposal.proposalId,
            address || ''
          );
          console.log('fetched myScore :', score);
          setMyScore(score || null);

          // 투표 정보 조회
          const ballot = await client?.methods.getBallot(
            fetchedProposal.proposalId,
            address || ''
          );
          console.log('fetched myBallot :', ballot);
          setMyBallot(ballot || null);
        }

        // Mock 데이터와 실제 데이터를 결합
        const mockProposalData = fetchedProposal
          ? {
              id: fetchedProposal?.proposalId || 'default-id',

              creator: '0x1234567890123456789012345678901234567890',
              metadata: {
                title: fetchedProposal.title || 'Test Proposal',
                description:
                  fetchedProposal.description ||
                  '이 제안서는 우리 프로젝트의 미래 발전 방향성을 제시하고 있으며...',
              },
              phase: fetchedProposal.period,

              beginAssess: fetchedProposal?.beginAssess || 0,
              endAssess: fetchedProposal?.endAssess || 0,
              beginVote: fetchedProposal?.beginVote || 0,
              endVote: fetchedProposal?.endVote || 0,
              settings: {
                minApprovals: 2,
                onlyListed: true,
              },
              approval: [] as string[],
              token: {
                name: 'Test Token',
                symbol: 'TEST',
                decimals: 18,
              },
              amount: BigInt(1000000000000000000),
              to: '0x2345678901234567890123456789012345678901',
              tokenAddress: '0x3456789012345678901234567890123456789012',
              executed: false,
              executionTxHash: null,
              title: fetchedProposal?.title || 'Test Proposal',
              description:
                fetchedProposal?.description ||
                '이 제안서는 우리 프로젝트의 미래 발전 방향성을 제시하고 있으며...',
              state: fetchedProposal?.states || ProposalStates.INVALID,
              period: fetchedProposal?.period || ProposalPeriod.NONE,
              assessmentResult:
                fetchedProposal?.assessmentResult || AssessmentResult.NONE,
              voteResult: fetchedProposal?.voteResult || VoteResult.NONE,
              executionState:
                fetchedProposal?.executionStates || ExecutionStates.NONE,
            }
          : null;

        setProposal(mockProposalData);
        setExtendedPhase(getExtendedPhase(mockProposalData));
        setProposalError(null);
      } catch (error) {
        setProposalError(error as Error);
        setProposal(null);
      } finally {
        setParamsAreLoading(false);
        setProposalIsLoading(false);
      }
    };

    fetchProposalData();
  }, [client, address]);

  // 투표와 평가 가능 여부를 확인하는 함수들
  const canAssess = useMemo(() => {
    console.log('canAssess');
    if (!proposal || !myScore || !address) return false;
    console.log('canAssess 2');
    const assessStatus = checkAssessmentStatus(proposal);
    console.log('assessStatus :', assessStatus);
    if (assessStatus !== AssessmentStatus.IN_PROGRESS) return false;
    console.log('canAssess 4');
    // 내가 이미 점수를 평가했는지 확인
    const didAssessed = myScore.voter === address && myScore.timestamp > 0;
    console.log('didAssessed :', didAssessed);
    return !didAssessed;
  }, [proposal, myScore, address]);

  const canVote = useMemo(() => {
    console.log('canVote');
    if (!proposal || !myBallot || !address) return false;
    console.log('canVote 2');
    const voteStatus = checkVoteStatus(proposal);
    if (voteStatus !== VoteStatus.IN_PROGRESS) return false;

    // 내가 이미 투표했는지 확인
    const didVote = myBallot.voter === address && myBallot.timestamp > 0;
    console.log('didVote :', didVote);
    return !didVote;
  }, [proposal, myBallot, address]);

  // cache status effect
  useEffect(() => {
    if (proposal && proposal.phase !== get('proposalStatus')) {
      set('proposalStatus', proposal.phase);
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
  }, [canVote]);

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
  // const mappedProps = useMemo(() => {
  //   if (proposal && daoMemebers) {
  //     const data = {
  //       approvals: proposal.approval,
  //       minApproval: proposal.settings.minApprovals,
  //       voters: [
  //         ...daoMemebers.map(m => {
  //           m.wallet = m.address;
  //           m.option = proposal.approval.some(
  //             a =>
  //               // remove the call to strip plugin address when sdk returns proper plugin address
  //               stripPlgnAdrFromProposalId(a).toLowerCase() ===
  //               m.address.toLowerCase()
  //           )
  //             ? 'approved'
  //             : 'none';
  //           return m;
  //         }),
  //       ],
  //       isMember:
  //         address &&
  //         daoMemebers.some(
  //           a =>
  //             // remove the call to strip plugin address when sdk returns proper plugin address
  //             stripPlgnAdrFromProposalId(a.address).toLowerCase() ===
  //             address.toLowerCase()
  //         ),
  //       strategy: t('votingTerminal.multisig'),
  //       voteOptions: t('votingTerminal.approve'),
  //       startDate: `${format(
  //         new Date(),
  //         KNOWN_FORMATS.proposals
  //       )}  ${getFormattedUtcOffset()}`,

  //       endDate: `${format(
  //         new Date(),
  //         KNOWN_FORMATS.proposals
  //       )}  ${getFormattedUtcOffset()}`,
  //     };
  //     // console.log('data :', data);
  //     return data;
  //   }

  //   // return getLiveProposalTerminalProps(
  //   //   t,
  //   //   proposal,
  //   //   address,
  //   //   daoSettings,
  //   //   isMultisigProposal(proposal) ? (members as MultisigMember[]) : undefined
  //   // );
  //   // }
  // }, [address, daoMemebers, proposal, t]);

  // get early execution status
  // const canExecuteEarly = useMemo(
  //   () =>
  //     // isTokenVotingSettings(daoSettings)
  //     //   ? isEarlyExecutable(
  //     //       mappedProps?.missingParticipation,
  //     //       proposal,
  //     //       mappedProps?.results,
  //     //       daoSettings.votingMode
  //     //     )
  //     //   :
  //     (proposal as IProposalData)?.approval?.length >=
  //     daoSettings?.minApprovals,
  //   [daoSettings]
  // );

  // proposal execution status
  // const executionStatus = useMemo(
  //   () =>
  //     getProposalExecutionStatus(
  //       proposal?.phase,
  //       canExecuteEarly,
  //       executionFailed
  //     ),
  //   []
  // );

  // whether current user has voted
  const voted = useMemo(() => {
    if (!address || !proposal) return false;
    // console.log('voted > proposal :', proposal);

    // if (isMultisigProposal(proposal)) {
    return proposal.approval.some(
      (approvalAddress: string) =>
        stripPlgnAdrFromProposalId(approvalAddress).toLowerCase() ===
        address.toLowerCase()
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
    if (proposal?.phase !== ProposalPhase.VOTE) return {voteNowDisabled: true};

    // disable approval on multisig when wallet has voted
    if (voted || voteSubmitted) return {voteNowDisabled: true};

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
          handleSubmitVote(VoteValues.YES);
        },
      };
    } else return {voteNowDisabled: true};
  }, []);

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
      proposal.phase === ProposalPhase.VOTE && // active proposal
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

  // // status steps for proposal
  // const proposalSteps = useMemo(() => {
  //   if (proposal) {
  //     return getProposalStatusSteps(
  //       t,
  //       proposal.phase,
  //       pluginType,
  //       new Date(proposal.createdTime.toNumber()),
  //       new Date(proposal.createdTime.toNumber()),
  //       new Date(proposal.createdTime.toNumber()),
  //       // proposal.startDate,
  //       // proposal.endDate,
  //       // proposal.creationDate,
  //       '',
  //       false, //executionFailed,
  //       '',
  //       proposal.executed ? new Date() : undefined
  //     );
  //   } else return [];
  // }, []);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  if (paramsAreLoading || proposalIsLoading || !proposal) {
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
                  dao: '',
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
            url: 'https://github.com/example/project',
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
          <ProposalInfo
            phase={proposal.phase}
            assessmentStartDate={new Date(proposal.beginAssess)}
            assessmentEndDate={new Date(proposal.endAssess)}
            voteStartDate={new Date(proposal.beginVote)}
            voteEndDate={new Date(proposal.endVote)}
          />
          {proposal.phase === ProposalPeriod.ASSESSMENT ? (
            <FundAssessmentWidget
              phase={proposal.phase}
              onExecuteClicked={handleExecuteNowClicked}
              txhash={transactionHash || proposal?.executionTxHash || undefined}
              canAssess={canAssess}
              exPhase={extendedPhase}
              exPhaseMessage={getProposalStatusMessage(extendedPhase)}
              proposalId={proposal.id}
            />
          ) : (
            <FundVoteWidget
              phase={proposal.phase}
              onExecuteClicked={handleExecuteNowClicked}
              txhash={transactionHash || proposal?.executionTxHash || undefined}
              canVote={canVote}
              exPhase={extendedPhase}
              exPhaseMessage={getProposalStatusMessage(extendedPhase)}
              proposalId={proposal.id}
            />
          )}
        </ProposalContainer>

        <AdditionalInfoContainer>
          {/*<ResourceList links={proposal?.metadata.resources} />*/}
          {/* <WidgetStatus steps={proposalSteps} /> */}
          <CommentList
            comments={[
              {
                id: '1',
                author: '0x1234567890123456789012345678901234567890',
                content:
                  '이 제안은 매우 혁신적인 아이디어를 담고 있습니다. 특히 기술적 완성도가 인상적입니다.',
                createdAt: '2024-03-10 14:23',
              },
              {
                id: '2',
                author: '0x2345678901234567890123456789012345678901',
                content:
                  '실현 가능성에 대해 좀 더 구체적인 계획이 필요해 보입니다.',
                createdAt: '2024-03-10 15:45',
              },
              {
                id: '3',
                author: '0x3456789012345678901234567890123456789012',
                content:
                  '시장성과 수익성이 매우 긍정적으로 보입니다. 지지합니다.',
                createdAt: '2024-03-11 09:12',
              },
              {
                id: '4',
                author: '0x4567890123456789012345678901234567890123',
                content:
                  '확장 가능성이 높아 보이며, 커뮤니티에도 긍정적인 영향을 줄 것 같습니다.',
                createdAt: '2024-03-11 10:30',
              },
            ]}
          />
          <VoterList
            comments={[
              {
                id: '1',
                author: '0x1234567890123456789012345678901234567890',
                vote: 'yes',
                createdAt: '2024-03-10 14:23',
              },
              {
                id: '2',
                author: '0x2345678901234567890123456789012345678901',
                vote: 'no',
                createdAt: '2024-03-10 15:45',
              },
              {
                id: '3',
                author: '0x3456789012345678901234567890123456789012',
                vote: 'yes',
                createdAt: '2024-03-11 09:12',
              },
              {
                id: '4',
                author: '0x4567890123456789012345678901234567890123',
                vote: 'yes',
                createdAt: '2024-03-11 10:30',
              },
              {
                id: '5',
                author: '0x5678901234567890123456789012345678901234',
                vote: 'abstain',
                createdAt: '2024-03-11 11:45',
              },
            ]}
          />
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
