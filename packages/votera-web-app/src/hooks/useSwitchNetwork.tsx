import {useNetwork} from 'context/network';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {toHex} from 'utils/library';

type ErrorType = {
  code: number;
};

export const useSwitchNetwork = () => {
  const {network} = useNetwork();

  const switchWalletNetwork = async (targetNetwork?: SupportedNetworks) => {
    const networkToSwitch = targetNetwork || network;
    
    // Check if MetaMask is installed
    if (window.ethereum) {
      try {
        // check if the chain to connect to is installed
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: toHex(CHAIN_METADATA[networkToSwitch].id)}], // chainId must be in hexadecimal numbers
        });
      } catch (error) {
        if ((error as ErrorType).code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainName: CHAIN_METADATA[networkToSwitch].name,
                  chainId: toHex(CHAIN_METADATA[networkToSwitch].id),
                  rpcUrls: CHAIN_METADATA[networkToSwitch].rpc,
                  nativeCurrency: CHAIN_METADATA[networkToSwitch].nativeCurrency,
                },
              ],
            });
          } catch (addError) {
            console.error(addError);
          }
        }
        console.error(error);
      }
    } else {
      // if no window.ethereum then MetaMask is not installed
      alert(
        'MetaMask is not installed. Please consider installing it: https://metamask.io/download.html'
      );
    }
  };

  return {switchWalletNetwork};
};
