// src/components/IssuesList.tsx
import { CombinedData } from '@/types/package'

interface IssuesListProps {
  combinedData: CombinedData
}

export function IssuesList({ combinedData }: IssuesListProps) {
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
          issues.map((issue, index) => (
            <div key={`${type}-${index}`} className={`p-3 rounded-lg text-sm border-l-4 ${
              type === 'security' 
                ? 'bg-red-900/20 border-red-500 text-red-200'
                : type === 'conflict'
                ? 'bg-orange-900/20 border-orange-500 text-orange-200'
                : 'bg-blue-900/20 border-blue-500 text-blue-200'
            }`}>
              <div className="font-semibold mb-2">{type.toUpperCase()}</div>
              <div className="mb-2 leading-tight">{issue.message}</div>
              <div className="text-xs opacity-70">
                Affects: {issue.packages.join(', ')}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}