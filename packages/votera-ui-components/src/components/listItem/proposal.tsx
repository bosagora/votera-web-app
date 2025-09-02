import React from 'react';
import styled from 'styled-components';

import {AvatarProposal} from '../avatar';
import {shortenAddress} from '../../utils/addresses';
import {IconRadioDefault, IconSuccess} from '../icons';

// TODO: Refactor to use input type radio for accessibility

export type ListItemProposalProps = {
  /** Dao's ethereum address **or** ENS name */
  proposalId: string;
  proposalLogo?: string;
  proposalTitle: string;
  proposalType: string;
  selected?: boolean;
  /** Handler for ListItem selection */
  onClick?: React.MouseEventHandler;
};

/**
 * List item for DAO selection. Used for switching to different DAO.
 */
export const ListItemProposal: React.FC<ListItemProposalProps> = props => {
  return (
    <Container selected={props.selected} onClick={props.onClick}>
      <AvatarProposal
        title={props.proposalTitle}
        type={props.proposalType}
        src={props.proposalLogo}
      />
      <Content>
        <ProposalName selected={props.selected}>
          {props.proposalTitle}
        </ProposalName>
        <Domain>{shortenAddress(props.proposalId)}</Domain>
      </Content>
      <IconContainer selected={props.selected}>
        {props.selected ? <IconSuccess /> : <IconRadioDefault />}
      </IconContainer>
    </Container>
  );
};

type Selectable = Pick<ListItemProposalProps, 'selected'>;

const Container = styled.button.attrs(({selected}: Selectable) => {
  const baseClasses =
    'group flex items-center p-2 space-x-2  w-full rounded-xl' +
    ' focus-visible:ring-2 focus-visible:ring-primary-500 focus:outline-none';

  return {
    className: selected
      ? baseClasses + ' bg-ui-0'
      : baseClasses + ' hover:bg-ui-50 focus:bg-ui-50 active:bg-ui-0',
  };
})<Selectable>``;

const Content = styled.div.attrs({
  className: 'flex-1 text-left min-w-0',
})``;

const Domain = styled.p.attrs({
  className: 'ft-text-sm text-ui-500 truncate',
})``;

const ProposalName = styled.p.attrs(({selected}: Selectable) => {
  return {
    className: selected
      ? 'font-bold truncate text-primary-500'
      : 'truncate font-bold text-ui-600 group-hover:text-primary-500' +
        ' group-active:text-primary-500',
  };
})<Selectable>``;

const IconContainer = styled.div.attrs(({selected}: Selectable) => {
  return {
    className: selected
      ? 'ft-text-sm text-primary-500'
      : 'ft-text-sm text-ui-400 group-hover:text-primary-500 group-active:text-primary-500',
  };
})<Selectable>``;
