import dynamic from 'next/dynamic';

// Dynamically import the client-side only component with no SSR
const TestTokenSuiteClient = dynamic(
  () => import('./TestTokenSuite.client'),
  { 
    ssr: false,
    loading: () => (
      <div className="p-6 max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow-md">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="space-y-6 py-4">
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            <div className="h-40 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }
);

// This is a simple wrapper that only renders the client-side component
export default function TestTokenSuite() {
  return <TestTokenSuiteClient />;
}
