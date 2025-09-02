import {Link} from 'votera-ui-components';
import React, {useEffect, useState} from 'react';
import {Candidate, VoteBallotData} from 'votera-sdk-client';

import {useNetwork} from 'context/network';
import {
  chainExplorer2AddressLink,
  chainExplorerAddressLink,
} from 'utils/constants';
import styled from 'styled-components';
import {
  getValidatorKeyForLink,
  shortenAddress,
  shortenValidatorKey,
} from '../../utils/library';
import moment from 'moment/moment';
import {TFunction} from 'react-i18next';
import {t} from 'i18next';

type MembersListProps = {
  members: Array<VoteBallotData>;
  totalLength: number;
  ballotLength: number;
};

export const ValidatorMembersList: React.FC<MembersListProps> = ({
  members,
  totalLength,
  ballotLength,
}) => {
  const {network} = useNetwork();

  const getVoteText = (vote: Candidate, t: TFunction) => {
    switch (vote) {
      case Candidate.YES:
        return t('voteWidget.yes');
      case Candidate.NO:
        return t('voteWidget.no');
      case Candidate.BLANK:
        return t('voteWidget.abstain');
    }
  };

  return (
    <Container>
      <Header>
        <HeaderTitle></HeaderTitle>
        <VoterCount>
          {t('voteWidget.voterCount', {
            count: ballotLength,
            total: totalLength,
          })}
        </VoterCount>
      </Header>
      <>
        {members.length > 0 ? (
          <>
            {members.map(ballot => (
              <ValidatorItem key={ballot.voter}>
                <Row>
                  <div className={Col.voter}>
                    <Link
                      external
                      label={shortenAddress(ballot.voter)}
                      href={chainExplorerAddressLink(network, ballot.voter)}
                    />
                  </div>
                  <div className={Col.validatorKey}>
                    <Link
                      external
                      label={shortenValidatorKey(ballot.validatorKey)}
                      href={chainExplorer2AddressLink(
                        network,
                        getValidatorKeyForLink(ballot.validatorKey)
                      )}
                    />
                  </div>
                  <div className={Col.choice}>
                    {ballot.timestamp != 0 ? (
                      <VoteChoice vote={ballot.choice}>
                        {getVoteText(ballot.choice, t)}
                      </VoteChoice>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className={Col.time}>
                    <CreatedAt>
                      {ballot.timestamp != 0
                        ? moment(
                            new Date(Number(ballot.timestamp) * 1000)
                          ).format('YYYY-MM-DD HH:mm:ss')
                        : ''}
                    </CreatedAt>
                  </div>
                </Row>
                <Divider />
              </ValidatorItem>
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

const ValidatorItem = styled.div.attrs({
  className: 'mb-3',
})``;

const ValidatorHeader = styled.div.attrs({
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

// 4-Column aligned row
const Row = styled.div.attrs({
  className: 'grid grid-cols-12 items-center gap-3 mb-3',
})``;

/* col spans: voter(4) | validatorKey(4) | choice(2) | timestamp(2) */
const Col = {
  voter: 'col-span-12 tablet:col-span-4',
  validatorKey: 'col-span-12 tablet:col-span-4',
  choice: 'col-span-6 tablet:col-span-2',
  time: 'col-span-6 tablet:col-span-2 text-right',
};

const VoteChoice = styled.span<{vote: Candidate}>`
  ${({vote}) => `
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 14px;
    ${
      vote === Candidate.YES &&
      `
      background-color: #E8FFF1;
      color: #16A34A;
    `
    }
    ${
      vote === Candidate.NO &&
      `
      background-color: #FFE8E8;
      color: #DC2626;
    `
    }
    ${
      vote === Candidate.BLANK &&
      `
      background-color: #F3F4F6;
      color: #6B7280;
    `
    }
  `}
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const Header = styled.div.attrs({
  className:
    'flex justify-between items-center mb-1 pb-3 border-b border-[#e6e6e6]',
})``;

const HeaderTitle = styled.h2.attrs({
  className: 'text-lg font-semibold text-[#333]',
})``;

const VoterCount = styled.span.attrs({
  className: 'text-sm text-[#666]',
})``;
