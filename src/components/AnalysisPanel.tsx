// src/components/AnalysisPanel.tsx
'use client'

import { useState } from 'react'
import { StatsGrid } from './StatsGrid'
import { PackagesList } from './PackagesList'
import { IssuesList } from './IssuesList'
import { VisualizationControls } from './VisualizationControls'
import { DependencyVisualization } from './DependencyVisualization'
import { CombinedData, AnalyzedPackage } from '@/types/package'

interface AnalysisPanelProps {
  combinedData: CombinedData
  allAnalyzedData: (AnalyzedPackage | null)[]
  filter: string
  setFilter: (filter: string) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  selectedPackage: string | null
  setSelectedPackage: (pkg: string | null) => void
}

export function AnalysisPanel({ 
  combinedData, 
  allAnalyzedData,
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
  selectedPackage,
  setSelectedPackage
}: AnalysisPanelProps) {
  const [resetTrigger, setResetTrigger] = useState(0)
  const [fitScreenTrigger, setFitScreenTrigger] = useState(0)

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[350px_1fr] gap-6 mb-8">
      <aside className="bg-slate-800/50 rounded-xl p-6 h-fit">
        <StatsGrid combinedData={combinedData} />
        <PackagesList 
          allAnalyzedData={allAnalyzedData}
          selectedPackage={selectedPackage}
          onSelectPackage={setSelectedPackage}
        />
        <IssuesList combinedData={combinedData} />
        <VisualizationControls 
          filter={filter}
          onFilterChange={setFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </aside>
      
      <main className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700">
        <div className="bg-slate-800/50 p-4 border-b border-slate-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-green-400">Dependency Network Visualization</h2>
            {filter !== 'all' && (
              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Filter: {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button 
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-all duration-300"
              onClick={() => {
                setResetTrigger(prev => prev + 1)
                setFilter('all')
                setSearchTerm('')
                setSelectedPackage(null)
              }}
            >
              Reset View
            </button>
            <button 
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm transition-all duration-300"
              onClick={() => setFitScreenTrigger(prev => prev + 1)}
            >
              Fit Screen
            </button>
          </div>
        </div>
        <DependencyVisualization 
          combinedData={combinedData}
          filter={filter}
          searchTerm={searchTerm}
          selectedPackage={selectedPackage}
          resetTrigger={resetTrigger}
          fitScreenTrigger={fitScreenTrigger}
        />
      </main>
    </div>
  )
}
