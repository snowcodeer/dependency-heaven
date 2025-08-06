// src/components/PackageInputs.tsx
'use client'

import { useState } from 'react'
import { Package, SamplePackage } from '@/types/package'

interface PackageInputsProps {
  packages: Package[]
  onUpdatePackages: (packages: Package[]) => void
  onAnalyzeAll: () => void
  isAnalyzing: boolean
  samplePackages: SamplePackage[]
}

export function PackageInputs({ 
  packages, 
  onUpdatePackages, 
  onAnalyzeAll, 
  isAnalyzing,
  samplePackages 
}: PackageInputsProps) {
  const [activeTab, setActiveTab] = useState(0)

  const addPackage = () => {
    const newId = Math.max(...packages.map(p => p.id)) + 1
    const newPackages = [...packages, {
      id: newId,
      name: `Package ${packages.length + 1}`,
      content: '',
      analyzed: false
    }]
    onUpdatePackages(newPackages)
    setActiveTab(packages.length)
  }

  const removePackage = (id: number) => {
    if (packages.length <= 1) return
    
    const newPackages = packages.filter(p => p.id !== id)
    onUpdatePackages(newPackages)
    
    if (activeTab >= newPackages.length) {
      setActiveTab(newPackages.length - 1)
    }
  }

  const updatePackage = (id: number, updates: Partial<Package>) => {
    const newPackages = packages.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
    onUpdatePackages(newPackages)
  }

  const validateJSON = (content: string) => {
    if (!content.trim()) return { isValid: false, message: '' }
    
    try {
      const parsed = JSON.parse(content)
      const depCount = Object.keys(parsed.dependencies || {}).length
      return {
        isValid: true,
        message: `✅ Valid JSON - Found ${depCount} dependencies`
      }
    } catch (error: any) {
      return {
        isValid: false,
        message: `❌ Invalid JSON: ${error.message}`
      }
    }
  }

  const loadSample = (index: number) => {
    const sample = samplePackages[index % samplePackages.length]
    const pkg = packages[activeTab]
    updatePackage(pkg.id, {
      name: sample.name,
      content: sample.content
    })
  }

  return (
    <section className="bg-slate-800/50 rounded-xl p-8 mb-8 border-2 border-slate-700">
      <div className="flex flex-wrap gap-2 mb-6">
      // Replace the tab button section with this:
        {packages.map((pkg, index) => (
        <div
            key={pkg.id}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg transition-all duration-300 cursor-pointer ${
            activeTab === index 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
        >
            <span
            className="flex-1"
            onClick={() => setActiveTab(index)}
            >
            {pkg.name}
            </span>
            {packages.length > 1 && (
            <button
                className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs"
                onClick={(e) => {
                e.stopPropagation()
                removePackage(pkg.id)
                }}
                title="Remove package"
            >
                ×
            </button>
            )}
        </div>
        ))}
      </div>

      {packages.map((pkg, index) => {
        const validation = validateJSON(pkg.content)
        
        return (
          <div
            key={pkg.id}
            className={activeTab === index ? 'block' : 'hidden'}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <input
                type="text"
                className="bg-slate-900 border border-slate-600 rounded px-4 py-2 text-white min-w-[200px]"
                value={pkg.name}
                onChange={(e) => updatePackage(pkg.id, { name: e.target.value })}
                placeholder="Package Name"
              />
              <div className="flex gap-3">
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 rounded transition-all duration-300"
                  onClick={() => loadSample(index)}
                >
                  Load Sample
                </button>
                <button 
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded transition-all duration-300"
                  onClick={() => updatePackage(pkg.id, { content: '' })}
                >
                  Clear
                </button>
              </div>
            </div>
            
            <textarea
              className={`w-full h-80 bg-slate-900 border rounded-lg p-4 text-white font-mono text-sm leading-relaxed resize-y ${
                !validation.isValid && pkg.content.trim() 
                  ? 'border-red-500 shadow-red-500/20 shadow-lg' 
                  : 'border-slate-600 focus:border-green-500'
              }`}
              value={pkg.content}
              onChange={(e) => updatePackage(pkg.id, { content: e.target.value })}
              placeholder="Paste your package.json content here..."
            />
            
            {validation.message && (
              <div className={`mt-3 p-3 rounded text-sm ${
                validation.isValid 
                  ? 'bg-green-900/50 border border-green-500 text-green-200'
                  : 'bg-red-900/50 border border-red-500 text-red-200'
              }`}>
                {validation.message}
              </div>
            )}
          </div>
        )
      })}

      <div className="text-center mt-8">
        <button 
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={onAnalyzeAll}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? '🔄 Analyzing...' : '🚀 Analyze All Packages'}
        </button>
      </div>
    </section>
  )
}