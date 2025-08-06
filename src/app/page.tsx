'use client'

import { useState, useCallback } from 'react'
import { PackageInputs } from '@/components/PackageInputs'
import { AnalysisPanel } from '@/components/AnalysisPanel'
import { Package, AnalyzedPackage, CombinedData } from '@/types/package'

const SECURITY_RISKS = ['lodash', 'minimist', 'ws', 'node-ipc', 'colors', 'faker', 'left-pad', 'event-stream', 'flatmap-stream']
const CONFLICT_PRONE = ['react', 'react-dom', '@types/react', 'typescript', 'webpack', 'babel', '@babel/core', 'eslint']

const SAMPLE_PACKAGES = [
  {
    name: 'Frontend App',
    content: JSON.stringify({
      "name": "frontend-app",
      "version": "1.0.0",
      "dependencies": {
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "axios": "^1.6.0",
        "lodash": "^4.17.21",
        "@stripe/stripe-js": "^2.1.0"
      },
      "devDependencies": {
        "@types/react": "^18.2.0",
        "@types/react-dom": "^18.2.0",
        "typescript": "^5.2.0",
        "vite": "^4.4.0",
        "eslint": "^8.50.0"
      }
    }, null, 2)
  },
  {
    name: 'Backend API',
    content: JSON.stringify({
      "name": "backend-api",
      "version": "1.0.0",
      "dependencies": {
        "express": "^4.18.0",
        "mongoose": "^7.5.0",
        "bcryptjs": "^2.4.3",
        "jsonwebtoken": "^9.0.2",
        "lodash": "^4.17.21",
        "cors": "^2.8.5"
      },
      "devDependencies": {
        "@types/node": "^20.6.0",
        "typescript": "^5.2.0",
        "nodemon": "^3.0.1",
        "jest": "^29.7.0"
      }
    }, null, 2)
  },
  {
    name: 'Shared Library',
    content: JSON.stringify({
      "name": "shared-utils",
      "version": "1.0.0",
      "dependencies": {
        "zod": "^3.22.0",
        "date-fns": "^2.30.0",
        "lodash": "^4.17.21"
      },
      "devDependencies": {
        "typescript": "^5.2.0",
        "vitest": "^0.34.0"
      },
      "peerDependencies": {
        "react": "^18.0.0"
      }
    }, null, 2)
  }
]

export default function Home() {
  const [packages, setPackages] = useState<Package[]>([
    { id: 0, name: 'Package 1', content: '', analyzed: false }
  ])
  const [combinedData, setCombinedData] = useState<CombinedData | null>(null)
  const [allAnalyzedData, setAllAnalyzedData] = useState<(AnalyzedPackage | null)[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzePackageData = useCallback((packageData: any, packageName: string): AnalyzedPackage => {
    const nodes: any[] = []
    const links: any[] = []
    const issues: any[] = []
    
    // Main package node
    const mainNodeId = `${packageName}`
    nodes.push({
      id: mainNodeId,
      type: 'main',
      version: packageData.version || '1.0.0',
      issues: [],
      package: packageName
    })

    // Process dependencies
    const deps = packageData.dependencies || {}
    const devDeps = packageData.devDependencies || {}
    const peerDeps = packageData.peerDependencies || {}
    
    // Add dependency nodes
    Object.entries(deps).forEach(([name, version]) => {
      const nodeIssues: string[] = []
      if (SECURITY_RISKS.includes(name)) nodeIssues.push('security')
      if (CONFLICT_PRONE.includes(name)) nodeIssues.push('conflict')
      
      const nodeId = `${packageName}:${name}`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'dependency',
        version: version,
        issues: nodeIssues,
        package: packageName
      })
      
      links.push({
        source: mainNodeId,
        target: nodeId,
        type: 'dependency'
      })
    })

    // Add dev dependency nodes
    Object.entries(devDeps).forEach(([name, version]) => {
      const nodeIssues: string[] = []
      if (SECURITY_RISKS.includes(name)) nodeIssues.push('security')
      if (CONFLICT_PRONE.includes(name)) nodeIssues.push('conflict')
      
      const nodeId = `${packageName}:${name}:dev`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'dev-dependency',
        version: version,
        issues: nodeIssues,
        package: packageName
      })
      
      links.push({
        source: mainNodeId,
        target: nodeId,
        type: 'dev-dependency'
      })
    })

    // Add peer dependency nodes
    Object.entries(peerDeps).forEach(([name, version]) => {
      const nodeIssues: string[] = []
      if (CONFLICT_PRONE.includes(name)) nodeIssues.push('conflict')
      
      const nodeId = `${packageName}:${name}:peer`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'peer-dependency',
        version: version,
        issues: nodeIssues,
        package: packageName
      })
      
      links.push({
        source: mainNodeId,
        target: nodeId,
        type: 'peer-dependency'
      })
    })

    // Check for security issues
    nodes.forEach(node => {
      if (node.issues.includes('security')) {
        issues.push({
          type: 'security',
          message: `${node.displayName || node.id} has known security vulnerabilities`,
          packages: [packageName],
          severity: 'high'
        })
      }
    })

    return {
      nodes,
      links,
      packageData,
      packageName,
      issues
    }
  }, [])

  const combineAnalyzedData = useCallback((analyzedData: (AnalyzedPackage | null)[]): CombinedData => {
    const allNodes: any[] = []
    const allLinks: any[] = []
    const allIssues: any[] = []
    
    // Combine all nodes and links
    analyzedData.forEach(data => {
      if (data) {
        allNodes.push(...data.nodes)
        allLinks.push(...data.links)
        allIssues.push(...data.issues)
      }
    })
    
    // Find cross-package dependencies (shared dependencies)
    const dependencyMap = new Map()
    allNodes.forEach(node => {
      if (node.type !== 'main') {
        const depName = node.displayName
        if (!dependencyMap.has(depName)) {
          dependencyMap.set(depName, [])
        }
        dependencyMap.get(depName).push(node)
      }
    })
    
    // Create links between packages that share dependencies
    dependencyMap.forEach((nodes, depName) => {
      if (nodes.length > 1) {
        // Check for version conflicts
        const versions = new Set(nodes.map((n: any) => n.version))
        if (versions.size > 1) {
          allIssues.push({
            type: 'conflict',
            message: `Version conflict for ${depName} across packages: ${Array.from(versions).join(', ')}`,
            packages: nodes.map((n: any) => n.package),
            severity: 'medium'
          })
          
          // Mark nodes as having conflicts
          nodes.forEach((node: any) => {
            if (!node.issues.includes('conflict')) {
              node.issues.push('conflict')
            }
          })
        }
        
        // Create cross-package dependency links
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const hasConflict = nodes[i].issues.includes('conflict')
            allLinks.push({
              source: nodes[i].id,
              target: nodes[j].id,
              type: hasConflict ? 'conflict' : 'shared'
            })
          }
        }
      }
    })
    
    return {
      nodes: allNodes,
      links: allLinks,
      issues: allIssues,
      packages: analyzedData.filter(Boolean) as AnalyzedPackage[]
    }
  }, [])

  const handleAnalyzeAll = async () => {
    setIsAnalyzing(true)
    const newAnalyzedData: (AnalyzedPackage | null)[] = []
    
    try {
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i]
        if (pkg.content.trim()) {
          try {
            const packageData = JSON.parse(pkg.content)
            const analyzed = analyzePackageData(packageData, pkg.name)
            newAnalyzedData[i] = analyzed
          } catch (error) {
            console.error(`Error analyzing ${pkg.name}:`, error)
          }
        }
      }
      
      setAllAnalyzedData(newAnalyzedData)
      
      if (newAnalyzedData.filter(Boolean).length > 0) {
        const combined = combineAnalyzedData(newAnalyzedData)
        setCombinedData(combined)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const updatePackages = useCallback((updatedPackages: Package[]) => {
    setPackages(updatedPackages)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-black to-slate-900 text-white max-w-7xl mx-auto">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-2">
          📊 Multi-Package Dependency Analyzer
        </h1>
        <p className="text-gray-400 text-lg">
          Analyze multiple package.json files and visualize cross-project dependencies
        </p>
      </header>

      <PackageInputs 
        packages={packages}
        onUpdatePackages={updatePackages}
        onAnalyzeAll={handleAnalyzeAll}
        isAnalyzing={isAnalyzing}
        samplePackages={SAMPLE_PACKAGES}
      />

      {combinedData ? (
        <AnalysisPanel 
          combinedData={combinedData}
          allAnalyzedData={allAnalyzedData}
        />
      ) : (
        <div className="text-center py-20 text-gray-400">
          <div className="text-6xl mb-6">📋</div>
          <h2 className="text-2xl font-semibold text-white mb-4">Ready to Analyze Dependencies</h2>
          <p className="text-lg">Add your package.json files in the text areas above to start analyzing</p>
          <div className="mt-6">
            <p className="text-sm">Need test data? Click "Load Sample" on any package tab</p>
          </div>
        </div>
      )}
    </div>
  )
}