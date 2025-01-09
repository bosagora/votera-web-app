import {useState} from 'react';
import {uploadToIPFS} from 'services/ipfs';

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setError(null);
    
    try {
      const cid = await uploadToIPFS(file);
      return cid;
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
    error
  };
}; 