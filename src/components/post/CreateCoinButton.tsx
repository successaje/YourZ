import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePostCoin } from '@/hooks/usePostCoin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

export function CreateCoinButton({
  post,
  disabled = false,
  variant = 'default',
  className = '',
  onSuccess,
}: {
  post: {
    id: string;
    title: string;
    content: string;
    author_id: string;
  };
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  className?: string;
  onSuccess?: (postCoin: any) => void;
}) {
  const { createCoinForPost, isCreating, error } = usePostCoin();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateCoin = async () => {
    const result = await createCoinForPost(post);
    if (result) {
      onSuccess?.(result);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          disabled={disabled || isCreating}
          className={className}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Post Coin'
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a Coin for Your Post</DialogTitle>
          <DialogDescription>
            Create a community token for your post. This will deploy an ERC20 token on the blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">Post: {post.title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will create a new token that can be used for community engagement.
            </p>
          </div>
          
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCoin}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Coin'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
