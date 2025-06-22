import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

type Attribute = {
  trait_type: string;
  value: string | number | boolean;
};

type PinataResponse = {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
};

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;

if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
  throw new Error('Missing Pinata API keys. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_API_KEY');
}

/**
 * Uploads data to IPFS using Pinata
 * @param data The data to upload (will be JSON.stringified)
 * @returns Promise resolving to the IPFS URL (ipfs://{cid})
 */
export async function uploadToIPFS(data: any): Promise<string> {
  try {
    if (!data) {
      throw new Error('No data provided to uploadToIPFS');
    }
    
    console.log('Uploading JSON data:', data);
    
    // Ensure data is an object with the required properties
    const content = typeof data === 'object' ? data : { content: data };
    
    // Create the payload in the format Pinata expects
    const pinataContent = {
      pinataContent: content,
      pinataMetadata: {
        name: `yourz-${Date.now()}.json`,
        keyvalues: {
          type: 'application/json',
          source: 'YourZ',
          timestamp: new Date().toISOString()
        }
      }
    };
    
    console.log('Sending to Pinata:', pinataContent);

    // Make the request
    const response = await axios.post<PinataResponse>(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      pinataContent,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );
    
    console.log('Pinata response:', response.data);
    
    // Return just the raw hash
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw new Error('Failed to upload to IPFS');
  }
}

/**
 * Fetch content from IPFS using a raw CID
 * @param cid The raw IPFS CID (without ipfs:// prefix)
 * @returns Promise resolving to the fetched content
 */
export async function fetchFromIPFS(cid: string): Promise<any> {
  try {
    // First try Pinata's gateway
    const pinataUrl = `https://olive-foreign-tuna-244.mypinata.cloud/ipfs/${cid}`;
    const response = await fetch(pinataUrl);
    
    if (response.ok) {
      return await response.json();
    }

    // If Pinata fails, try IPFS.io
    const ipfsUrl = `https://ipfs.io/ipfs/${cid}`;
    const response2 = await fetch(ipfsUrl);
    
    if (response2.ok) {
      return await response2.json();
    }

    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw error;
  }
}

/**
 * Creates and uploads NFT metadata to IPFS
 * @param name The name of the NFT
 * @param description Description of the NFT
 * @param content The main content of the NFT
 * @param attributes Additional attributes for the NFT
 * @returns Promise resolving to the IPFS URL of the metadata
 */
export async function createAndUploadMetadata(
  name: string,
  description: string,
  content: string,
  attributes: Attribute[] = []
): Promise<string> {
  const metadata = {
    name,
    description,
    content,
    attributes: [
      ...attributes,
      {
        trait_type: 'Created At',
        value: new Date().toISOString(),
      },
      {
        trait_type: 'Platform',
        value: 'YourZ',
      },
    ],
  };

  return uploadToIPFS(metadata);
}

type PostMetadata = {
  title: string;
  content: string;
  author: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
};

/**
 * Stores post content and metadata on IPFS using Pinata
 * @param post The post data to store
 * @returns Promise resolving to the IPFS URL and metadata
 */
export async function storePostOnIPFS(post: PostMetadata): Promise<{ url: string; cid: string }> {
  try {
    // Create a file from the post content
    const contentFile = {
      path: 'content.txt',
      content: post.content
    };

    // Define metadata type with optional image
    type PostMetadataWithImage = {
      name: string;
      description: string;
      author: string;
      created: string;
      image?: string;
      properties: {
        content: string;
        type: string;
        attributes?: Array<{ trait_type: string; value: string }>;
      };
    };

    // Prepare metadata with the content
    const metadata: PostMetadataWithImage = {
      name: post.title,
      description: post.description || `${post.title} by ${post.author}`,
      author: post.author,
      created: new Date().toISOString(),
      properties: {
        content: contentFile.content,
        type: 'yourz-post',
        ...(post.attributes && { attributes: post.attributes })
      },
      ...(post.image && { image: post.image })
    };

    // Upload the metadata to IPFS
    const ipfsUrl = await uploadToIPFS(metadata);
    const cid = ipfsUrl.replace('ipfs://', '');
    
    return {
      url: ipfsUrl,
      cid
    };
  } catch (error) {
    console.error('Error storing post on IPFS:', error);
    throw new Error('Failed to store post on IPFS');
  }
}

/**
 * Fetches post content from IPFS using the CID
 * @param cid The IPFS content identifier
 * @returns Promise resolving to the post content
 */
export async function fetchPostFromIPFS(cid: string): Promise<PostMetadata> {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${cid}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from IPFS:', error);
    throw new Error('Failed to fetch content from IPFS');
  }
}