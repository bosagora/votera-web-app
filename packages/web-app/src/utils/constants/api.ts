export const IPFS_ENDPOINT =
  import.meta.env.VITE_APP_IPFS_ENDPOINT ||
  'https://votera-testnet.s3.ap-northeast-2.amazonaws.com/';
export const IPFS_ENDPOINT_UPLOAD =
  import.meta.env.VITE_APP_IPFS_ENDPOINT_UPLOAD ||
  'https://votera-api.testnet.bosagora.org/upload';

export const walletConnectProjectID = import.meta.env
  .VITE_WALLET_CONNECT_PROJECT_ID as string;
