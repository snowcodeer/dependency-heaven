// src/components/DependencyVisualization.tsx
'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { CombinedData } from '@/types/package'

interface DependencyVisualizationProps {
  combinedData: CombinedData
  filter: string
  searchTerm: string
  selectedPackage: string | null
  resetTrigger: number
  fitScreenTrigger: number
}

export function DependencyVisualization({ 
  combinedData, 
  filter, 
  searchTerm, 
  selectedPackage,
  resetTrigger,
  fitScreenTrigger
}: DependencyVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const simulationRef = useRef<d3.Simulation<any, any> | null>(null)

  useEffect(() => {
    if (!combinedData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 1200
    const height = 700

    // Clear previous visualization
    svg.selectAll("*").remove()

    // Create a group to contain all elements for transform support
    const g = svg.append("g")

    // Create simulation
    const simulation = d3.forceSimulation(combinedData.nodes)
      .force("link", d3.forceLink(combinedData.links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40))

    simulationRef.current = simulation

    // Create links
    const link = g.append("g")
      .selectAll("line")
      .data(combinedData.links)
      .enter().append("line")
      .attr("class", (d: any) => `link ${d.type}`)
      .attr("stroke", (d: any) => {
        if (d.type === 'dependency') return '#4ADE80'
        if (d.type === 'dev-dependency') return '#60A5FA'
        if (d.type === 'peer-dependency') return '#A78BFA'
        if (d.type === 'conflict') return '#FB923C'
        if (d.type === 'security') return '#F87171'
        if (d.type === 'shared') return '#6B7280'
        return '#374151'
      })
      .attr("stroke-width", (d: any) => {
        if (d.type === 'conflict' || d.type === 'security') return 3
        if (d.type === 'shared') return 2
        return 1
      })
      .attr("stroke-opacity", 0.6)

    // Create nodes
    const node = g.append("g")
      .selectAll("circle")
      .data(combinedData.nodes)
      .enter().append("circle")
      .attr("r", (d: any) => {
        if (d.type === 'main') return 25
        if (d.type === 'shared-dependency') return 20
        if (d.issues.length > 0) return 18
        return 12
      })
      .attr("fill", (d: any) => {
        if (d.issues.includes('security')) return '#F87171'
        if (d.issues.includes('conflict')) return '#FB923C'
        if (d.type === 'main') return '#6B7280'
        if (d.type === 'shared-dependency') return '#F59E0B'
        if (d.type === 'dependency') return d.conflictProne ? '#86EFAC' : '#4ADE80' // Lighter green for conflict-prone
        if (d.type === 'dev-dependency') return d.conflictProne ? '#93C5FD' : '#60A5FA' // Lighter blue for conflict-prone
        if (d.type === 'peer-dependency') return d.conflictProne ? '#C4B5FD' : '#A78BFA' // Lighter purple for conflict-prone
        return '#9CA3AF'
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .call(d3.drag<SVGCircleElement, any>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on("drag", (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        }))
      .on("mouseover", (event, d: any) => {
        // Create tooltip
        const tooltip = d3.select("body").append("div")
          .attr("class", "tooltip")
          .style("opacity", 0)

        let content = `<strong>${d.displayName || d.id}</strong><br>`
        
        if (d.type === 'shared-dependency') {
          content += `Type: Shared Dependency<br>`
          content += `Version: ${d.version}<br>`
          content += `Used by: ${d.packages.join(', ')}<br>`
        } else {
          content += `Package: ${d.package}<br>`
          content += `Type: ${d.type}<br>`
          content += `Version: ${d.version}<br>`
        }
        
        if (d.issues.length > 0) {
          content += `<br><strong>Issues:</strong><br>`
          d.issues.forEach((issue: string) => {
            content += `• ${issue}<br>`
          })
        }

        tooltip.html(content)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px")
          .transition()
          .duration(200)
          .style("opacity", 1)
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove()
      })

    // Add labels
    const labels = g.append("g")
      .selectAll("text")
      .data(combinedData.nodes)
      .enter().append("text")
      .attr("class", "node-label")
      .text((d: any) => {
        const name = d.displayName || d.id
        return name.length > 15 ? name.substring(0, 13) + "..." : name
      })
      .attr("font-size", (d: any) => {
        if (d.type === 'main') return "11px"
        if (d.type === 'shared-dependency') return "10px"
        return "9px"
      })
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("fill", "#fff")
      .attr("pointer-events", "none")

    // Update positions on tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y)

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y)
        
      labels
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y + 4)
    })

    // Store references for filtering
    const svgNode = svg.node() as any
    svgNode.visualization = { node, link, labels, g }

    return () => {
      simulation.stop()
    }
  }, [combinedData])

  // Apply filters
  useEffect(() => {
    const svg = d3.select(svgRef.current)
    const viz = (svg.node() as any)?.visualization
    if (!viz) return

    const { node, link, labels } = viz

    // Reset opacity
    node.style("opacity", 1)
    link.style("opacity", 0.6)
    labels.style("opacity", 1)

    // Apply filter
    if (filter === 'conflicts') {
      node.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.includes("conflict") ? 1 : 0.1
        }
        return d.issues.includes("conflict") ? 1 : 0.1
      })
      link.style("opacity", (d: any) => {
        const sourceHasConflict = d.source.issues && d.source.issues.includes("conflict")
        const targetHasConflict = d.target.issues && d.target.issues.includes("conflict")
        return sourceHasConflict || targetHasConflict ? 0.8 : 0.1
      })
      labels.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.includes("conflict") ? 1 : 0.1
        }
        return d.issues.includes("conflict") ? 1 : 0.1
      })
    } else if (filter === 'security') {
      node.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.includes("security") ? 1 : 0.1
        }
        return d.issues.includes("security") ? 1 : 0.1
      })
      link.style("opacity", (d: any) => {
        const sourceHasSecurity = d.source.issues && d.source.issues.includes("security")
        const targetHasSecurity = d.target.issues && d.target.issues.includes("security")
        return sourceHasSecurity || targetHasSecurity ? 0.8 : 0.1
      })
      labels.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.includes("security") ? 1 : 0.1
        }
        return d.issues.includes("security") ? 1 : 0.1
      })
    } else if (filter === 'critical') {
      node.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.length > 0 ? 1 : 0.1
        }
        return d.issues.length > 0 ? 1 : 0.1
      })
      link.style("opacity", (d: any) => {
        const sourceHasIssues = d.source.issues && d.source.issues.length > 0
        const targetHasIssues = d.target.issues && d.target.issues.length > 0
        return sourceHasIssues || targetHasIssues ? 0.8 : 0.1
      })
      labels.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        if (d.type === 'shared-dependency') {
          return d.issues.length > 0 ? 1 : 0.1
        }
        return d.issues.length > 0 ? 1 : 0.1
      })
    } else if (filter === 'shared') {
      node.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        return d.type === 'shared-dependency' ? 1 : 0.1
      })
      link.style("opacity", (d: any) => {
        const sourceIsShared = d.source.type === 'shared-dependency'
        const targetIsShared = d.target.type === 'shared-dependency'
        return sourceIsShared || targetIsShared ? 0.8 : 0.1
      })
      labels.style("opacity", (d: any) => {
        if (d.type === 'main') return 1
        return d.type === 'shared-dependency' ? 1 : 0.1
      })
    }

    // Apply search filter (only if no other filter is active)
    if (searchTerm && filter === 'all') {
      const searchLower = searchTerm.toLowerCase()
      node.style("opacity", (d: any) => {
        const name = (d.displayName || d.id).toLowerCase()
        return name.includes(searchLower) ? 1 : 0.2
      })
      labels.style("opacity", (d: any) => {
        const name = (d.displayName || d.id).toLowerCase()
        return name.includes(searchLower) ? 1 : 0.2
      })
    }

    // Apply package selection (only if no other filter is active)
    if (selectedPackage && filter === 'all') {
      node.style("opacity", (d: any) => {
        if (d.type === 'shared-dependency') {
          return d.packages.includes(selectedPackage) ? 1 : 0.3
        }
        return d.package === selectedPackage ? 1 : 0.3
      })
      labels.style("opacity", (d: any) => {
        if (d.type === 'shared-dependency') {
          return d.packages.includes(selectedPackage) ? 1 : 0.3
        }
        return d.package === selectedPackage ? 1 : 0.3
      })
    }
  }, [filter, searchTerm, selectedPackage])

  // Handle reset view
  useEffect(() => {
    if (resetTrigger > 0 && simulationRef.current) {
      const simulation = simulationRef.current
      
      // Reset all node positions
      combinedData.nodes.forEach((node: any) => {
        node.fx = null
        node.fy = null
      })
      
      // Restart simulation with higher alpha for smooth animation
      simulation.alpha(1).restart()
    }
  }, [resetTrigger, combinedData.nodes])

  // Handle fit screen
  useEffect(() => {
    if (fitScreenTrigger > 0 && svgRef.current) {
      const svg = d3.select(svgRef.current)
      const viz = (svg.node() as any)?.visualization
      if (!viz || !viz.g) return
      
      const width = 1200
      const height = 700
      
      // Get current node positions
      const nodes = combinedData.nodes
      if (nodes.length === 0) return
      
      // Calculate bounds
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      nodes.forEach((node: any) => {
        if (node.x !== undefined && node.y !== undefined) {
          minX = Math.min(minX, node.x)
          minY = Math.min(minY, node.y)
          maxX = Math.max(maxX, node.x)
          maxY = Math.max(maxY, node.y)
        }
      })
      
      // Add padding
      const padding = 50
      minX -= padding
      minY -= padding
      maxX += padding
      maxY += padding
      
      // Calculate scale to fit
      const scaleX = width / (maxX - minX)
      const scaleY = height / (maxY - minY)
      const scale = Math.min(scaleX, scaleY, 1) // Don't zoom in beyond 1x
      
      // Calculate center
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      
      // Apply transform
      viz.g.transition()
        .duration(750)
        .attr('transform', `translate(${width/2 - centerX * scale}, ${height/2 - centerY * scale}) scale(${scale})`)
    }
  }, [fitScreenTrigger, combinedData.nodes])

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      <svg 
        ref={svgRef}
        width={1200}
        height={700}
        className="w-full h-full bg-slate-900"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  )
}