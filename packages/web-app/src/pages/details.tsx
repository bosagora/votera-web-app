import {ButtonText, IconChevronUp, Link} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {TFunction, useTranslation} from 'react-i18next';
import {useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useSpecificProvider} from 'context/providers';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA} from 'utils/constants';
import {shortenAddress} from 'utils/library';
import {NotFound} from 'utils/paths';

import {ProposalId} from 'utils/types';

import {FundVoteWidget} from 'components/fundVoteWidget';
import {FundAssessmentWidget} from 'components/fundAssessmentWidget';
import ProposalInfo from 'components/proposalInfo';
import CommentList from 'components/commentList';
import VoterList from 'components/voterList';
import {
  VoteBallotData,
  ScoreData,
  AssessmentResult,
  ExecutionStates,
  ProposalData,
  ProposalPeriod,
  ProposalStates,
  VoteResult,
} from 'votera-sdk-client';
import {useClient} from 'hooks/useClient';
import {FundTransitionWidget} from 'components/fundTransitionWidget';
import {FundExecutionWidget} from 'components/fundExecutionWidget';
import {useProposalQuery} from 'hooks/useProposalQuery';

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
  INVALID_QUORUM = 'INVALID_QUORUM', // 정족수 미달로 부결됨
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
  OPENED_EXPIRED_ASSESSMENT = 'OPENED_EXPIRED_ASSESSMENT', // 투표 기간이 지나 더이상 진행할 수 없는 상태
  CLOSED_EXPIRED_ASSESSMENT = 'CLOSED_EXPIRED_ASSESSMENT', // 투표 기간 내에 투표로 전환할 수 있는 상태
  OPENED_EXPIRED_VOTE = 'OPENED_EXPIRED_VOTE', //  평가/투표 기간내에 다음 단계로 전활 할 수 있는 상태
  CLOSED_EXPIRED_VOTE = 'CLOSED_EXPIRED_VOTE', //  기간이 지나 더이상 진행할 수 없는 상태
  CLOSED_REJECTED_ASSESSMENT = 'CLOSED_REJECTED_ASSESSMENT', // 평가에서 거절되어 종료된 상태
  CLOSED_REJECTED_VOTE = 'CLOSED_REJECTED_VOTE', // 투표에서 거절되어 종료된 상태
  CLOSED_INVALID_QUORUM_VOTE = 'CLOSED_INVALID_QUORUM_VOTE', // 정족수 미달로 투표 결과 부결되어 종료된 상태
  CLOSED_FINISHED = 'CLOSED_FINISHED', // 모든 단계가 정상적으로 종료되어 실행까지 완료된 상태
}

export const getExtendedPhase = (proposal: any): ProposalPhaseExtended => {
  try {
    // 제안서가 없는 경우
    if (!proposal) return ProposalPhaseExtended.UNDEFINED;

    const execStatus = checkExecutionStatus(proposal);
    const voteStatus = checkVoteStatus(proposal);
    const assessStatus = checkAssessmentStatus(proposal);

    // console.log('assessStatus :', assessStatus);
    // console.log('voteStatus :', voteStatus);
    // console.log('execStatus :', execStatus);

    // 평가 없음
    if (assessStatus === AssessmentStatus.NONE) {
      return ProposalPhaseExtended.CLOSED_EXPIRED_ASSESSMENT;
    }

    // 평가 탈락
    if (assessStatus === AssessmentStatus.REJECTED) {
      return ProposalPhaseExtended.CLOSED_REJECTED_ASSESSMENT;
    }

    // 정족수 미달로 투표 결과 부결되어 종료된 경우
    if (voteStatus === VoteStatus.INVALID_QUORUM) {
      return ProposalPhaseExtended.CLOSED_INVALID_QUORUM_VOTE;
    }

    // 투표 탈락
    if (voteStatus === VoteStatus.REJECTED) {
      return ProposalPhaseExtended.CLOSED_REJECTED_VOTE;
    }

    // 실행이 진행 중인 경우
    if (execStatus === ExecutionStatus.IN_PROGRESS) {
      return ProposalPhaseExtended.OPENED_EXECUTION;
    }

    // 실행이 완료된 경우
    if (execStatus === ExecutionStatus.FINISHED) {
      return ProposalPhaseExtended.CLOSED_FINISHED;
    }

    // 투표 단계 확인
    if (
      assessStatus === AssessmentStatus.APPROVED &&
      voteStatus === VoteStatus.IN_PROGRESS
    ) {
      return ProposalPhaseExtended.OPENED_VOTE;
    }

    // 평가 만료
    if (assessStatus === AssessmentStatus.EXPIRED) {
      if (voteStatus === VoteStatus.EXPIRED) {
        return ProposalPhaseExtended.CLOSED_EXPIRED_ASSESSMENT;
      } else {
        return ProposalPhaseExtended.OPENED_EXPIRED_ASSESSMENT;
      }
    }

    // 투표 만료
    if (voteStatus === VoteStatus.EXPIRED) {
      return ProposalPhaseExtended.OPENED_EXPIRED_VOTE;
    }

    // 평가 단계 확인
    if (assessStatus === AssessmentStatus.IN_PROGRESS) {
      return ProposalPhaseExtended.OPENED_ASSESSMENT;
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

    if (now < new Date(proposal.beginAssess * 1000).getTime()) {
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
    if (now < new Date(proposal.endAssess * 1000).getTime()) {
      return proposal.assessmentResult === AssessmentResult.NONE
        ? AssessmentStatus.IN_PROGRESS
        : proposal.assessmentResult === AssessmentResult.APPROVED
        ? AssessmentStatus.APPROVED
        : AssessmentStatus.REJECTED;
    } else {
      return proposal.assessmentResult !== AssessmentResult.REJECTED
        ? AssessmentStatus.EXPIRED
        : AssessmentStatus.NONE;
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

    if (!proposal || proposal.state === ProposalStates.INVALID) {
      return VoteStatus.NONE;
    }

    // 투표 기간이 지난 경우
    if (now > new Date(proposal.endVote * 1000).getTime()) {
      if (proposal.voteResult === VoteResult.NONE) {
        return VoteStatus.EXPIRED;
      }
      return proposal.voteResult === VoteResult.APPROVED
        ? VoteStatus.APPROVED
        : VoteStatus.REJECTED;
    } else {
      //
    }
    // 정족수 미달로 투표 결과 부결되어 종료된 경우
    if (proposal.voteResult === VoteResult.INVALID_QUORUM) {
      return VoteStatus.INVALID_QUORUM;
    }

    // 투표 결과가 이미 있는 경우
    if (proposal.voteResult === VoteResult.APPROVED) {
      return VoteStatus.APPROVED;
    }

    if (proposal.voteResult === VoteResult.REJECTED) {
      return VoteStatus.REJECTED;
    }

    return VoteStatus.IN_PROGRESS;
  } catch (error) {
    console.error('Error in checkVoteStatus:', error);
    return VoteStatus.NONE;
  }
};

const checkExecutionStatus = (proposal: any): ExecutionStatus => {
  try {
    if (!proposal) {
      return ExecutionStatus.NONE;
    }

    if (proposal.executionStates === ExecutionStates.FINISHED) {
      return ExecutionStatus.FINISHED;
    }

    if (proposal.executionStates === ExecutionStates.IN_PROCESS) {
      return ExecutionStatus.IN_PROGRESS;
    }

    // 투표가 승인되었고 실행 가능한 상태
    if (
      proposal.voteResult === VoteResult.APPROVED &&
      proposal.executionStates === ExecutionStates.NONE
    ) {
      return ExecutionStatus.IN_PROGRESS;
    }

    return ExecutionStatus.NONE;
  } catch (error) {
    console.error('Error in checkExecutionStatus:', error);
    return ExecutionStatus.NONE;
  }
};

// UI에서 상태에 따른 메시지를 표시하기 위한 헬퍼 함수
const getProposalStatusMessage = (
  phase: ProposalPhaseExtended,
  t: TFunction
): string => {
  switch (phase) {
    case ProposalPhaseExtended.OPENED_ASSESSMENT:
      return t('proposalStatusMessage.openedAssessment');
    case ProposalPhaseExtended.OPENED_VOTE:
      return t('proposalStatusMessage.openedVote');
    case ProposalPhaseExtended.OPENED_EXECUTION:
      return t('proposalStatusMessage.openedExecution');
    case ProposalPhaseExtended.OPENED_EXPIRED_ASSESSMENT:
      return t('proposalStatusMessage.openedExpiredAssessment');
    case ProposalPhaseExtended.CLOSED_EXPIRED_ASSESSMENT:
      return t('proposalStatusMessage.closedExpiredAssessment');
    case ProposalPhaseExtended.OPENED_EXPIRED_VOTE:
      return t('proposalStatusMessage.openedExpiredVote');
    case ProposalPhaseExtended.CLOSED_EXPIRED_VOTE:
      return t('proposalStatusMessage.closedExpiredVote');
    case ProposalPhaseExtended.CLOSED_REJECTED_ASSESSMENT:
      return t('proposalStatusMessage.closedRejectedAssessment');
    case ProposalPhaseExtended.CLOSED_REJECTED_VOTE:
      return t('proposalStatusMessage.closedRejectedVote');
    case ProposalPhaseExtended.CLOSED_INVALID_QUORUM_VOTE:
      return t('proposalStatusMessage.closedInvalidQuorumVote');
    case ProposalPhaseExtended.CLOSED_FINISHED:
      return t('proposalStatusMessage.closedFinished');
    case ProposalPhaseExtended.ERROR:
      return t('proposalStatusMessage.error');
    case ProposalPhaseExtended.UNDEFINED:
    case ProposalPhaseExtended.UNKNOWN:
    default:
      return t('proposalStatusMessage.undefined');
  }
};

const Details: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const {client} = useClient();
  const {id: urlId} = useParams();
  const proposalId = useMemo(
    () => (urlId ? new ProposalId(urlId) : undefined),
    [urlId]
  );
  const {network} = useNetwork();

  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  const {address, isConnected, isOnWrongNetwork} = useWallet();

  // 상태 관리를 위한 상태들
  const [proposal, setProposal] = useState<any | null>(null);
  const [proposalError, setProposalError] = useState<Error | null>(null);
  const [proposalIsLoading, setProposalIsLoading] = useState(true);
  const [myScore, setMyScore] = useState<ScoreData | null>(null);
  const [myBallot, setMyBallot] = useState<VoteBallotData | null>(null);
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);
  const [paramsAreLoading, setParamsAreLoading] = useState(true);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [extendedPhase, setExtendedPhase] = useState<ProposalPhaseExtended>(
    ProposalPhaseExtended.UNKNOWN
  );
  const [isVoter, setIsVoter] = useState(false);

  const [fetchedProposal, setFetchedProposal] = useState<
    ProposalData | null | undefined
  >(null);

  // useProposalQuery를 컴포넌트 최상위 레벨에서 호출
  const {data: queryResult} = useProposalQuery(proposalId?.toString() || '');

  // queryResult를 처리하는 useEffect
  useEffect(() => {
    if (queryResult) {
      console.log('queryResult :', queryResult);
      setFetchedProposal(
        Array.isArray(queryResult) ? queryResult[0] : queryResult
      );
    }
  }, [queryResult]);

  const getStepTitle = (period: ProposalPeriod, t: TFunction) => {
    switch (period) {
      case ProposalPeriod.ASSESSMENT:
        return t('voteSteps.step1.title');
      case ProposalPeriod.VOTE:
        return t('voteSteps.step2.title');
      case ProposalPeriod.EXECUTION:
        return t('voteSteps.step3.title');
      default:
        return t('governance.statusWidget.finished');
    }
  };

  // proposal 데이터를 가져오는 useEffect
  useEffect(() => {
    const fetchProposalData = async () => {
      try {
        setParamsAreLoading(true);

        const voterLength = await client?.methods.getVoterLength(
          fetchedProposal?.proposalId || ''
        );

        const isVoterTmp = await client?.methods.isVoter(
          fetchedProposal?.proposalId || '',
          address || ''
        );
        setIsVoter(isVoterTmp || false);
        // 제안서가 있는 경우에만 점수와 투표 정보 조회
        if (fetchedProposal) {
          // 평가 점수 조회
          const score = await client?.methods.getScore(
            fetchedProposal.proposalId,
            address || ''
          );
          setMyScore(score || null);

          // 투표 정보 조회
          const ballot = await client?.methods.getBallot(
            fetchedProposal.proposalId,
            address || ''
          );
          setMyBallot(ballot || null);
        } else {
          navigate(NotFound, {
            replace: true,
            state: {invalidProposal: proposalId},
          });
        }

        // Mock 데이터와 실제 데이터를 결합
        const extendedProposalData = fetchedProposal
          ? {
              id: fetchedProposal?.proposalId || 'default-id',

              creator:
                fetchedProposal?.proposer ||
                '0x1234567890123456789012345678901234567890',
              metadata: {
                title: fetchedProposal.title || 'Test Proposal',
                description:
                  fetchedProposal.description ||
                  '이 제안서는 우리 프로젝트의 미래 발전 방향성을 제시하고 있으며...',
              },
              phase: getStepTitle(fetchedProposal.period, t),
              proposalType: fetchedProposal.proposalType,
              beginAssess: fetchedProposal?.beginAssess || 0,
              endAssess: fetchedProposal?.endAssess || 0,
              beginVote: fetchedProposal?.beginVote || 0,
              endVote: fetchedProposal?.endVote || 0,
              documentId: fetchedProposal?.documentId || '',
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
              fundAmount: fetchedProposal?.fundAmount || BigInt(0),
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
              executionStates:
                fetchedProposal?.executionStates || ExecutionStates.NONE,
            }
          : null;

        setProposal(extendedProposalData);
        console.log('extendedProposalData :', extendedProposalData);
        const extendedPhaseTmp = getExtendedPhase(extendedProposalData);
        setExtendedPhase(extendedPhaseTmp);
        setProposalError(null);
      } catch (error) {
        setProposalError(error as Error);
        setProposal(null);
      } finally {
        setParamsAreLoading(false);
        setProposalIsLoading(false);
      }
    };

    if (client && address && proposalId && fetchedProposal) {
      fetchProposalData();
    }
  }, [client, address, proposalId, fetchedProposal, t]);

  // 투표와 평가 가능 여부를 확인하는 함수들
  const canAssess = useMemo(() => {
    if (!proposal || !myScore || !address || !isVoter) return false;

    // 내가 이미 점수를 평가했는지 확인
    const didAssessed = myScore.voter === address && myScore.timestamp > 0;
    return !didAssessed;
  }, [proposal, myScore, address, isVoter]);

  const canVote = useMemo(() => {
    if (!proposal || !myBallot || !address || !isVoter) return false;

    // 내가 이미 투표했는지 확인
    const didVote = myBallot.voter === address && myBallot.timestamp > 0;
    return !didVote;
  }, [proposal, myBallot, address, isVoter]);

  // voting process effect
  useEffect(() => {
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    }
  }, []);

  // voter tab effect
  useEffect(() => {
    if (voteSubmitted) {
      // setTerminalTab('voters');
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
    if (isOnWrongNetwork || !isConnected || !canVote) {
      // console.log('vip false on wrong network');
      setVotingInProcess(false);
    } else {
      setVotingInProcess(true);
    }

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

  if (paramsAreLoading || proposalIsLoading || !proposal) {
    return <Loading />;
  }

  return (
    <Container>
      <HeaderContainer>
        {/* {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(
                generatePath(path, {
                  network,
                  id: '',
                })
              )
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )} */}
        <ProposalTitle>{proposal?.title}</ProposalTitle>
        <ContentWrapper>
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
            period={proposal.period}
            phase={proposal.phase}
            documentId={proposal.documentId}
            proposalType={proposal.proposalType}
            fundAmount={proposal.fundAmount}
            extendedPhase={extendedPhase}
            exPhaseMessage={getProposalStatusMessage(extendedPhase, t)}
            assessmentStartDate={new Date(proposal.beginAssess * 1000)}
            assessmentEndDate={new Date(proposal.endAssess * 1000)}
            voteStartDate={new Date(proposal.beginVote * 1000)}
            voteEndDate={new Date(proposal.endVote * 1000)}
          />
          {proposal.period === ProposalPeriod.ASSESSMENT ? (
            <FundAssessmentWidget
              period={proposal.period}
              phase={proposal.phase}
              canAssess={canAssess}
              myScore={myScore || null}
              exPhase={extendedPhase}
              exPhaseMessage={getProposalStatusMessage(extendedPhase, t)}
              proposalId={proposal.id}
            />
          ) : (
            <FundVoteWidget
              period={proposal.period}
              phase={proposal.phase}
              txhash={transactionHash || proposal?.executionTxHash || undefined}
              canVote={canVote}
              myBallot={myBallot || null}
              exPhase={extendedPhase}
              exPhaseMessage={getProposalStatusMessage(extendedPhase, t)}
              proposalId={proposal.id}
            />
          )}
          {isVoter &&
            extendedPhase.toLocaleLowerCase().includes('opened_expired') && (
              <FundTransitionWidget
                period={proposal.period}
                phase={proposal.phase}
                exPhase={extendedPhase}
                exPhaseMessage={getProposalStatusMessage(extendedPhase, t)}
                proposalId={proposal.id}
              />
            )}
          {extendedPhase.toLocaleLowerCase().includes('opened_execution') &&
            proposal.creator === address && (
              <FundExecutionWidget
                period={proposal.period}
                phase={proposal.phase}
                exPhase={extendedPhase}
                exPhaseMessage={getProposalStatusMessage(extendedPhase, t)}
                proposalId={proposal.id}
              />
            )}
        </ProposalContainer>

        <AdditionalInfoContainer>
          {/*<ResourceList links={proposal?.metadata.resources} />*/}
          {/* <WidgetStatus steps={proposalSteps} /> */}
          {proposal &&
            extendedPhase.toLocaleLowerCase().includes('assessment') && (
              <CommentList proposalId={proposal.id} isVoter={isVoter} />
            )}
          {proposal && proposal.period >= ProposalPeriod.VOTE && (
            <VoterList proposalId={proposal.id} />
          )}
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Details);

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
