import {HeaderPage, HeaderPageProps} from '@aragon/ui-components';
import React from 'react';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

export type PageWrapperProps = Omit<
  HeaderPageProps,
  'breadCrumbs' | 'description' | 'title'
> & {
  children?: React.ReactNode;
  customHeader?: React.ReactNode;
  customBody?: React.ReactNode;
  description?: string;
  title?: string;
};

const HeaderContainer = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 -mx-2 tablet:mx-0 tablet:mt-3 desktop:mt-5',
})``;

const BodyContainer = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;
