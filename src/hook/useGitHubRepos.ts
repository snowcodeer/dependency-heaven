'use client'

import { useState } from 'react'

export function useGitHubRepos() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getRepositories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:8000/repositories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch repositories')
      }

      const data = await response.json()
      return data.repositories
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { getRepositories, loading, error }
}