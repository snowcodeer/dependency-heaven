'use client'

export default function Dashboard() {
  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black to-slate-900 text-white max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
          🚀 ACI.dev Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          GitHub integration with ACI.dev
        </p>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-12 border border-gray-700 text-center">
        <div className="text-6xl mb-6">🚧</div>
        <h2 className="text-2xl font-semibold text-white mb-4">Dashboard Coming Soon</h2>
        <p className="text-gray-400 text-lg mb-6">
          This dashboard will integrate with ACI.dev for GitHub repository management.
        </p>
        <div className="bg-gray-700/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="text-lg font-medium text-blue-400 mb-3">Planned Features</h3>
          <ul className="text-gray-300 space-y-2 text-left">
            <li>• Star and manage GitHub repositories</li>
            <li>• Fetch user repository data</li>
            <li>• Repository analytics and insights</li>
            <li>• ACI.dev integration for automation</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 