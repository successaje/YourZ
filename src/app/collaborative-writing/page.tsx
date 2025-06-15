'use client'

import Navigation from '@/components/Navigation'

export default function CollaborativeWritingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Collaborative Writing</h1>

        <div className="space-y-12">
          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Collaborative Writing on YourZ</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                YourZ enables seamless collaboration between writers through blockchain technology. Create content together, split revenue automatically, and build writing teams that share success.
              </p>
              <div className="grid gap-6 md:grid-cols-3 mt-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Team Up</h3>
                  <p className="text-gray-600 dark:text-gray-400">Write with multiple authors</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Split Revenue</h3>
                  <p className="text-gray-600 dark:text-gray-400">Automatic payment distribution</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Build Together</h3>
                  <p className="text-gray-600 dark:text-gray-400">Create writing collectives</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Key Features</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multi-Author Posts</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Invite co-authors to your posts</li>
                  <li>Real-time collaborative editing</li>
                  <li>Version history and changes</li>
                  <li>Multi-signature publishing</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Revenue Splits</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Set custom split percentages</li>
                  <li>Automatic payment distribution</li>
                  <li>Transparent revenue sharing</li>
                  <li>Smart contract enforcement</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How to Collaborate */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Collaborate</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Getting Started</h3>
                <ol className="list-decimal list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Create a new post or select an existing draft</li>
                  <li>Invite co-authors using their wallet addresses</li>
                  <li>Set revenue split percentages</li>
                  <li>Start collaborating in real-time</li>
                  <li>Publish when all authors approve</li>
                </ol>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Best Practices</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                  <li>Communicate clearly with co-authors</li>
                  <li>Set clear expectations for contributions</li>
                  <li>Agree on revenue splits upfront</li>
                  <li>Use version control for major changes</li>
                  <li>Maintain consistent writing style</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Writing Teams */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Writing Teams</h2>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Creating a Team</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Form a writing collective</li>
                    <li>Set up team wallet</li>
                    <li>Define team roles</li>
                    <li>Establish publishing guidelines</li>
                    <li>Create team profile</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Team Benefits</h3>
                  <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                    <li>Shared audience growth</li>
                    <li>Combined expertise</li>
                    <li>Consistent publishing schedule</li>
                    <li>Higher quality content</li>
                    <li>Stronger brand presence</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
} 