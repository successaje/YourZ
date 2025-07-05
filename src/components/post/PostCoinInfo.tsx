import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy } from 'lucide-react';
import { formatEther } from 'viem';
import { useToast } from '@/components/ui/use-toast';
import { usePostCoin } from '@/hooks/usePostCoin';
import { Loader2 } from 'lucide-react';

export function PostCoinInfo({ 
  postCoin,
  post,
  onRefresh,
  className = '' 
}: { 
  postCoin: {
    id: string;
    contract_address: string;
    name: string;
    symbol: string;
    total_supply: number;
    created_at: string;
  };
  post: {
    id: string;
    title: string;
  };
  onRefresh?: () => void;
  className?: string;
}) {
  const { toast } = useToast();
  const { isCreating } = usePostCoin();
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Contract address copied to clipboard',
    });
  };

  const viewOnExplorer = () => {
    window.open(
      `https://sepolia.basescan.org/token/${postCoin.contract_address}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Post Coin</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Token</h4>
            <p className="text-lg font-semibold">{postCoin.name} ({postCoin.symbol})</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Supply</h4>
            <p className="text-lg font-mono">
              {new Intl.NumberFormat().format(postCoin.total_supply)} {postCoin.symbol}
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contract Address</h4>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono truncate">
                {postCoin.contract_address}
              </p>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => copyToClipboard(postCoin.contract_address)}
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="sr-only">Copy address</span>
              </Button>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={viewOnExplorer}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
