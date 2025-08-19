import styled from 'styled-components';
import React, {SyntheticEvent} from 'react';

import {Tag} from 'votera-ui-components';
import {IconRadioDefault, IconSuccess} from 'votera-ui-components';

export type ListItemVoteProps = {
  domain?: string;
  name?: string;
  title: string;
  description: string;
  icon: string;
  selected?: boolean;
  tag?: string;
  onClick?: React.MouseEventHandler;
};

export const ListItemVote: React.FC<ListItemVoteProps> = ({
  selected = false,
  ...props
}) => {
  return (
    <Container selected={selected} {...props} data-testid="listItem-vote">
      <Content>
        <Domain selected={selected}>{props.title}</Domain>
        {/* <Description>{props.description}</Description> */}
        <Icon>{props.icon}</Icon>
      </Content>
      {props.tag && <Tag label={props.tag} colorScheme="info" />}
      {selected ? (
        <IconSuccess width={20} height={20} className="text-primary-500" />
      ) : (
        <IconRadioDefault width={20} height={20} className="text-ui-400" />
      )}
    </Container>
  );
};

type SelectedProps = {
  selected: boolean;
};
const Container = styled.div.attrs(({selected}: SelectedProps) => {
  const className = `${
    selected ? 'bg-ui-0' : 'bg-ui-50'
  } flex items-center p-2 space-x-2 rounded-xl cursor-pointer`;
  return {className};
})<SelectedProps>``;

const Domain = styled.span.attrs(({selected}: SelectedProps) => ({
  className: `${selected ? 'text-primary-500' : 'text-ui-600'} font-bold`,
}))<SelectedProps>``;

const Description = styled.span.attrs({
  className: 'text-ui-500',
})``;

const Icon = styled.span.attrs({
  className: 'ml-2',
})``;

const Content = styled.div.attrs({className: 'flex-1'})``;
