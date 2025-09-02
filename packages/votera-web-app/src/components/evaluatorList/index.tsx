import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FiChevronDown} from 'react-icons/fi';
import {Link} from 'votera-ui-components';
import {useNetwork} from 'context/network';
import {chainExplorerAddressLink} from 'utils/constants';
import {shortenAddress} from 'utils/library';
import {useClient} from 'hooks/useClient';
import {SortType, EvaluationData, Candidate} from 'votera-sdk-client';
import {TFunction, useTranslation} from 'react-i18next';
import moment from 'moment';

interface EvaluationListProps {
  proposalId: string;
}

const EvaluatorList: React.FC<EvaluationListProps> = ({proposalId}) => {
  const {network} = useNetwork();
  const {t} = useTranslation();
  const {client} = useClient();

  const PAGE_SIZE = 10;

  const [scoreLength, setScoreLength] = useState<number>(0);
  const [evaluatorLength, setEvaluatorLength] = useState<number>(0);
  const [evaluationData, setEvaluationData] = useState<EvaluationData[]>([]);
  const [currentEvaluatorPage, setCurrentEvaluatorPage] = useState<number>(0);
  const [hasMoreEvaluator, setHasMoreEvaluator] = useState<boolean>(true);

  const fetchBallots = async (page: number) => {
    if (!client) return;

    const startIndex = page * PAGE_SIZE;
    const endIndex = startIndex + PAGE_SIZE;

    const newEvaluations = await client.methods.getEvaluationOfAllMembersList(
      proposalId,
      startIndex,
      endIndex,
      SortType.DSC
    );

    if (newEvaluations) {
      if (page === 0) {
        setEvaluationData(newEvaluations);
      } else {
        setEvaluationData(prev => {
          const uniqueBallots = newEvaluations.filter(
            newEvaluation =>
              !prev.some(p => p.evaluator === newEvaluation.evaluator)
          );
          return [...prev, ...uniqueBallots];
        });
      }

      setHasMoreEvaluator(newEvaluations.length === PAGE_SIZE);
    }
  };

  useEffect(() => {
    const initializeEvaluators = async () => {
      if (!client || !proposalId) return;

      const scoreLength = await client.methods.getScoreLength(proposalId);
      setScoreLength(scoreLength || 0);
      const evaluatorLength = await client.methods.getEvaluatorLength(
        proposalId
      );
      setEvaluatorLength(evaluatorLength || 0);

      if (evaluatorLength && evaluatorLength > 0) {
        await fetchBallots(0);
      }
    };

    initializeEvaluators();
  }, [proposalId, client]);

  const handleLoadMore = async () => {
    // console.log('handleLoadMore >>>>>>>>>>>>');
    const nextPage = currentEvaluatorPage + 1;
    await fetchBallots(nextPage);
    setCurrentEvaluatorPage(nextPage);
  };

  const getEvaluationText = (done: boolean, t: TFunction) => {
    switch (done) {
      case true:
        return t('assessmentWidget.after');
      case false:
        return t('assessmentWidget.before');
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle>{t('assessmentWidget.evaluationStatus')}</HeaderTitle>
        <EvaluatorCount>
          {t('assessmentWidget.evaluatorCount', {
            count: scoreLength,
            total: evaluatorLength,
          })}
        </EvaluatorCount>
      </Header>

      {evaluationData.length > 0 ? (
        <>
          {evaluationData.map(evaluation => (
            <EvaluatorItem key={evaluation.evaluator}>
              <EvaluatorHeader>
                <HeaderLeft>
                  <Link
                    external
                    label={shortenAddress(evaluation.evaluator)}
                    href={chainExplorerAddressLink(
                      network,
                      evaluation.evaluator
                    )}
                  />
                  <IsEvaluated done={evaluation.isEvaluated}>
                    {getEvaluationText(evaluation.isEvaluated, t)}
                  </IsEvaluated>
                  <Values>
                    {evaluation.isEvaluated && JSON.stringify(evaluation.items)}
                  </Values>
                </HeaderLeft>
                <CreatedAt>
                  {evaluation.timestamp != 0
                    ? moment(
                        new Date(Number(evaluation.timestamp) * 1000)
                      ).format('YYYY-MM-DD HH:mm:ss')
                    : ''}
                </CreatedAt>
              </EvaluatorHeader>
              <Divider />
            </EvaluatorItem>
          ))}
          {hasMoreEvaluator && (
            <ShowMoreButton onClick={handleLoadMore}>
              <FiChevronDown size={20} />
              {t('explore.showMore')}
            </ShowMoreButton>
          )}
        </>
      ) : (
        <EmptyMessage>{t('assessmentWidget.emptyState')}</EmptyMessage>
      )}
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'w-full p-4 bg-white',
})``;

const EvaluatorItem = styled.div.attrs({
  className: 'mb-3',
})``;

const EvaluatorHeader = styled.div.attrs({
  className: 'flex justify-between items-center mb-3',
})``;

const Values = styled.span.attrs({
  className: 'text-[#666] text-sm',
})``;

const CreatedAt = styled.span.attrs({
  className: 'text-[#666] text-sm',
})``;

const Divider = styled.hr.attrs({
  className: 'border-0 border-b border-[#e6e6e6] m-0',
})``;

const ShowMoreButton = styled.button.attrs({
  className:
    'w-full flex items-center justify-center gap-1 py-2 text-[#666] hover:bg-gray-50 transition-colors',
})``;

const HeaderLeft = styled.div.attrs({
  className: 'flex items-center gap-3',
})``;

const IsEvaluated = styled.span<{done: boolean}>`
  ${({done}) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    ${
      done &&
      `
      background-color: #E8FFF1;
      color: #16A34A;
    `
    }
    ${
      !done &&
      `
      background-color: #FFE8E8;
      color: #666;
    `
    }
  `}
`;
const Header = styled.div.attrs({
  className:
    'flex justify-between items-center mb-1 pb-3 border-b border-[#e6e6e6]',
})``;

const HeaderTitle = styled.h2.attrs({
  className: 'text-lg font-semibold text-[#333]',
})``;

const EvaluatorCount = styled.span.attrs({
  className: 'text-sm text-[#666] font-medium',
})`
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

export default EvaluatorList;
