import {IPFS_ENDPOINT, IPFS_ENDPOINT_UPLOAD} from 'utils/constants';

/**
 * Upload file to IPFS
 * @param file File to upload
 * @returns CID of uploaded file
 */
export const uploadToIPFS = async (file: File | Blob): Promise<string> => {
  try {
    // console.log('IPFS_ENDPOINT', IPFS_ENDPOINT_UPLOAD);
    // console.log('file', file);
    const formData = new FormData();
    formData.append('proposal', file);

    const response = await fetch(IPFS_ENDPOINT_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    // response를 복제하여 body를 두 번 읽을 수 있게 합니다
    const responseClone = response.clone();
    // console.log('responseClone', responseClone);
    // 디버깅을 위해 원본 response 출력
    // console.log('original response', response);

    try {
      const data = await responseClone.json();
      // console.log('parsed response data:', data);
      return data.data.hash;
    } catch (parseError) {
      // console.error('Error parsing response:', parseError);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get file from IPFS
 * @param cid CID of file to get
 * @returns File data
 */
export const getFromIPFS = async (cid: string): Promise<Response> => {
  try {
    const response = await fetch(`${IPFS_ENDPOINT}/${cid}`);
    if (!response.ok) {
      throw new Error('Failed to get file from IPFS');
    }
    return response;
  } catch (error) {
    console.error('Error getting file from IPFS:', error);
    throw error;
  }
};
