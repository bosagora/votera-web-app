import {MultisigMinimumApproval} from 'components/multisigMinimumApproval';
import React from 'react';
import styled from 'styled-components';

const ConfigureCommunity: React.FC = () => {
  /*************************************************
   *                   Render                     *
   *************************************************/
  return (
    <>
      <FormItem>
        <MultisigMinimumApproval />
      </FormItem>
    </>
  );
};

export default ConfigureCommunity;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
