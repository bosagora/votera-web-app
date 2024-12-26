/* TOP LEVEL PAGES ========================================================== */
export const Landing = '/';
export const CreateDAO = '/create';
export const NotFound = '/not-found';

/* DAO-SPECIFIC PAGES ======================================================= */

export const Dashboard = '/multisig-wallets/:network/:dao/dashboard';
export const Finance = '/multisig-wallets/:network/:dao/finance';
export const Governance = '/multisig-wallets/:network/:dao/governance';
export const Community = '/multisig-wallets/:network/:dao/community';
export const Settings = '/multisig-wallets/:network/:dao/settings';
export const EditSettings = '/multisig-wallets/:network/:dao/settings/edit';
export const ProposeNewSettings =
  '/multisig-wallets/:network/:dao/settings/new-proposal';

export const AllTokens = '/multisig-wallets/:network/:dao/finance/tokens';
export const AllTransfers = '/multisig-wallets/:network/:dao/finance/transfers';
export const NewDeposit = '/multisig-wallets/:network/:dao/finance/new-deposit';
export const NewWithDraw =
  '/multisig-wallets/:network/:dao/finance/new-withdrawal';

export const Proposal =
  '/multisig-wallets/:network/:dao/governance/proposals/:id';
export const NewProposal =
  '/multisig-wallets/:network/:dao/governance/new-proposal';
export const MintTokensProposal =
  '/multisig-wallets/:network/:dao/community/mint-tokens';
export const ManageMembersProposal =
  '/multisig-wallets/:network/:dao/community/manage-members';
