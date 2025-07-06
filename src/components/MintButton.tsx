import { useState } from 'react';
import { useZoraMint } from '@/hooks/useZoraMint';
import { Loader2 } from 'lucide-react';

interface MintButtonProps {
  tokenURI: string;
  tokenName: string;
  className?: string;
}

export function MintButton({ tokenURI, tokenName, className }: MintButtonProps) {
  const { mint, isMinting } = useZoraMint();
  const [mintSuccess, setMintSuccess] = useState(false);

  const handleMint = async () => {
    const result = await mint(tokenURI);
    if (result?.success) {
      setMintSuccess(true);
    }
  };

  if (mintSuccess) {
    return (
      <button 
        disabled 
        className={`px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed ${className || ''}`}
      >
        Minted! 🎉
      </button>
    );
  }

  return (
    <button 
      onClick={handleMint} 
      disabled={isMinting}
      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className || ''}`}
    >
      {isMinting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Minting...
        </>
      ) : (
        `Mint ${tokenName}`
      )}
    </button>
  );
}
