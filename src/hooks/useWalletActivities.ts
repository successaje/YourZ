import { useEffect, useState } from 'react';

export function useWalletActivities(address?: string) {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    setError(null);

    // Use Basescan (baseSepolia) API
    const API_KEY = process.env.NEXT_PUBLIC_BASESCAN_API_KEY;
    const url = `https://api-sepolia.basescan.org/api?module=account&action=txlist&address=${address}&sort=desc&apikey=${API_KEY}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === '1') {
          setActivities(data.result);
        } else {
          setActivities([]);
          setError(data.message || 'No transactions found');
        }
      })
      .catch((err) => setError('Failed to fetch transactions'))
      .finally(() => setLoading(false));
  }, [address]);

  return { activities, loading, error };
}
