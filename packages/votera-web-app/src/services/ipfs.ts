/**
 * Upload file to IPFS
 * @param endPoint
 * @param file File to upload
 * @returns CID of uploaded file
 */
export const uploadToIPFS = async (
  endPoint: string,
  file: File | Blob
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('proposal', file);

    const response = await fetch(endPoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }

    // response를 복제하여 body를 두 번 읽을 수 있게 합니다
    const responseClone = response.clone();

    try {
      const data = await responseClone.json();
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
