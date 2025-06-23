import TestIPFSService from '@/components/TestIPFSService';

export default function IPFSTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">IPFS Upload Test</h1>
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <TestIPFSService />
      </div>
      
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li>Click the "Upload Test JSON" button to test JSON uploads</li>
          <li>Check the browser console for detailed logs</li>
          <li>If successful, you'll see the IPFS hash and a success message</li>
          <li>You can also test file uploads using the file picker</li>
        </ol>
      </div>
    </div>
  );
}
