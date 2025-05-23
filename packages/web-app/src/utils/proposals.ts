/**
 * This file contains helpers for mapping a proposal
 * to voting terminal properties. Doesn't exactly belong
 * here, but couldn't leave in the Proposal Details page,
 * so open to suggestions.
 */
import {Action} from 'utils/types';

/**
 * Strips proposal id of plugin address
 * @param proposalId id with following format:  *0x4206cdbc...a675cae35_0x0*
 * @returns proposal id without the pluginAddress
 * or the given proposal id if already stripped of the plugin address: *0x3*
 */
export function stripPlgnAdrFromProposalId(proposalId: string) {
  // return the "pure" contract proposal id or consider given proposal already stripped
  return proposalId?.split('_')[1] || proposalId;
}
/**
 * Filter out all empty add/remove address and minimul approval actions
 * @param actions supported actions
 * @returns list of non empty address
 */
export function getNonEmptyActions(
  actions: Array<Action>,
  minApprovals?: number
) {
  return actions.flatMap(action => {
    if (action.name === 'add_address') {
      // strip empty inputs off

      const finalAction = {
        ...action,
        inputs: {
          memberWallets: action.inputs.memberWallets.filter(
            item => !!item.address
          ),
        },
      };

      return finalAction.inputs.memberWallets.length > 0 ? finalAction : [];
    } else if (action.name === 'remove_address') {
      // address removed from the list: return action or don't include
      return action.inputs.memberWallets.length > 0 ? action : [];
    } else {
      // all other actions can go through
      return action;
    }
  });
}
