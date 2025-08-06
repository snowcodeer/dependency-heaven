// src/types/package.ts

import { SimulationNodeDatum, SimulationLinkDatum } from 'd3'

// Rest of your types remain the same...
export interface Package {
    id: number
    name: string
    content: string
    analyzed: boolean
  }
  
  export interface PackageNode extends SimulationNodeDatum {
    id: string
    displayName?: string
    type: 'main' | 'dependency' | 'dev-dependency' | 'peer-dependency'
    version: string
    issues: string[]
    package: string
  }
  
  export interface PackageLink extends SimulationLinkDatum<PackageNode> {
    source: string | PackageNode
    target: string | PackageNode
    type: string
  }
  
  export interface Issue {
    type: string
    message: string
    packages: string[]
    severity: string
  }
  
  export interface AnalyzedPackage {
    nodes: PackageNode[]
    links: PackageLink[]
    packageData: any
    packageName: string
    issues: Issue[]
  }
  
  export interface CombinedData {
    nodes: PackageNode[]
    links: PackageLink[]
    issues: Issue[]
    packages: AnalyzedPackage[]
  }
  
  export interface SamplePackage {
    name: string
    content: string
  }