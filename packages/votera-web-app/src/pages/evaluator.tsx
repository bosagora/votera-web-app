import {Pagination, SearchInput} from 'votera-ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {EvaluatorMembersList} from '../components/membersList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useEvaluatorMembers} from '../hooks/useEvaluatorMembers';
import {useVoteraProposalDetailsQuery} from '../hooks/useVoteraProposalDetails';

const MEMBERS_PER_PAGE = 20;

const Evaluator: React.FC = () => {
  const {t} = useTranslation();

  const [page, setPage] = useState(1);

  const {data: proposalDetails, isLoading: detailsAreLoading} =
    useVoteraProposalDetailsQuery();

  const {
    data: {length, members},
    isLoading: membersLoading,
  } = useEvaluatorMembers(proposalDetails ? proposalDetails.proposalId : '');

  const totalMemberCount = length;

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (detailsAreLoading || membersLoading) return <Loading />;

  return (
    <PageWrapper title={`${totalMemberCount} ${t('labels.members')}`}>
      <BodyContainer>
        <>
          {membersLoading ? (
            <Loading />
          ) : (
            <>
              <EvaluatorMembersList members={members} />
            </>
          )}
        </>

        {/* Pagination */}
        <PaginationWrapper>
          {(members.length || 0) > MEMBERS_PER_PAGE && (
            <Pagination
              totalPages={
                Math.ceil((members.length || 0) / MEMBERS_PER_PAGE) as number
              }
              activePage={page}
              onChange={(activePage: number) => {
                setPage(activePage);
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
  className: 'mt-5 desktop:space-y-8',
})``;

const SearchAndResultWrapper = styled.div.attrs({className: 'space-y-3'})``;

const ResultsCountLabel = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-lg',
})``;

const PaginationWrapper = styled.div.attrs({
  className: 'flex mt-8',
})``;

const InputWrapper = styled.div.attrs({
  className: 'space-y-1',
})``;

export default withTransaction('Evaluator', 'component')(Evaluator);
