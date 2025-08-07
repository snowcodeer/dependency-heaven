'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
            📊 Dependency Heaven
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Advanced dependency analysis and GitHub integration platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Analyzer Card */}
          <Link href="/analyzer" className="group">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 hover:border-green-500/50 transition-all duration-300 group-hover:bg-gray-800/70">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">Dependency Analyzer</h2>
              <p className="text-gray-400 mb-6">
                Analyze multiple package.json files and visualize cross-project dependencies with advanced conflict detection and security scanning.
              </p>
              <div className="flex items-center text-green-400 group-hover:text-green-300">
                <span>Start Analyzing</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group-hover:bg-gray-800/70">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-blue-400 mb-4">ACI Dashboard</h2>
              <p className="text-gray-400 mb-6">
                Manage your GitHub repositories with ACI.dev integration. Star repos, fetch user data, and more.
              </p>
              <div className="flex items-center text-blue-400 group-hover:text-blue-300">
                <span>Open Dashboard</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2 text-green-400">Smart Analysis</h3>
              <p className="text-gray-400">Detect version conflicts, security vulnerabilities, and dependency issues across multiple projects.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-blue-400">Visual Insights</h3>
              <p className="text-gray-400">Interactive dependency graphs and detailed analytics to understand your project structure.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold mb-2 text-purple-400">GitHub Integration</h3>
              <p className="text-gray-400">Seamless integration with GitHub through ACI.dev for repository management and automation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}