import { create } from 'ipfs-http-client'

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_ID
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_PROJECT_SECRET
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
})

export async function uploadToIPFS(data: any): Promise<string> {
  try {
    const result = await client.add(JSON.stringify(data))
    return result.path
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw error
  }
}

export async function getFromIPFS(hash: string): Promise<any> {
  try {
    const stream = client.cat(hash)
    let data = ''
    for await (const chunk of stream) {
      data += chunk.toString()
    }
    return JSON.parse(data)
  } catch (error) {
    console.error('Error retrieving from IPFS:', error)
    throw error
  }
}

export function getIPFSGatewayURL(hash: string): string {
  return `https://ipfs.io/ipfs/${hash}`
} 