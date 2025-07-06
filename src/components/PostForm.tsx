'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useZoraMint } from '../hooks/useZoraMint';

// DEPRECATED: This component uses the old mintNFT approach - using individual contracts per post now
// export function PostForm() {
//   const [title, setTitle] = useState('');
//   const [content, setContent] = useState('');
//   const [isMinting, setIsMinting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   
//   const { address } = useAccount();
//   const { mintNFT } = useZoraMint();

  // DEPRECATED: Entire component body commented out - using individual contracts per post now
  // const handleSubmit = async (e: React.FormEvent) => {
  //   // ... entire function body commented out ...
  // };

  // return (
  //   // ... entire JSX commented out ...
  // );
}
