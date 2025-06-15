// Create a browser-compatible IPFS client using Pinata
const createIPFSClient = () => {
  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // If we're in the browser and credentials are missing, show a warning
  if (isBrowser && (!pinataApiKey || !pinataSecretKey)) {
    console.warn('Pinata credentials are missing. Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY to your .env.local file');
  }

  return {
    uploadJSON: async (data: any) => {
      if (!pinataApiKey || !pinataSecretKey) {
        throw new Error('Pinata credentials are not configured. Please check your environment variables.');
      }

      try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to upload to IPFS: ${error}`);
        }

        const result = await response.json();
        return result.IpfsHash;
      } catch (error) {
        console.error('Error uploading to IPFS:', error);
        throw new Error('Failed to upload to IPFS. Please try again later.');
      }
    },

    uploadFile: async (file: File) => {
      if (!pinataApiKey || !pinataSecretKey) {
        throw new Error('Pinata credentials are not configured. Please check your environment variables.');
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
          body: formData,
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to upload file to IPFS: ${error}`);
        }

        const result = await response.json();
        return result.IpfsHash;
      } catch (error) {
        console.error('Error uploading file to IPFS:', error);
        throw new Error('Failed to upload file to IPFS. Please try again later.');
      }
    },

    get: async (hash: string) => {
      try {
        const response = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`, {
          method: 'GET',
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to fetch from IPFS: ${error}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw new Error('Failed to fetch from IPFS. Please try again later.');
      }
    },
  };
};

// Create a singleton instance
const ipfsClient = createIPFSClient();

export const uploadToIPFS = async (data: any): Promise<string> => {
  return ipfsClient.uploadJSON(data);
};

export const uploadFileToIPFS = async (file: File): Promise<string> => {
  return ipfsClient.uploadFile(file);
};

export const getFromIPFS = async (hash: string): Promise<any> => {
  return ipfsClient.get(hash);
};

export function getIPFSGatewayURL(hash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
} 