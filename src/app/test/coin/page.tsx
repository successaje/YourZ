import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the TestZoraCoinSuite component with SSR disabled
const TestZoraCoinSuite = dynamic(
  () => import('@/components/TestZoraCoinSuite'),
  { ssr: false }
);

export default function TestCoinPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Zora Coin Test Suite</h1>
      <Suspense fallback={<div>Loading Zora Coin Test Suite...</div>}>
        <TestZoraCoinSuite />
      </Suspense>
    </div>
  );
}
