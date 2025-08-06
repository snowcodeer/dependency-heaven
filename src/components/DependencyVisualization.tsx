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
}

export function DependencyVisualization({ 
  combinedData, 
  filter, 
  searchTerm, 
  selectedPackage 
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

    // Create simulation
    const simulation = d3.forceSimulation(combinedData.nodes)
      .force("link", d3.forceLink(combinedData.links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-500))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40))

    simulationRef.current = simulation

    // Create links
    const link = svg.append("g")
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
    const node = svg.append("g")
      .selectAll("circle")
      .data(combinedData.nodes)
      .enter().append("circle")
      .attr("r", (d: any) => {
        if (d.type === 'main') return 25
        if (d.issues.length > 0) return 18
        return 12
      })
      .attr("fill", (d: any) => {
        if (d.issues.includes('security')) return '#F87171'
        if (d.issues.includes('conflict')) return '#FB923C'
        if (d.type === 'main') return '#6B7280'
        if (d.type === 'dependency') return '#4ADE80'
        if (d.type === 'dev-dependency') return '#60A5FA'
        if (d.type === 'peer-dependency') return '#A78BFA'
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
        content += `Package: ${d.package}<br>`
        content += `Type: ${d.type}<br>`
        content += `Version: ${d.version}<br>`
        
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
    const labels = svg.append("g")
      .selectAll("text")
      .data(combinedData.nodes)
      .enter().append("text")
      .attr("class", "node-label")
      .text((d: any) => {
        const name = d.displayName || d.id
        return name.length > 15 ? name.substring(0, 13) + "..." : name
      })
      .attr("font-size", (d: any) => d.type === 'main' ? "11px" : "9px")
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
    svgNode.visualization = { node, link, labels }

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
      node.style("opacity", (d: any) => d.issues.includes("conflict") || d.type === "main" ? 1 : 0.2)
      link.style("opacity", (d: any) => d.type === "conflict" ? 1 : 0.1)
      labels.style("opacity", (d: any) => d.issues.includes("conflict") || d.type === "main" ? 1 : 0.2)
    } else if (filter === 'security') {
      node.style("opacity", (d: any) => d.issues.includes("security") || d.type === "main" ? 1 : 0.2)
      link.style("opacity", (d: any) => d.type === "security" ? 1 : 0.1)
      labels.style("opacity", (d: any) => d.issues.includes("security") || d.type === "main" ? 1 : 0.2)
    } else if (filter === 'critical') {
      node.style("opacity", (d: any) => d.issues.length > 0 || d.type === "main" ? 1 : 0.2)
      link.style("opacity", (d: any) => d.type === "conflict" || d.type === "security" ? 1 : 0.1)
      labels.style("opacity", (d: any) => d.issues.length > 0 || d.type === "main" ? 1 : 0.2)
    }

    // Apply search filter
    if (searchTerm) {
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

    // Apply package selection
    if (selectedPackage) {
      node.style("opacity", (d: any) => d.package === selectedPackage ? 1 : 0.3)
      labels.style("opacity", (d: any) => d.package === selectedPackage ? 1 : 0.3)
    }
  }, [filter, searchTerm, selectedPackage])

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