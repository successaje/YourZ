// Zora 1155 Simple Utility: Deploy
// Uses @zoralabs/protocol-sdk
// Assumes existence of uploadToIPFS utility

import { createCreatorClient, create1155, createNew1155Token } from '@zoralabs/protocol-sdk';



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

  // 4.5 Prepare the new contract creation parameters
  // const{ parameters} = await create1155({
  //   contract: {
  //     name,
  //     uri: metadataUrl,
  //   },
  //   token: {
  //     tokenMetadataURI: metadataUrl,
  //   },
  //   account: account as `0x${string}`,
  //   publicClient,
  // })

  // 5. Return contract address and transaction hash (to be sent externally)
  return { contractAddress, parameters };
}

// --- Deploy ERC1155 Contract (Zora Starter App style) ---
// Only deploy logic, minimal and robust
export async function deployAnotherZora1155Contract({
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
  const { parameters, contractAddress } = await create1155({
    contract: {
      name,
      uri: metadataUrl,
    },
    token: {
      tokenMetadataURI: metadataUrl,
    },
    account: account as `0x${string}`,
    publicClient,
  });

  // 5. Return contract address and transaction hash (to be sent externally)
  return { parameters, contractAddress };
}


import { createCollectorClient } from '@zoralabs/protocol-sdk';
import { writeContract, waitForTransactionReceipt } from '@wagmi/core';

// Export the create1155 function for use in other files
export { create1155 };

export async function mintZora1155NFT({
  tokenId,
  quantity = 1,
  minterAccount,
  publicClient,
  chainId,
  config,
  contractAddress,
}: {
  tokenId: bigint;
  quantity?: number;
  minterAccount: `0x${string}`;
  publicClient: any;
  chainId: number;
  config: any;
  contractAddress: `0x${string}`;
}): Promise<{ receipt: any; explorerLink: string }> {
  if (!publicClient || !minterAccount || !tokenId) {
    throw new Error('Missing required mint data');
  }
  const collectorClient = createCollectorClient({
    chainId,
    publicClient,
  });
  const { parameters } = await collectorClient.mint({
    tokenContract: contractAddress as `0x${string}`, //'0x1ec58892306C6C742703885feDe69B546302249b',
    mintType: '1155',
    tokenId,
    quantityToMint: quantity,
    minterAccount,
  });
  const hash = await writeContract(config, parameters);
  const receipt = await waitForTransactionReceipt(config, { hash });
  const explorerLink = `https://sepolia.basescan.org/tx/${receipt.transactionHash}`;
  return { receipt, explorerLink };
}
  
