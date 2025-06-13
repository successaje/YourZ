import { NextResponse } from 'next/server';
import { ipfsClient } from '@/lib/ipfs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = await file.arrayBuffer();
    const ipfsHash = await ipfsClient.uploadFile(Buffer.from(buffer));

    // Return the IPFS URL
    return NextResponse.json({
      url: `https://ipfs.io/ipfs/${ipfsHash}`
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 