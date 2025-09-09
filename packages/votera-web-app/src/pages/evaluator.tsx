import {Pagination} from 'votera-ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {EvaluatorMembersList} from '../components/membersList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useVoteraProposalDetailsQuery} from '../hooks/useVoteraProposalDetails';
import {useClient} from '../hooks/useClient';
import {EvaluationData, SortType} from 'votera-sdk-client';

const MEMBERS_PER_PAGE = 5;

const Evaluator: React.FC = () => {
  const {t} = useTranslation();

  const [page, setPage] = useState(1);

  const {data: proposalDetails, isLoading: detailsAreLoading} =
    useVoteraProposalDetailsQuery();

  const {client} = useClient();

  const [members, setMembers] = useState<EvaluationData[]>([]);
  const [totalMemberCount, setTotalMemberCount] = useState<number>(0);
  const [scoreCount, setScoreCount] = useState<number>(0);
  const [membersLoading, setMembersLoading] = useState<boolean>(false);

  React.useEffect(() => {
    async function fetchMembers() {
      try {
        if (!client) return;
        const proposalId = proposalDetails ? proposalDetails.proposalId : '';
        if (!proposalId) return;

        setMembersLoading(true);
        const length = await client.methods.getEvaluatorLength(proposalId);
        setTotalMemberCount(length);
        const sLength = await client.methods.getScoreLength(proposalId);
        setScoreCount(sLength);
        const startIndex = (page - 1) * MEMBERS_PER_PAGE;
        const endIndex = startIndex + MEMBERS_PER_PAGE;
        if (startIndex < length) {
          const list = await client.methods.getEvaluationOfAllMembersList(
            proposalId,
            startIndex,
            endIndex,
            SortType.ASC
          );
          setMembers(list);
        } else {
          setMembers([]);
        }
      } finally {
        setMembersLoading(false);
      }
    }

    fetchMembers();
  }, [client, proposalDetails, page]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersLoading) return <Loading />;

  return (
    <PageWrapper title={t('labels.evaluatorHeader', {count: totalMemberCount})}>
      <BodyContainer>
        <>
          {membersLoading ? (
            <Loading />
          ) : (
            <>
              <EvaluatorMembersList
                members={members}
                totalLength={totalMemberCount}
                scoreLength={scoreCount}
              />
            </>
          )}
        </>

        {/* Pagination */}
        <PaginationWrapper>
          {(totalMemberCount || 0) > MEMBERS_PER_PAGE && (
            <Pagination
              key={`pagination-${page}`}
              totalPages={
                Math.ceil((totalMemberCount || 0) / MEMBERS_PER_PAGE) as number
              }
              activePage={page}
              onChange={(newPage: number) => {
                setPage(newPage);
                window.scrollTo({top: 0, behavior: 'smooth'});
              }}
            />
          )}
        </PaginationWrapper>
      </BodyContainer>
    </PageWrapper>
  );
};

const BodyContainer = styled.div.attrs({
  className: 'desktop:space-y-8',
})``;

const PaginationWrapper = styled.div.attrs({
  className: 'flex mt-8',
})``;

export default withTransaction('Evaluator', 'component')(Evaluator);
