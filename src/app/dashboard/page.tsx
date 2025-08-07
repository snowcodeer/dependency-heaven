// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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



interface PackageAnalysis {
  repo_name: string
  package_name?: string
  dependencies: { [key: string]: string }
  devDependencies: { [key: string]: string }
  description?: string
  version?: string
  score?: number
  scoreLevel?: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  error?: string
}

export default function Dashboard() {
  const router = useRouter()
  const [repositories, setRepositories] = useState<Repository[]>([])
  const [packageAnalysis, setPackageAnalysis] = useState<PackageAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
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
      
      // Cache the repositories
      cacheRepositories(repoArray)
      
      // Auto-start dependency analysis
      setTimeout(() => analyzeRepositories(repoArray), 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Error fetching repositories:', err)
      setError(errorMessage)
      setRepositories([]) // Reset to empty array on error
    } finally {
      setLoading(false)
    }
  }

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds
  const REPOS_CACHE_KEY = 'github_repositories_cache'
  const ANALYSIS_CACHE_KEY = 'dependency_analysis_cache'

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData()
  }, [])

  const loadCachedData = () => {
    try {
      // Load cached repositories
      const cachedRepos = localStorage.getItem(REPOS_CACHE_KEY)
      if (cachedRepos) {
        const { data, timestamp } = JSON.parse(cachedRepos)
        const isExpired = Date.now() - timestamp > CACHE_DURATION
        
        if (!isExpired && Array.isArray(data)) {
          console.log('📦 Loading repositories from cache')
          setRepositories(data)
          setLoading(false)
          
          // Load cached analysis if available and auto-start analysis
          const cachedAnalysis = localStorage.getItem(ANALYSIS_CACHE_KEY)
          if (cachedAnalysis) {
            const { data: analysisData, timestamp: analysisTimestamp } = JSON.parse(cachedAnalysis)
            const isAnalysisExpired = Date.now() - analysisTimestamp > CACHE_DURATION
            
            if (!isAnalysisExpired && Array.isArray(analysisData)) {
              console.log('🔍 Loading analysis results from cache')
              setPackageAnalysis(analysisData)
              return
            }
          }
          
          // If repos cached but no analysis, start analysis
          setTimeout(() => analyzeRepositories(data), 500)
          return
        } else {
          console.log('⏰ Cache expired, fetching fresh data')
          localStorage.removeItem(REPOS_CACHE_KEY)
          localStorage.removeItem(ANALYSIS_CACHE_KEY)
        }
      }
    } catch (error) {
      console.error('Error loading cached data:', error)
      localStorage.removeItem(REPOS_CACHE_KEY)
      localStorage.removeItem(ANALYSIS_CACHE_KEY)
    }
    
    // If no valid cache, fetch fresh data
    fetchRepositories()
  }

  const cacheRepositories = (repos: Repository[]) => {
    try {
      const cacheData = {
        data: repos,
        timestamp: Date.now()
      }
      localStorage.setItem(REPOS_CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 Repositories cached successfully')
    } catch (error) {
      console.error('Error caching repositories:', error)
    }
  }

  const cacheAnalysis = (analysis: PackageAnalysis[]) => {
    try {
      const cacheData = {
        data: analysis,
        timestamp: Date.now()
      }
      localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(cacheData))
      console.log('💾 Analysis results cached successfully')
    } catch (error) {
      console.error('Error caching analysis:', error)
    }
  }

  const analyzeRepositories = async (reposToAnalyze?: Repository[]) => {
    const repos = reposToAnalyze || repositories
    if (repos.length === 0) return
    
    setAnalyzing(true)
    setError(null)
    
    try {
      console.log('🔍 Starting dependency analysis...')
      
      const analysisResults: PackageAnalysis[] = []
      
      // Analyze each repository
      for (const repo of repos) {
        try {
          console.log(`Analyzing ${repo.name}...`)
          
          let response;
          try {
            response = await fetch(`http://localhost:8000/file-content/${repo.name}`)
          } catch (localError) {
            console.log('⚠️ localhost failed, trying 127.0.0.1...')
            response = await fetch(`http://127.0.0.1:8000/file-content/${repo.name}`)
          }
          
          if (response.ok) {
            const data = await response.json()
            
            // Extract package.json data
            if (data.content?.data?.parsed_json) {
              const packageJson = data.content.data.parsed_json
              const deps = packageJson.dependencies || {}
              const devDeps = packageJson.devDependencies || {}
              const score = calculateDependencyScore(deps, devDeps)
              
              analysisResults.push({
                repo_name: repo.name,
                package_name: packageJson.name || repo.name,
                dependencies: deps,
                devDependencies: devDeps,
                description: packageJson.description,
                version: packageJson.version,
                score: score.score,
                scoreLevel: score.level
              })
            } else {
              // No package.json found
              analysisResults.push({
                repo_name: repo.name,
                dependencies: {},
                devDependencies: {},
                error: 'No package.json found'
              })
            }
          } else {
            analysisResults.push({
              repo_name: repo.name,
              dependencies: {},
              devDependencies: {},
              error: `Failed to fetch: ${response.status}`
            })
          }
        } catch (err) {
          console.error(`Error analyzing ${repo.name}:`, err)
          analysisResults.push({
            repo_name: repo.name,
            dependencies: {},
            devDependencies: {},
            error: err instanceof Error ? err.message : 'Unknown error'
          })
        }
      }
      
      setPackageAnalysis(analysisResults)
      
      // Cache the analysis results
      cacheAnalysis(analysisResults)
      
      console.log('✅ Analysis complete!')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('❌ Error analyzing repositories:', err)
      setError(errorMessage)
    } finally {
      setAnalyzing(false)
    }
  }

  const calculateDependencyScore = (deps: { [key: string]: string }, devDeps: { [key: string]: string }) => {
    let score = 100 // Start with perfect score

    const totalDeps = Object.keys(deps).length + Object.keys(devDeps).length
    const securityRisks = ['lodash', 'minimist', 'ws', 'node-ipc', 'colors', 'faker', 'left-pad', 'event-stream', 'flatmap-stream']
    const heavyPackages = ['react', 'angular', 'vue', 'webpack', 'babel', '@babel/core', 'typescript']

    // Penalize for too many dependencies
    if (totalDeps > 50) score -= 30
    else if (totalDeps > 30) score -= 20
    else if (totalDeps > 20) score -= 10
    else if (totalDeps > 10) score -= 5

    // Penalize for security risks
    Object.keys({ ...deps, ...devDeps }).forEach(depName => {
      if (securityRisks.includes(depName)) {
        score -= 15
      }
      if (heavyPackages.includes(depName)) {
        score -= 5
      }
    })

    // Bonus for minimal dependencies
    if (totalDeps <= 5) score += 10
    if (totalDeps <= 3) score += 5

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score))

    // Determine score level
    let level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
    if (score >= 90) level = 'EXCELLENT'
    else if (score >= 75) level = 'GOOD'
    else if (score >= 60) level = 'FAIR'
    else if (score >= 40) level = 'POOR'
    else level = 'CRITICAL'

    return { score, level }
  }

  const getScoreColor = (scoreLevel?: string) => {
    switch (scoreLevel) {
      case 'EXCELLENT': return 'text-green-400 bg-green-900/20 border-green-500'
      case 'GOOD': return 'text-blue-400 bg-blue-900/20 border-blue-500'
      case 'FAIR': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500'
      case 'POOR': return 'text-orange-400 bg-orange-900/20 border-orange-500'
      case 'CRITICAL': return 'text-red-400 bg-red-900/20 border-red-500'
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500'
    }
  }

  const openAnalyzer = (repo: Repository, analysis?: PackageAnalysis) => {
    if (analysis && !analysis.error) {
      // Create package.json structure for the analyzer
      const packageJson = {
        name: analysis.package_name || analysis.repo_name,
        version: analysis.version || "1.0.0",
        description: analysis.description || "",
        dependencies: analysis.dependencies,
        devDependencies: analysis.devDependencies
      }

      // Store the package data in localStorage for the analyzer page
      const packageData = {
        id: Date.now(),
        name: analysis.repo_name,
        content: JSON.stringify(packageJson, null, 2),
        analyzed: false
      }

      localStorage.setItem('analyzerPackage', JSON.stringify(packageData))
    }
    
    // Navigate to analyzer
    router.push('/analyzer')
  }

  const getRepositoryAnalysis = (repoName: string) => {
    return packageAnalysis.find(analysis => analysis.repo_name === repoName)
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
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            🚀 Repository Dashboard
          </h1>
          <p className="text-gray-400 text-lg">
            GitHub repositories with dependency analysis and scoring
          </p>
        </div>
        
        {/* Connect to GitHub Button */}
        <button className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 rounded-lg border border-gray-600 hover:border-gray-500 transition-all duration-300 flex items-center gap-3 group">
          <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span className="text-gray-300 group-hover:text-white font-medium">Connect to GitHub</span>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      </div>

            {/* Stats */}
      {Array.isArray(repositories) && repositories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
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
              {packageAnalysis.filter(p => !p.error).length}
            </div>
            <div className="text-sm text-gray-400">With Dependencies</div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-1">
              {packageAnalysis.filter(p => p.score).length > 0 
                ? Math.round(packageAnalysis.filter(p => p.score).reduce((sum, p) => sum + (p.score || 0), 0) / packageAnalysis.filter(p => p.score).length)
                : analyzing ? '...' : '0'}
            </div>
            <div className="text-sm text-gray-400">Average Score</div>
          </div>
        </div>
      )}
      
      {/* Analysis Status */}
      {analyzing && (
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-full border border-purple-500/30">
            <div className="w-3 h-3 border border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-purple-400">Analyzing dependencies...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-8 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

            {/* Repository Cards */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-white mb-4">Loading Repositories...</h2>
          <p className="text-gray-400 text-lg">
            Fetching your GitHub repositories
          </p>
        </div>
      ) : (!Array.isArray(repositories) || repositories.length === 0) && !error ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">📁</div>
          <h2 className="text-2xl font-semibold text-white mb-4">No Repositories Found</h2>
          <p className="text-gray-400 text-lg">
            No repositories were found for your account
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.isArray(repositories) && repositories.map((repo) => {
            const analysis = getRepositoryAnalysis(repo.name)
            return (
            <div 
              key={repo.id}
              onClick={() => openAnalyzer(repo, analysis)}
              className="bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 overflow-hidden group cursor-pointer hover:bg-gray-700/30"
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

                {/* Score Progress Bar */}
                {analysis && analysis.score !== undefined ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Dependency Score</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{analysis.score}</span>
                        <span className={`px-2 py-1 text-xs rounded-full border ${getScoreColor(analysis.scoreLevel)}`}>
                          {analysis.scoreLevel}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          analysis.score >= 90 ? 'bg-green-500' :
                          analysis.score >= 75 ? 'bg-blue-500' :
                          analysis.score >= 60 ? 'bg-yellow-500' :
                          analysis.score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${analysis.score}%` }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {Object.keys(analysis.dependencies).length + Object.keys(analysis.devDependencies).length} dependencies
                    </div>
                  </div>
                ) : analyzing ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Analyzing...</span>
                      <div className="w-4 h-4 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gray-600 h-3 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">No package.json found</div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gray-600 h-3 rounded-full w-0"></div>
                    </div>
                  </div>
                )}

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
          )})}
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