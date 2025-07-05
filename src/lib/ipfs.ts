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
        // Ensure data is a valid JSON object
        const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
        
        // Add pinata metadata
        const requestBody = {
          pinataMetadata: {
            name: 'metadata.json',
            keyvalues: {
              type: 'metadata',
              timestamp: new Date().toISOString(),
            },
          },
          pinataContent: jsonData,
        };

        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Pinata API Error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
            headers: Object.fromEntries(response.headers.entries()),
          });
          throw new Error(`Failed to upload to IPFS: ${errorText}`);
        }

        const result = await response.json();
        console.log('JSON uploaded to IPFS:', result);
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
        
        // Create metadata for the file
        const metadata = JSON.stringify({
          name: file.name,
          keyvalues: {
            type: 'postImage',
            uploadedAt: new Date().toISOString()
          }
        });
        
        formData.append('file', file);
        formData.append('pinataMetadata', metadata);
        
        const pinataOptions = JSON.stringify({
          cidVersion: 0
        });
        formData.append('pinataOptions', pinataOptions);

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
          console.error('Pinata API Error:', error);
          throw new Error(`Failed to upload file to IPFS: ${error}`);
        }

        const result = await response.json();
        console.log('File uploaded to IPFS:', result);
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