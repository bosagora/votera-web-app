import {Link} from 'votera-ui-components';
import React from 'react';
import {EvaluationData} from 'votera-sdk-client';

import {useNetwork} from 'context/network';
import {chainExplorerAddressLink} from 'utils/constants';
import styled from 'styled-components';
import {shortenAddress} from '../../utils/library';
import moment from 'moment/moment';
import {TFunction} from 'react-i18next';
import {t} from 'i18next';

type MembersListProps = {
  members: Array<EvaluationData>;
};

export const EvaluatorMembersList: React.FC<MembersListProps> = ({members}) => {
  const {network} = useNetwork();

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
      <>
        {members.length > 0 ? (
          <>
            {members.map(evaluation => (
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
                      {evaluation.isEvaluated &&
                        JSON.stringify(evaluation.items)}
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
          </>
        ) : (
          <EmptyMessage>{t('assessmentWidget.emptyState')}</EmptyMessage>
        )}
      </>
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

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;
