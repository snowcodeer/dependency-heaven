// src/components/PackagesList.tsx
import { AnalyzedPackage } from '@/types/package'

interface PackagesListProps {
  allAnalyzedData: (AnalyzedPackage | null)[]
  selectedPackage: string | null
  onSelectPackage: (packageName: string | null) => void
}

export function PackagesList({ allAnalyzedData, selectedPackage, onSelectPackage }: PackagesListProps) {
  return (
    <section className="mb-8">
      <h3 className="text-green-400 text-lg font-semibold mb-4 pb-2 border-b border-slate-700">
        📦 Analyzed Packages
      </h3>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {allAnalyzedData.filter(Boolean).map((data, index) => {
          if (!data) return null
          
          const deps = data.nodes.filter(n => n.type === 'dependency').length
          const devDeps = data.nodes.filter(n => n.type === 'dev-dependency').length
          const issues = data.issues.length
          const isSelected = selectedPackage === data.packageName

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-slate-700 bg-slate-900/50 hover:border-green-500 hover:bg-green-900/20'
              }`}
              onClick={() => onSelectPackage(isSelected ? null : data.packageName)}
            >
              <div className="font-semibold text-green-400 mb-1">{data.packageName}</div>
              <div className="text-xs text-gray-400">
                {deps} deps • {devDeps} dev • {issues} issues
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
