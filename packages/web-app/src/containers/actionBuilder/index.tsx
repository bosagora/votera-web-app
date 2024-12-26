import React from 'react';
import {useFormContext} from 'react-hook-form';

import TokenMenu from 'containers/tokenMenu';
import {useActionsContext} from 'context/actions';
import {useNetwork} from 'context/network';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {fetchTokenPrice} from 'services/prices';
import {formatUnits} from 'utils/library';
import {
  ActionIndex,
  ActionItem,
  ActionsTypes,
  BaseTokenInfo,
} from 'utils/types';
import WithdrawAction from './withdraw/withdrawAction';
import {PluginTypes} from '../../utils/aragon/types';

/**
 * This Component is responsible for generating all actions that append to pipeline context (actions)
 * In future we can add more action template like: mint token Component
 * or custom action component (for smart contracts methods)
 * @returns List of actions
 */

type ActionsComponentProps = {
  name: ActionsTypes;
  allowRemove?: boolean;
} & ActionIndex;

const Action: React.FC<ActionsComponentProps> = ({
  name,
  actionIndex,
  allowRemove = true,
}) => {
  switch (name) {
    case 'withdraw_assets':
      return <WithdrawAction {...{actionIndex, allowRemove}} />;
    default:
      throw Error('Action not found');
  }
};

interface ActionBuilderProps {
  allowEmpty?: boolean;
}

const ActionBuilder: React.FC<ActionBuilderProps> = ({allowEmpty = true}) => {
  const {data: daoDetails} = useDaoDetailsQuery();
  const {network} = useNetwork();
  const {selectedActionIndex: index, actions} = useActionsContext();
  const {data: tokens} = useDaoBalances(daoDetails?.address || '');
  const {setValue, resetField, clearErrors} = useFormContext();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    setValue(`actions.${index}.tokenSymbol`, token.symbol);

    if (token.address === '') {
      setValue(`actions.${index}.isCustomToken`, true);
      resetField(`actions.${index}.tokenName`);
      resetField(`actions.${index}.tokenImgUrl`);
      resetField(`actions.${index}.tokenAddress`);
      resetField(`actions.${index}.tokenBalance`);
      clearErrors(`actions.${index}.amount`);
      return;
    }

    clearErrors([
      `actions.${index}.tokenAddress`,
      `actions.${index}.tokenSymbol`,
    ]);
    setValue(`actions.${index}.isCustomToken`, false);
    setValue(`actions.${index}.tokenName`, token.name);
    setValue(`actions.${index}.tokenImgUrl`, token.imgUrl);
    setValue(`actions.${index}.tokenAddress`, token.address);
    setValue(`actions.${index}.tokenDecimals`, token.decimals);

    setValue(
      `actions.${index}.tokenBalance`,
      formatUnits(token.count, token.decimals)
    );

    fetchTokenPrice(token.address, network, token.symbol).then(price => {
      setValue(`actions.${index}.tokenPrice`, price);
    });
  };

  return (
    <>
      {actions?.map((action: ActionItem, index: number) => (
        <Action
          key={index}
          name={action?.name}
          actionIndex={index}
          allowRemove={actions.length <= 1 ? allowEmpty : true}
        />
      ))}

      <TokenMenu
        isWallet={false}
        onTokenSelect={handleTokenSelect}
        tokenBalances={tokens || []}
      />
    </>
  );
};

export default ActionBuilder;
