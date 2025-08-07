// src/components/IssuesList.tsx
import { useState } from 'react'
import { CombinedData } from '@/types/package'

interface IssuesListProps {
  combinedData: CombinedData
}

interface Issue {
  type: string
  message: string
  packages: string[]
  severity?: string
}

export function IssuesList({ combinedData }: IssuesListProps) {
  const [creatingIssues, setCreatingIssues] = useState<Set<string>>(new Set())
  const [createdIssues, setCreatedIssues] = useState<Set<string>>(new Set())

  const handleCreateIssue = async (issue: Issue, index: number) => {
    const issueKey = `${issue.type}-${index}`
    
    if (creatingIssues.has(issueKey) || createdIssues.has(issueKey)) {
      return
    }

    setCreatingIssues(prev => new Set(prev).add(issueKey))

    try {
      // Extract dependency name from the message if possible
      const dependencyMatch = issue.message.match(/([a-z0-9\-_@\/]+)\s+(?:has|version|conflict)/i)
      const dependencyName = dependencyMatch ? dependencyMatch[1] : null

      // Create issue title and description
      const issueTitle = `${issue.type.toUpperCase()}: ${issue.message.split(' ').slice(0, 8).join(' ')}...`
      const issueDescription = `
## Issue Type: ${issue.type.toUpperCase()}

**Description:** ${issue.message}

**Severity:** ${issue.severity || 'medium'}

**Affected Packages:** ${issue.packages.join(', ')}

${dependencyName ? `**Dependency:** ${dependencyName}` : ''}

---
*This issue was automatically created by the Dependency Analyzer.*
      `.trim()

      // Assuming we're dealing with the first affected package's repository
      const repoName = issue.packages[0] || 'unknown-repo'

      const response = await fetch('http://localhost:8000/create-issue-with-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repo_name: repoName,
          issue_title: issueTitle,
          issue_description: issueDescription,
          dependency_name: dependencyName
        }),
      })

      const result = await response.json()

      if (result.success) {
        setCreatedIssues(prev => new Set(prev).add(issueKey))
        
        // Open the created issue in a new tab if URL is available
        if (result.issue_url) {
          window.open(result.issue_url, '_blank')
        }
      } else {
        console.error('Failed to create issue:', result.error)
        alert(`Failed to create issue: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating issue:', error)
      alert('Failed to create issue. Please try again.')
    } finally {
      setCreatingIssues(prev => {
        const newSet = new Set(prev)
        newSet.delete(issueKey)
        return newSet
      })
    }
  }
  if (combinedData.issues.length === 0) {
    return (
      <section className="mb-8">
        <h3 className="text-green-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
          ⚠️ Issues Detected
        </h3>
        <div className="p-3 bg-green-900/20 border border-green-500 rounded-lg text-green-200 text-sm">
          ✅ No issues detected
        </div>
      </section>
    )
  }

  // Group issues by type
  const groupedIssues = {
    security: combinedData.issues.filter(i => i.type === 'security'),
    conflict: combinedData.issues.filter(i => i.type === 'conflict'),
    warning: combinedData.issues.filter(i => i.type === 'warning')
  }

  return (
    <section className="mb-8">
      <h3 className="text-green-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
        ⚠️ Issues Detected
      </h3>
      <div className="max-h-80 overflow-y-auto space-y-3">
        {Object.entries(groupedIssues).map(([type, issues]) => 
          issues.map((issue, index) => {
            const issueKey = `${type}-${index}`
            const isCreating = creatingIssues.has(issueKey)
            const isCreated = createdIssues.has(issueKey)
            
            return (
              <div 
                key={issueKey} 
                className={`p-3 rounded-lg text-sm border-l-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                  type === 'security' 
                    ? 'bg-red-900/20 border-red-500 text-red-200 hover:bg-red-900/30'
                    : type === 'conflict'
                    ? 'bg-orange-900/20 border-orange-500 text-orange-200 hover:bg-orange-900/30'
                    : 'bg-blue-900/20 border-blue-500 text-blue-200 hover:bg-blue-900/30'
                } ${isCreated ? 'opacity-75' : ''}`}
                onClick={() => handleCreateIssue(issue, index)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold">{type.toUpperCase()}</div>
                  <div className="flex items-center gap-2">
                    {isCreating && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isCreated ? (
                      <span className="text-green-400 text-xs">✓ Issue Created</span>
                    ) : (
                      <span className="text-xs opacity-60">Click to create issue</span>
                    )}
                  </div>
                </div>
                <div className="mb-2 leading-tight">{issue.message}</div>
                <div className="text-xs opacity-70">
                  Affects: {issue.packages.join(', ')}
                </div>
                {issue.severity && (
                  <div className="text-xs opacity-60 mt-1">
                    Severity: {issue.severity}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}