// src/components/StatsGrid.tsx
import { CombinedData } from '@/types/package'

interface StatsGridProps {
  combinedData: CombinedData
}

export function StatsGrid({ combinedData }: StatsGridProps) {
  const totalDeps = combinedData.nodes.filter(n => n.type === 'dependency').length
  const totalDevDeps = combinedData.nodes.filter(n => n.type === 'dev-dependency').length
  const totalPeerDeps = combinedData.nodes.filter(n => n.type === 'peer-dependency').length
  const securityIssues = combinedData.issues.filter(i => i.type === 'security').length
  const conflicts = combinedData.issues.filter(i => i.type === 'conflict').length
  const totalPackages = combinedData.packages.length

  const stats = [
    { label: 'Packages', value: totalPackages, color: 'text-green-400' },
    { label: 'Dependencies', value: totalDeps, color: 'text-blue-400' },
    { label: 'Dev Dependencies', value: totalDevDeps, color: 'text-purple-400' },
    { label: 'Security Issues', value: securityIssues, color: 'text-red-400' },
    { label: 'Version Conflicts', value: conflicts, color: 'text-orange-400' },
    { label: 'Peer Dependencies', value: totalPeerDeps, color: 'text-slate-400' }
  ]

  return (
    <section className="mb-8">
      <h3 className="text-green-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
        📈 Overall Statistics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-center hover:border-green-500 transition-all duration-300">
            <div className={`text-2xl font-bold mb-1 ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}