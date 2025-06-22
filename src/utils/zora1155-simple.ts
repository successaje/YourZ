// Zora 1155 Simple Utility: Deploy
// Uses @zoralabs/protocol-sdk
// Assumes existence of uploadToIPFS utility

import { createCreatorClient } from '@zoralabs/protocol-sdk';

// --- Deploy ERC1155 Contract (Zora Starter App style) ---
// Only deploy logic, minimal and robust
export async function deployZora1155Contract({
  name,
  description = '',
  image,
  publicClient,
  account,
  uploadFileToIpfs,
  uploadJsonToIpfs,
}: {
  name: string;
  description?: string;
  image: File | string;
  publicClient: any;
  account: string;
  uploadFileToIpfs: (file: File | string) => Promise<string>;
  uploadJsonToIpfs: (json: any, filename?: string) => Promise<string>;
}): Promise<{ contractAddress: string; parameters: any }> {
  if (!publicClient || !account || !image) {
    throw new Error('Missing required data for deployment');
  }

  // 1. Upload image to IPFS
  const imageUrl = await uploadFileToIpfs(image);

  // 2. Create and upload metadata
  const metadata = {
    name,
    description,
    image: imageUrl,
  };
  const metadataUrl = await uploadJsonToIpfs(metadata, 'metadata.json');

  // 3. Create Zora creator client
  const creatorClient = createCreatorClient({
    chainId: publicClient.chain.id,
    publicClient,
  });

  // 4. Prepare contract creation parameters
  const { parameters, contractAddress } = await creatorClient.create1155({
    contract: {
      name,
      uri: metadataUrl,
    },
    token: {
      tokenMetadataURI: metadataUrl,
    },
    account: account as `0x${string}`,
  });

  // 5. Return contract address and transaction hash (to be sent externally)
  return { contractAddress, parameters };
}


export async function mintZora1155NFT({
  
