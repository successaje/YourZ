import { NFT } from '@/types/nft'
import NFTCard from '@/components/marketplace/NFTCard'

interface NFTGridProps {
  nfts: NFT[]
}

export default function NFTGrid({ nfts }: NFTGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={`${nft.contractAddress}-${nft.tokenId}`} nft={nft} />
      ))}
    </div>
  )
}
