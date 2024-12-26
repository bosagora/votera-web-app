import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';
import styled from 'styled-components';

import {MultisigWallets} from 'components/multisigWallets';

const SetupCommunityForm: React.FC = () => {
  const {setValue} = useFormContext();

  useEffect(() => {
    setValue('eligibilityType', 'multisig');
  }, [setValue]);

  return (
    <>
      <FormItem>
        <MultisigWallets />
      </FormItem>
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
