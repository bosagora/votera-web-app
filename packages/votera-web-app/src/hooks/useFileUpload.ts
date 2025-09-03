import {useState} from 'react';
import {uploadToIPFS} from 'services/ipfs';
import {useNetwork} from '../context/network';
import {CHAIN_METADATA} from '../utils/constants';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const {network} = useNetwork();

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      return await uploadToIPFS(CHAIN_METADATA[network].ipfs_upload, file);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFile,
    isUploading,
    error,
  };
};
