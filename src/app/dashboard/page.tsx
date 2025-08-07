// src/app/dashboard/page.tsx
'use client'

import { useState } from 'react'

interface Repository {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  private: boolean
  updated_at: string
  owner: {
    login: string
    avatar_url: string
  }
  fork: boolean
  open_issues_count: number
  license: {
    key: string
    name: string
    spdx_id: string
  } | null
  topics: string[]
}

export default function Dashboard() {
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRepositories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🚀 Attempting to fetch from http://localhost:8000/repositories')
      
      // Try localhost first, fallback to 127.0.0.1 if needed
      let response;
      try {
        response = await fetch('http://localhost:8000/repositories')
      } catch (localError) {
        console.log('⚠️ localhost failed, trying 127.0.0.1...')
        response = await fetch('http://127.0.0.1:8000/repositories')
      }
      
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ API Response:', data)
      
      // Ensure we always set an array
      const repoArray = Array.isArray(data.repositories) ? data.repositories : []
      console.log('📊 Setting repositories:', repoArray.length, 'items')
      setRepositories(repoArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Error fetching repositories:', err)
      setError(errorMessage)
      setRepositories([]) // Reset to empty array on error
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLanguageColor = (language: string | null) => {
    const colors: { [key: string]: string } = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'C++': '#f34b7d',
      'C': '#555555',
      'CSS': '#563d7c',
      'HTML': '#e34c26',
      'PHP': '#4F5D95',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33'
    }
    return language ? colors[language] || '#6366f1' : '#6b7280'
  }

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

      {/* Controls and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <button 
            onClick={fetchRepositories}
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              'Fetch Repositories'
            )}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {Array.isArray(repositories) && repositories.length > 0 && (
          <>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {repositories.length}
              </div>
              <div className="text-sm text-gray-400">Total Repositories</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {repositories.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)}
              </div>
              <div className="text-sm text-gray-400">Total Stars</div>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                {repositories.filter(r => !r.private).length}
              </div>
              <div className="text-sm text-gray-400">Public Repos</div>
            </div>
          </>
        )}
      </div>

      {/* Repository Cards */}
      {(!Array.isArray(repositories) || repositories.length === 0) && !loading && !error ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📁</div>
          <h2 className="text-2xl font-semibold text-white mb-4">No Repositories Loaded</h2>
          <p className="text-gray-400 text-lg">
            Click "Fetch Repositories" to load your GitHub repos
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(repositories) && repositories.map((repo) => (
            <div 
              key={repo.id} 
              className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 overflow-hidden group"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <img 
                      src={repo.owner.avatar_url} 
                      alt={repo.owner.login}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-white truncate">
                        <a 
                          href={repo.html_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:text-blue-400 transition-colors"
                        >
                          {repo.name}
                        </a>
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {repo.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.fork && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded border border-blue-600/50">
                        Fork
                      </span>
                    )}
                    {repo.private ? (
                      <span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 text-xs rounded border border-yellow-600/50">
                        🔒 Private
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded border border-green-600/50">
                        🌐 Public
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-4 h-10 overflow-hidden">
                  {repo.description || 'No description available'}
                </p>

                {/* Topics */}
                {repo.topics && repo.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {repo.topics.slice(0, 3).map((topic, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                    {repo.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">
                        +{repo.topics.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 pb-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <div className="flex items-center gap-4">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getLanguageColor(repo.language) }}
                        ></div>
                        {repo.language}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      ⭐ {repo.stargazers_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      🍴 {repo.forks_count.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Updated {formatDate(repo.updated_at)}</span>
                  {repo.license && (
                    <span className="flex items-center gap-1">
                      📄 {repo.license.spdx_id}
                    </span>
                  )}
                </div>

                {repo.open_issues_count > 0 && (
                  <div className="mt-2 text-xs text-orange-400">
                    🚨 {repo.open_issues_count} open issues
                  </div>
                )}
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}

      {/* API Status */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full border border-gray-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">
            FastAPI Backend: Running on 0.0.0.0:8000
          </span>
        </div>
      </div>
    </div>
  )
}