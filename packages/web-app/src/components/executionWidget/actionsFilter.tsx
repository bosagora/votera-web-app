import React from 'react';

import {useVoteraProposalDetailsQuery} from 'hooks/useVoteraProposalDetails';
import {Action} from 'utils/types';
import {WithdrawCard} from './actions/withdrawCard';

type ActionsFilterProps = {
  action: Action;
};

export const ActionsFilter: React.FC<ActionsFilterProps> = ({action}) => {
  const {data: proposal} = useVoteraProposalDetailsQuery();

  // all actions have names
  switch (action.name) {
    case 'withdraw_assets':
      return (
        <WithdrawCard action={action} proposalTitle={proposal?.title || ''} />
      );
    default:
      return <></>;
  }
};
