'use client'

import { useState, useCallback, useEffect } from 'react'
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
      "displayName": "Frontend App",
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
      "displayName": "Backend API",
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
      "displayName": "Shared Library",
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

export default function Analyzer() {
  const [packages, setPackages] = useState<Package[]>([
    { id: 0, name: 'Package 1', content: '', analyzed: false }
  ])
  const [combinedData, setCombinedData] = useState<CombinedData | null>(null)
  const [allAnalyzedData, setAllAnalyzedData] = useState<(AnalyzedPackage | null)[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  // Load package data from localStorage if available (from dashboard)
  useEffect(() => {
    const savedPackage = localStorage.getItem('analyzerPackage')
    if (savedPackage) {
      try {
        const packageData = JSON.parse(savedPackage)
        setPackages([packageData])
        // Clear from localStorage after loading
        localStorage.removeItem('analyzerPackage')
        // Auto-analyze the loaded package
        setTimeout(() => {
          handleAnalyzeAll()
        }, 100)
      } catch (error) {
        console.error('Error loading package from localStorage:', error)
      }
    }
  }, [])

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
      package: packageData.name || packageName,
      displayName: packageData.displayName || packageName
    })

    // Process dependencies
    const deps = packageData.dependencies || {}
    const devDeps = packageData.devDependencies || {}
    const peerDeps = packageData.peerDependencies || {}
    
    // Add dependency nodes
    Object.entries(deps).forEach(([name, version]) => {
      const nodeIssues: string[] = []
      if (SECURITY_RISKS.includes(name)) nodeIssues.push('security')
      
      const nodeId = `${packageName}:${name}`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'dependency',
        version: version,
        issues: nodeIssues,
        package: packageName,
        conflictProne: CONFLICT_PRONE.includes(name)
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
      
      const nodeId = `${packageName}:${name}:dev`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'dev-dependency',
        version: version,
        issues: nodeIssues,
        package: packageName,
        conflictProne: CONFLICT_PRONE.includes(name)
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
      
      const nodeId = `${packageName}:${name}:peer`
      nodes.push({
        id: nodeId,
        displayName: name,
        type: 'peer-dependency',
        version: version,
        issues: nodeIssues,
        package: packageName,
        conflictProne: CONFLICT_PRONE.includes(name)
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
    
    // First, collect all main package nodes
    analyzedData.forEach(data => {
      if (data) {
        const mainNode = data.nodes.find(node => node.type === 'main')
        if (mainNode) {
          allNodes.push(mainNode)
        }
      }
    })
    
    // Find cross-package dependencies (shared dependencies)
    const dependencyMap = new Map()
    const packageToMainNodeMap = new Map()
    
    // Build package to main node mapping
    analyzedData.forEach(data => {
      if (data) {
        const mainNode = data.nodes.find(node => node.type === 'main')
        if (mainNode) {
          packageToMainNodeMap.set(data.packageName, mainNode.id)
        }
      }
    })
    
    // Collect all dependency nodes and group by name
    analyzedData.forEach(data => {
      if (data) {
        data.nodes.forEach(node => {
          if (node.type !== 'main') {
            const depName = node.displayName
            if (!dependencyMap.has(depName)) {
              dependencyMap.set(depName, [])
            }
            dependencyMap.get(depName).push({
              ...node,
              sourcePackage: data.packageName
            })
          }
        })
      }
    })
    
    // Process shared dependencies
    dependencyMap.forEach((nodes, depName) => {
      if (nodes.length > 1) {
        // Check for version conflicts
        const versions = new Set(nodes.map((n: any) => n.version))
        const hasVersionConflict = versions.size > 1
        
        // Check for security issues
        const hasSecurityIssue = nodes.some((n: any) => n.issues.includes('security'))
        
        if (hasVersionConflict) {
          allIssues.push({
            type: 'conflict',
            message: `Version conflict for ${depName} across packages: ${Array.from(versions).join(', ')}`,
            packages: nodes.map((n: any) => n.sourcePackage),
            severity: 'medium'
          })
        }
        
        if (hasSecurityIssue) {
          allIssues.push({
            type: 'security',
            message: `${depName} has known security vulnerabilities`,
            packages: nodes.map((n: any) => n.sourcePackage),
            severity: 'high'
          })
        }
        
        // Create a single shared dependency node
        const sharedNodeIssues: string[] = []
        if (hasVersionConflict) sharedNodeIssues.push('conflict')
        if (hasSecurityIssue) sharedNodeIssues.push('security')
        
        // Check if any of the original nodes are conflict-prone
        const isConflictProne = nodes.some((n: any) => n.conflictProne)
        
        const sharedNode = {
          id: `shared:${depName}`,
          displayName: depName,
          type: 'shared-dependency',
          version: Array.from(versions).join(' / '),
          issues: sharedNodeIssues,
          packages: nodes.map((n: any) => n.sourcePackage),
          originalNodes: nodes,
          conflictProne: isConflictProne
        }
        
        allNodes.push(sharedNode)
        
        // Create links from each package to the shared dependency
        nodes.forEach((node: any) => {
          const mainNodeId = packageToMainNodeMap.get(node.sourcePackage)
          if (mainNodeId) {
            allLinks.push({
              source: mainNodeId,
              target: sharedNode.id,
              type: node.type,
              originalType: node.type
            })
          }
        })
      } else {
        // Single dependency - keep as is
        const node = nodes[0]
        allNodes.push(node)
        
        // Add security issues for single dependencies
        if (node.issues.includes('security')) {
          allIssues.push({
            type: 'security',
            message: `${node.displayName} has known security vulnerabilities`,
            packages: [node.sourcePackage],
            severity: 'high'
          })
        }
        
        // Create link from package to dependency
        const mainNodeId = packageToMainNodeMap.get(node.sourcePackage)
        if (mainNodeId) {
          allLinks.push({
            source: mainNodeId,
            target: node.id,
            type: node.type
          })
        }
      }
    })
    
    // Add any remaining issues from individual packages
    analyzedData.forEach(data => {
      if (data) {
        allIssues.push(...data.issues)
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
    
    // Reset filter states to default
    setFilter('all')
    setSearchTerm('')
    setSelectedPackage(null)
    
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
          🔍 Dependency Analyzer
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
          filter={filter}
          setFilter={setFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPackage={selectedPackage}
          setSelectedPackage={setSelectedPackage}
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