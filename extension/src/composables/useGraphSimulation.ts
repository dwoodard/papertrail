import { ref, onMounted, onUnmounted, Ref } from 'vue'
import * as d3 from 'd3'

export interface GraphNode {
  id: string
  name: string
  type: 'business' | 'person' | 'location' | 'website' | 'contact'
  value?: number
  confidence?: number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  project?: {
    id: string
    name: string
    goal?: string
  }
}

export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: string
  status: 'confirmed' | 'suggested'
  evidence?: string
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

export type ViewModeId = 'Project' | 'Type' | 'Cluster'

export const GRID_CONFIG = {
  nodesPerRow: 4,
  horizontalGap: 600,
  verticalGap: 600,
  forceStrength: 0.25,
}

export interface ViewModeConfig {
  id: ViewModeId
  label: string
  description: string
  showClusters: boolean
  colorBy: 'type' | 'project' | 'cluster' | 'custom'
}

export const VIEW_MODES: Record<ViewModeId, ViewModeConfig> = {
  Cluster: {
    id: 'Cluster',
    label: 'View by Cluster',
    description: 'Connection-based grouping',
    showClusters: true,
    colorBy: 'cluster',
  },
  Project: {
    id: 'Project',
    label: 'Project View',
    description: 'Organized by project',
    showClusters: true,
    colorBy: 'project',
  },
  Type: {
    id: 'Type',
    label: 'View by Type',
    description: 'Organized by entity type',
    showClusters: false,
    colorBy: 'type',
  },
}

export interface GraphViewState {
  zoom: { k: number; x: number; y: number }
  selectedNodeId: string | null
  viewMode: ViewModeId
}

export interface GraphConfig {
  minConfidence: Ref<number>
  repulsion: Ref<number>
  showSuggested: Ref<boolean>
  visibleTypes?: Ref<Set<string>>
}

export interface GridConfigOverride {
  nodesPerRow?: number
  horizontalGap?: number
  verticalGap?: number
  forceStrength?: number
}

export function useGraphSimulation(container: Ref<HTMLElement | null>, config?: GraphConfig) {
  const selectedNode = ref<GraphNode | null>(null)
  const highlightedNodes = ref<Set<string>>(new Set())
  const lockedNodes = ref<Set<string>>(new Set())
  const simulation = ref<d3.Simulation<GraphNode, GraphLink> | null>(null)
  const viewState = ref<GraphViewState>({ zoom: { k: 1, x: 0, y: 0 }, selectedNodeId: null, viewMode: 'Cluster' })
  const gridConfigOverride = ref<GridConfigOverride>({})
  const zoomBehavior = ref<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const defaultConfig: GraphConfig = {
    minConfidence: ref(0),
    repulsion: ref(-600),
    showSuggested: ref(true),
  }

  const activeConfig = config || defaultConfig

  function initializeGraph(data: GraphData, onNodeSelect: (node: GraphNode | null) => void, isHubView = false) {
    if (!container.value) {
      console.error('Container not available')
      return
    }

    // Filter nodes by confidence threshold and visible types
    const visibleTypes = activeConfig.visibleTypes?.value
    const filteredNodes = data.nodes.filter(n => {
      const meetsConfidence = (n.confidence || 1) >= activeConfig.minConfidence.value
      const isVisibleType = !visibleTypes || visibleTypes.size === 0 || visibleTypes.has(n.type)
      return meetsConfidence && isVisibleType
    })

    const nodeIds = new Set(filteredNodes.map(n => n.id))

    // Filter links based on visibility toggles and active nodes
    const filteredLinks = data.links.filter(l => {
      const sId = typeof l.source === 'string' ? l.source : (l.source as any).id
      const tId = typeof l.target === 'string' ? l.target : (l.target as any).id
      const isVisibleStatus = activeConfig.showSuggested.value || l.status === 'confirmed'
      return nodeIds.has(sId) && nodeIds.has(tId) && isVisibleStatus
    })

    const width = container.value.clientWidth || 800
    const height = container.value.clientHeight || 600

    console.log('Container element:', container.value)
    console.log('Container dimensions:', { width, height, clientWidth: container.value.clientWidth, clientHeight: container.value.clientHeight })

    if (width === 0 || height === 0) {
      console.warn('Container has no dimensions, using defaults')
    }

    console.log(`Initializing graph with dimensions: ${width}x${height}`)

    // Clear previous
    d3.select(container.value).selectAll('svg').remove()

    // Create SVG with proper sizing
    const svg = d3
      .select(container.value)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .attr('preserveAspectRatio', 'xMidYMid meet')
      .attr('class', 'graph-svg')
      .style('border', '1px solid #ccc')

    console.log('SVG created')

    // Add defs for markers and filters
    const defs = svg.append('defs')

    // Arrow markers
    defs
      .append('marker')
      .attr('id', 'arrow-confirmed')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 8)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#3b82f6')

    defs
      .append('marker')
      .attr('id', 'arrow-suggested')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('refX', 8)
      .attr('refY', 3)
      .attr('orient', 'auto')
      .append('polygon')
      .attr('points', '0 0, 10 3, 0 6')
      .attr('fill', '#fbbf24')

    // Glow filter
    const glowFilter = defs.append('filter').attr('id', 'node-glow')
    glowFilter.append('feGaussianBlur').attr('stdDeviation', 4).attr('result', 'coloredBlur')
    const glowMerge = glowFilter.append('feMerge')
    glowMerge.append('feMergeNode').attr('in', 'coloredBlur')
    glowMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Hover filter
    const hoverFilter = defs.append('filter').attr('id', 'node-hover')
    hoverFilter.append('feGaussianBlur').attr('stdDeviation', 2).attr('result', 'coloredBlur')
    const hoverMerge = hoverFilter.append('feMerge')
    hoverMerge.append('feMergeNode').attr('in', 'coloredBlur')
    hoverMerge.append('feMergeNode').attr('in', 'SourceGraphic')

    // Add zoom behavior
    const g = svg.append('g')
    const localZoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        // Capture zoom state for preservation
        viewState.value.zoom = { k: event.transform.k, x: event.transform.x, y: event.transform.y }
      })

    zoomBehavior.value = localZoomBehavior
    svg.call(localZoomBehavior)

    // Restore previous zoom state if available
    if (viewState.value.zoom.k !== 1 || viewState.value.zoom.x !== 0 || viewState.value.zoom.y !== 0) {
      const transform = d3.zoomIdentity.translate(viewState.value.zoom.x, viewState.value.zoom.y).scale(viewState.value.zoom.k)
      svg.call(zoomBehavior.transform, transform)
    }

    // Find central node (most connected node, prefer person or business type)
    const connectionCounts = new Map<string, number>()
    filteredLinks.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id
      connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1)
      connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1)
    })

    let centralNode = filteredNodes[0]
    let maxConnections = 0
    filteredNodes.forEach((node) => {
      const connections = connectionCounts.get(node.id) || 0
      if (connections > maxConnections || (connections === maxConnections && (node.type === 'business' || node.type === 'person'))) {
        maxConnections = connections
        centralNode = node
      }
    })

    // Calculate project centroids for clustering visualization
    const projectGroups = new Map<string, GraphNode[]>()
    filteredNodes.forEach((node) => {
      const projectId = node.project?.id || 'unknown'
      if (!projectGroups.has(projectId)) {
        projectGroups.set(projectId, [])
      }
      projectGroups.get(projectId)!.push(node)
    })

    const projectCentroids = new Map<string, { x: number; y: number; color: string }>()
    const projectColors = ['#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#a855f7']
    let colorIndex = 0

    projectGroups.forEach((_, project) => {
      const color = projectColors[colorIndex % projectColors.length]
      projectCentroids.set(project, { x: width / 2, y: height / 2, color })
      colorIndex++
    })

    // Create force simulation with radial layout
    const sim = d3
      .forceSimulation<GraphNode, GraphLink>(filteredNodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(filteredLinks)
          .id((d: GraphNode) => d.id)
          .distance((d: GraphLink) => (centralNode && (d.source as GraphNode).id === centralNode.id ? 220 : 160))
          .strength(0.5),
      )
      .force('charge', d3.forceManyBody().strength(activeConfig.repulsion.value))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(70))
      .force('radial', d3.forceRadial((d: GraphNode) => (d.id === centralNode.id ? 0 : 280), width / 2, height / 2).strength(0.4))
      .force('cluster', (alpha: number) => {
        filteredNodes.forEach((node) => {
          const projectId = node.project?.id || 'unknown'
          const centroid = projectCentroids.get(projectId)
          if (centroid && node.x !== undefined && node.y !== undefined) {
            const dx = centroid.x - node.x
            const dy = centroid.y - node.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance > 0) {
              const strength = 0.2 * alpha
              node.x += (dx / distance) * strength * 30
              node.y += (dy / distance) * strength * 30
            }
          }
        })
      })

    simulation.value = sim

    // Create links group
    const linksGroup = g.append('g').attr('class', 'links-layer')
    const link = linksGroup
      .selectAll('line')
      .data(filteredLinks)
      .enter()
      .append('line')
      .attr('class', (d) => `link link-${d.status}`)
      .attr('stroke', (d: GraphLink) => (d.status === 'confirmed' ? '#3b82f6' : '#fbbf24'))
      .attr('stroke-width', (d: GraphLink) => (d.status === 'confirmed' ? 2.5 : 2))
      .attr('stroke-dasharray', (d: GraphLink) => (d.status === 'suggested' ? '5,3' : 'none'))
      .attr('marker-end', (d: GraphLink) =>
        d.status === 'confirmed' ? 'url(#arrow-confirmed)' : 'url(#arrow-suggested)',
      )
      .style('cursor', 'pointer')
      .on('click', (event: any, d: GraphLink) => {
        event.stopPropagation()
        // Store link info for display
        const sourceId = typeof d.source === 'string' ? d.source : (d.source as any).id
        const targetId = typeof d.target === 'string' ? d.target : (d.target as any).id
        const sourceNode = nodeById.get(sourceId)
        const targetNode = nodeById.get(targetId)
        console.log('Link clicked:', {
          source: sourceNode?.name,
          target: targetNode?.name,
          type: d.type,
          status: d.status,
          evidence: d.evidence,
        })
      })
      .on('mouseenter', function (this: SVGLineElement, _event: any, d: GraphLink) {
        d3.select(this).attr('stroke-width', d.status === 'confirmed' ? 4 : 3).attr('class', (link: GraphLink) => `link link-${link.status} link-active`)

        // Highlight connected nodes
        const sourceId = typeof d.source === 'string' ? d.source : (d.source as any).id
        const targetId = typeof d.target === 'string' ? d.target : (d.target as any).id

        node
          .classed('node-connected', (n: GraphNode) => n.id === sourceId || n.id === targetId)
          .attr('stroke-width', (n: GraphNode) => {
            if (n.id === sourceId || n.id === targetId) return 5
            return n.id === selectedNode.value?.id ? 4 : 2
          })
          .attr('stroke', (n: GraphNode) => {
            if (n.id === sourceId || n.id === targetId) return '#fbbf24'
            return n.id === selectedNode.value?.id ? '#06b6d4' : '#3a4557'
          })
      })
      .on('mouseleave', function (this: SVGLineElement, _event: any, d: GraphLink) {
        d3.select(this).attr('stroke-width', d.status === 'confirmed' ? 2.5 : 2).attr('class', (link: GraphLink) => `link link-${link.status}`)

        // Remove highlight from nodes
        node
          .classed('node-connected', false)
          .attr('stroke-width', (n: GraphNode) => (n.id === selectedNode.value?.id ? 4 : 2))
          .attr('stroke', (n: GraphNode) => (n.id === selectedNode.value?.id ? '#06b6d4' : '#3a4557'))
      })

    console.log(`Created ${link.size()} links`)

    // Create cluster hull circles for visual grouping
    const clusterHulls = g
      .append('g')
      .attr('class', 'cluster-hulls')
      .selectAll('circle')
      .data(Array.from(projectCentroids.entries()))
      .enter()
      .append('circle')
      .attr('class', 'cluster-hull')
      .attr('fill', (d: [string, { x: number; y: number; color: string }]) => d[1].color)
      .attr('fill-opacity', 0.05)
      .attr('stroke', (d: [string, { x: number; y: number; color: string }]) => d[1].color)
      .attr('stroke-dasharray', '4,4')
      .attr('stroke-opacity', 0.3)
      .attr('r', 120)
      .attr('pointer-events', 'none')

    // Create edge labels
    const edgeLabels = g
      .append('g')
      .attr('class', 'edge-labels-layer')
      .selectAll('text')
      .data(filteredLinks)
      .enter()
      .append('text')
      .attr('class', 'edge-label')
      .attr('font-size', '11px')
      .attr('fill', '#94a3b8')
      .attr('text-anchor', 'middle')
      .attr('dy', '-5px')
      .attr('pointer-events', 'none')
      .text((d: GraphLink) => d.type)

    // Create nodes group
    const nodesGroup = g.append('g').attr('class', 'nodes-layer')
    const node = nodesGroup
      .selectAll('circle')
      .data(filteredNodes)
      .enter()
      .append('circle')
      .attr('r', (d: GraphNode) => {
        if (d.id === centralNode.id) return 45
        const baseSize = 25
        return baseSize + (d.value || 0) * 5
      })
      .attr('class', (d: GraphNode) => `node node-${d.type}${d.id === centralNode.id ? ' node-central' : ''}`)
      .attr('fill', (d: GraphNode) => getNodeColor(d.type))
      .attr('stroke', (d: GraphNode) => (d.id === centralNode.id ? '#06b6d4' : '#3a4557'))
      .attr('stroke-width', (d: GraphNode) => (d.id === centralNode.id ? 3 : 2))
      .attr('opacity', (d: GraphNode) => d.confidence || 1)
      .style('cursor', 'pointer')
      .style('filter', (d: GraphNode) => (d.id === centralNode.id ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' : 'none'))
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded),
      )
      .on('click', (event: any, d: GraphNode) => {
        event.stopPropagation()
        console.log('Node clicked:', d.id, d.name)
        selectedNode.value = d

        // Find connected nodes
        const connectedNodeIds = new Set<string>()
        filteredLinks.forEach((link) => {
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

          if (sourceId === d.id) {
            connectedNodeIds.add(targetId)
          }
          if (targetId === d.id) {
            connectedNodeIds.add(sourceId)
          }
        })

        // Update classes and opacity
         node
          .classed('is-selected', (n: GraphNode) => n.id === d.id)
          .classed('is-connected', (n: GraphNode) => connectedNodeIds.has(n.id) && n.id !== d.id)
          .attr('stroke-width', (n: GraphNode) => {
            if (n.id === d.id) return 8
            if (connectedNodeIds.has(n.id)) return 5
            return 2
          })
          .style('opacity', (n: GraphNode) => {
            const opacity = n.id === d.id ? 1 : connectedNodeIds.has(n.id) ? (n.confidence || 1) * 0.95 : (n.confidence || 1) * 0.5
            if (n.id === d.id || connectedNodeIds.has(n.id)) {
              console.log(`[click-handler] Setting opacity for ${n.id}: ${opacity}`)
            }
            return opacity
          })

        onNodeSelect(d)
      })
      .on('mouseenter', (event, d) => {
        highlightNeighbors(d.id, filteredLinks)
        updateLinkOpacity()
        updateLabelOpacity()
      })
      .on('mouseleave', () => {
        highlightedNodes.value.clear()
        updateLinkOpacity()
        updateLabelOpacity()
      })

    console.log(`Created ${node.size()} nodes`)

    // Create labels
    const labels = g
      .append('g')
      .attr('class', 'labels-layer')
      .selectAll('text')
      .data(filteredNodes)
      .enter()
      .append('text')
      .attr('class', (d: GraphNode) => `node-label${d.id === centralNode.id ? ' node-label-central' : ''}`)
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', (d: GraphNode) => (d.id === centralNode.id ? '13px' : '10px'))
      .attr('font-weight', (d: GraphNode) => (d.id === centralNode.id ? 'bold' : 'normal'))
      .attr('fill', 'var(--pt-text)')
      .attr('pointer-events', 'none')
      .text((d: GraphNode) => d.name)
      .style('opacity', (d: GraphNode) => (d.id === centralNode.id ? 1 : 0))

    // Deselect on background click
    svg.on('click', () => {
      selectedNode.value = null
      onNodeSelect(null)
      updateNodeStyle()
    })

    function updateNodeStyle() {
      const selectedNodeId = selectedNode.value?.id
      const connectedNodeIds = new Set<string>()

      if (selectedNodeId) {
        filteredLinks.forEach((link) => {
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

          if (sourceId === selectedNodeId) {
            connectedNodeIds.add(targetId)
          }
          if (targetId === selectedNodeId) {
            connectedNodeIds.add(sourceId)
          }
        })
      }

      node
        .classed('is-selected', (d: GraphNode) => d.id === selectedNodeId)
        .classed('is-connected', (d: GraphNode) => connectedNodeIds.has(d.id) && d.id !== selectedNodeId)
        .attr('stroke-width', (d: GraphNode) => {
          if (d.id === selectedNodeId) return 8
          if (connectedNodeIds.has(d.id)) return 5
          return 2
        })
        .attr('opacity', (d: GraphNode) => {
          if (d.id === selectedNodeId) return 1
          if (connectedNodeIds.has(d.id)) return (d.confidence || 1) * 0.95
          return (d.confidence || 1) * 0.5
        })
    }

    function updateLinkOpacity() {
      link.style('opacity', (d) => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id
        const targetId = typeof d.target === 'string' ? d.target : d.target.id
        return highlightedNodes.value.has(sourceId) || highlightedNodes.value.has(targetId)
          ? 1
          : 0.2
      })

      // Don't override node opacity during hover - let selection state control it
      // Only highlight hovered neighbors, preserve selected node visibility
      node.style('opacity', (d) => {
        if (d.id === selectedNode.value?.id) return 1
        if (highlightedNodes.value.has(d.id)) return 1
        return (d.confidence || 1) * 0.5
      })
    }

    function updateLabelOpacity() {
      labels.style('opacity', (d: GraphNode) => {
        if (d.id === centralNode.id) return 1
        return highlightedNodes.value.has(d.id) ? 1 : 0
      })
    }

    function highlightNeighbors(nodeId: string, links: GraphLink[]) {
      highlightedNodes.value.clear()
      highlightedNodes.value.add(nodeId)

      links.forEach((link) => {
        const sourceId = typeof link.source === 'string' ? link.source : link.source.id
        const targetId = typeof link.target === 'string' ? link.target : link.target.id

        if (sourceId === nodeId) highlightedNodes.value.add(targetId)
        if (targetId === nodeId) highlightedNodes.value.add(sourceId)
      })
    }

    function dragStarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
      if (!event.active) sim.alphaTarget(1).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragEnded(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
      if (!event.active) sim.alphaTarget(0)
      // Lock the node in place
      lockedNodes.value.add(event.subject.id)
    }

    // Create a map of nodes by ID for link resolution in tick
    const nodeById = new Map(filteredNodes.map((n) => [n.id, n]))

    // Update positions on simulation tick
    sim.on('tick', () => {
      // Update cluster centroids based on current node positions
      projectGroups.forEach((nodes, project) => {
        const centroid = projectCentroids.get(project)
        if (centroid) {
          let sumX = 0
          let sumY = 0
          nodes.forEach((node) => {
            if (node.x !== undefined && node.y !== undefined) {
              sumX += node.x
              sumY += node.y
            }
          })
          centroid.x = sumX / nodes.length
          centroid.y = sumY / nodes.length
        }
      })

      // Update cluster hulls
      clusterHulls
        .attr('cx', (d: [string, { x: number; y: number; color: string }]) => d[1].x)
        .attr('cy', (d: [string, { x: number; y: number; color: string }]) => d[1].y)

      link
        .attr('x1', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
          const source = nodeById.get(sourceId)
          return source?.x || 0
        })
        .attr('y1', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
          const source = nodeById.get(sourceId)
          return source?.y || 0
        })
        .attr('x2', (d: any) => {
          const targetId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
          const target = nodeById.get(targetId)
          return target?.x || 0
        })
        .attr('y2', (d: any) => {
          const targetId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
          const target = nodeById.get(targetId)
          return target?.y || 0
        })

      // Position edge labels at midpoint of links
      edgeLabels
        .attr('x', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
          const targetId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
          const source = nodeById.get(sourceId)
          const target = nodeById.get(targetId)
          const sourceX = source?.x || 0
          const targetX = target?.x || 0
          return (sourceX + targetX) / 2
        })
        .attr('y', (d: any) => {
          const sourceId = typeof d.source === 'string' ? d.source : (d.source as GraphNode).id
          const targetId = typeof d.target === 'string' ? d.target : (d.target as GraphNode).id
          const source = nodeById.get(sourceId)
          const target = nodeById.get(targetId)
          const sourceY = source?.y || 0
          const targetY = target?.y || 0
          return (sourceY + targetY) / 2
        })

      node.attr('cx', (d) => d.x || 0).attr('cy', (d) => d.y || 0)

      labels.attr('x', (d) => d.x || 0).attr('y', (d) => d.y || 0)
    })
  }

  function getNodeColor(type: string): string {
    const colors: Record<string, string> = {
      business: '#3b82f6',
      person: '#a855f7',
      website: '#06b6d4',
      location: '#10b981',
      contact: '#f59e0b',
    }
    return colors[type] || '#6b7280'
  }

  onUnmounted(() => {
    if (simulation.value) simulation.value.stop()
  })

  function centerNode(nodeId: string, _data?: GraphData) {
    if (!container.value) return

    const svg = d3.select(container.value).select('svg')
    if (svg.empty()) return

    // Find the rendered node element directly in the SVG
    let foundX = 0
    let foundY = 0
    let found = false

    svg.selectAll<SVGCircleElement, GraphNode>('.node').each((d: GraphNode, _i: number, nodes: SVGCircleElement[]) => {
      if (d.id === nodeId) {
        foundX = parseFloat(nodes[_i].getAttribute('cx') || '0')
        foundY = parseFloat(nodes[_i].getAttribute('cy') || '0')
        found = true
      }
    })

    if (!found || (foundX === 0 && foundY === 0)) return

    const width = container.value.clientWidth || 800
    const height = container.value.clientHeight || 600

    // Get current transform
    const currentTransform = d3.zoomTransform(svg.node() as SVGSVGElement)

    // Calculate translation to center node on screen
    const dx = width / 2 - foundX
    const dy = height / 2 - foundY

    // Create new transform
    const newTransform = currentTransform.translate(dx / currentTransform.k, dy / currentTransform.k)

    // Animate to center the node
    svg
      .transition()
      .duration(500)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        newTransform
      )
  }

  function updateForces() {
    if (!simulation.value) return

    const chargeForce = simulation.value.force('charge') as d3.ForceManyBody<GraphNode>
    if (chargeForce) {
      chargeForce.strength(activeConfig.repulsion.value)
    }

    // Re-heat the simulation for smooth transition
    simulation.value.alpha(0.3).restart()
  }

  function applyViewModeForces(modeId: ViewModeId, width: number, height: number) {
    if (!simulation.value) return

    const config = VIEW_MODES[modeId]
    if (!config) return

    simulation.value.force('center', d3.forceCenter(width / 2, height / 2))
    simulation.value.alpha(1).restart()
  }

  function setGridConfig(override: GridConfigOverride) {
    gridConfigOverride.value = override
  }

  function applyProjectRowLayout() {
    if (!simulation.value) return

    const nodes = simulation.value.nodes() as GraphNode[]
    const uniqueProjects = Array.from(new Set(nodes.map((n) => n.project?.id).filter((id): id is string => Boolean(id))))
    const projectPositions = new Map<string, { x: number; y: number }>()

    // Use overrides if provided, otherwise use defaults
    const nodesPerRow = gridConfigOverride.value.nodesPerRow ?? GRID_CONFIG.nodesPerRow
    const horizontalGap = gridConfigOverride.value.horizontalGap ?? GRID_CONFIG.horizontalGap
    const verticalGap = gridConfigOverride.value.verticalGap ?? GRID_CONFIG.verticalGap
    const forceStrength = gridConfigOverride.value.forceStrength ?? GRID_CONFIG.forceStrength

    uniqueProjects.forEach((projectId, index) => {
      const row = Math.floor(index / nodesPerRow)
      const col = index % nodesPerRow
      projectPositions.set(projectId, {
        x: col * horizontalGap,
        y: row * verticalGap,
      })
    })

    // Clear all conflicting forces
    simulation.value
      .force('center', null)
      .force('radial', null)
      .force('link', null)
      .force('charge', null)
      .force('collision', null)

    // Apply grid forces
    simulation.value
      .force(
        'forceX',
        d3
          .forceX((d: GraphNode) => {
            const projectId = d.project?.id || 'unknown'
            return projectPositions.get(projectId)?.x || 0
          })
          .strength(forceStrength),
      )
      .force(
        'forceY',
        d3
          .forceY((d: GraphNode) => {
            const projectId = d.project?.id || 'unknown'
            return projectPositions.get(projectId)?.y || 0
          })
          .strength(forceStrength),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collision', d3.forceCollide().radius(50).strength(0.8))

    simulation.value.alpha(1).restart()
  }

  function applyTypeRowLayout() {
    if (!simulation.value) return

    const nodes = simulation.value.nodes() as GraphNode[]
    const uniqueTypes = Array.from(new Set(nodes.map((n) => n.type).filter(Boolean)))
    const typePositions = new Map<string, { x: number; y: number }>()

    const nodesPerRow = gridConfigOverride.value.nodesPerRow ?? GRID_CONFIG.nodesPerRow
    const horizontalGap = gridConfigOverride.value.horizontalGap ?? GRID_CONFIG.horizontalGap
    const verticalGap = gridConfigOverride.value.verticalGap ?? GRID_CONFIG.verticalGap
    const forceStrength = gridConfigOverride.value.forceStrength ?? GRID_CONFIG.forceStrength

    uniqueTypes.forEach((type, index) => {
      const row = Math.floor(index / nodesPerRow)
      const col = index % nodesPerRow
      typePositions.set(type, {
        x: col * horizontalGap,
        y: row * verticalGap,
      })
    })

    simulation.value
      .force('center', null)
      .force('radial', null)
      .force('link', null)
      .force('charge', null)
      .force('collision', null)

    simulation.value
      .force(
        'forceX',
        d3
          .forceX((d: GraphNode) => typePositions.get(d.type)?.x || 0)
          .strength(forceStrength),
      )
      .force(
        'forceY',
        d3
          .forceY((d: GraphNode) => typePositions.get(d.type)?.y || 0)
          .strength(forceStrength),
      )
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collision', d3.forceCollide().radius(50).strength(0.8))

    simulation.value.alpha(1).restart()
  }

  function applyClusterLayout() {
    if (!simulation.value) return

    const nodes = simulation.value.nodes() as GraphNode[]
    const width = container.value?.clientWidth || 800
    const height = container.value?.clientHeight || 600

    // Simple clustering: group by connection count (degree)
    const clusterCenters = new Map<number, { x: number; y: number }>()
    const degreeGroups = new Map<string, number>()

    // Count degrees
    const connectionCounts = new Map<string, number>()
    nodes.forEach((n) => connectionCounts.set(n.id, 0))

    // Assign degree-based clusters (high, medium, low)
    const degrees = Array.from(connectionCounts.values()).sort((a, b) => b - a)
    const highDegreeThreshold = degrees.length > 0 ? degrees[Math.floor(degrees.length * 0.33)] : 0
    const mediumDegreeThreshold = degrees.length > 0 ? degrees[Math.floor(degrees.length * 0.66)] : 0

    nodes.forEach((node) => {
      const degree = node.value || 0
      let cluster = 1
      if (degree >= highDegreeThreshold) cluster = 0
      if (degree < mediumDegreeThreshold) cluster = 2
      degreeGroups.set(node.id, cluster)
    })

    // Position clusters in triangular formation
    const positions = [
      { x: width / 2, y: height / 4 },
      { x: width / 4, y: (height * 3) / 4 },
      { x: (width * 3) / 4, y: (height * 3) / 4 },
    ]

    clusterCenters.set(0, positions[0])
    clusterCenters.set(1, positions[1])
    clusterCenters.set(2, positions[2])

    simulation.value
      .force('center', null)
      .force('radial', null)
      .force('link', null)
      .force('charge', null)
      .force('collision', null)

    simulation.value
      .force(
        'forceX',
        d3
          .forceX((d: GraphNode) => {
            const cluster = degreeGroups.get(d.id) || 1
            return clusterCenters.get(cluster)?.x || width / 2
          })
          .strength(0.2),
      )
      .force(
        'forceY',
        d3
          .forceY((d: GraphNode) => {
            const cluster = degreeGroups.get(d.id) || 1
            return clusterCenters.get(cluster)?.y || height / 2
          })
          .strength(0.2),
      )
      .force('charge', d3.forceManyBody().strength(-150))
      .force('collision', d3.forceCollide().radius(50).strength(0.7))

    simulation.value.alpha(1).restart()
  }

  function setViewMode(modeId: ViewModeId) {
    const config = VIEW_MODES[modeId]
    if (!config) {
      console.warn(`Unknown view mode: ${modeId}`)
      return
    }

    viewState.value.viewMode = modeId

    const svg = d3.select(container.value).select('svg')
    const nodes = svg.selectAll('.node')
    const clusterHulls = svg.selectAll('.cluster-hull')

    // Handle cluster visibility
    clusterHulls.style('display', config.showClusters ? 'block' : 'none')

    // Handle node coloring based on config
    if (config.colorBy === 'type') {
      nodes.attr('fill', (d: GraphNode) => getNodeColor(d.type))
    } else if (config.colorBy === 'project') {
      const projectList = Array.from(new Set(nodes.data().map((n: GraphNode) => n.project || 'unknown')))
      const projectColors = ['#3b82f6', '#06b6d4', '#f59e0b', '#10b981', '#a855f7']

      nodes.attr('fill', (d: GraphNode) => {
        const project = d.project || 'unknown'
        const colorIndex = projectList.indexOf(project)
        return projectColors[colorIndex % projectColors.length]
      })
    } else if (config.colorBy === 'cluster') {
      // Placeholder for cluster coloring - will be implemented per algorithm
      nodes.attr('fill', (d: GraphNode) => getNodeColor(d.type))
    } else if (config.colorBy === 'custom') {
      // For custom implementations, use type coloring as default
      nodes.attr('fill', (d: GraphNode) => getNodeColor(d.type))
    }

    // Apply view-mode-specific force configurations
    if (container.value && simulation.value) {
      const width = container.value.clientWidth || 800
      const height = container.value.clientHeight || 600
      if (modeId === 'Project') {
        applyProjectRowLayout()
      } else if (modeId === 'Type') {
        applyTypeRowLayout()
      } else if (modeId === 'Cluster') {
        applyClusterLayout()
      } else {
        applyViewModeForces(modeId, width, height)
      }
    }
  }

  function resetLockedNodes() {
    if (!simulation.value) return

    const nodes = simulation.value.nodes() as GraphNode[]
    nodes.forEach((node) => {
      if (lockedNodes.value.has(node.id)) {
        node.fx = null
        node.fy = null
      }
    })
    lockedNodes.value.clear()
    simulation.value.alpha(0.3).restart()
  }

  function selectNodeById(nodeId: string, data: GraphData) {
    const nodeToSelect = data.nodes.find((n) => n.id === nodeId)
    if (nodeToSelect) {
      selectedNode.value = nodeToSelect
      const svg = d3.select(container.value).select('svg')
      const node = svg.selectAll('.node')
      const filteredLinks = data.links.filter((l) => {
        const sId = typeof l.source === 'string' ? l.source : (l.source as any).id
        const tId = typeof l.target === 'string' ? l.target : (l.target as any).id
        return data.nodes.some((n) => n.id === sId) && data.nodes.some((n) => n.id === tId)
      })

      const selectedNodeId = selectedNode.value?.id
      const connectedNodeIds = new Set<string>()

      if (selectedNodeId) {
        filteredLinks.forEach((link) => {
          const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
          const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

          if (sourceId === selectedNodeId) {
            connectedNodeIds.add(targetId)
          }
          if (targetId === selectedNodeId) {
            connectedNodeIds.add(sourceId)
          }
        })
      }

      node
        .classed('is-selected', (d: GraphNode) => d.id === selectedNodeId)
        .classed('is-connected', (d: GraphNode) => connectedNodeIds.has(d.id) && d.id !== selectedNodeId)
        .attr('stroke-width', (d: GraphNode) => {
          if (d.id === selectedNodeId) return 8
          if (connectedNodeIds.has(d.id)) return 5
          return 2
        })
        .attr('opacity', (d: GraphNode) => {
          if (d.id === selectedNodeId) return 1
          if (connectedNodeIds.has(d.id)) return (d.confidence || 1) * 0.95
          return (d.confidence || 1) * 0.5
        })
    }
  }

  function fitToView() {
    if (!container.value || !zoomBehavior.value) {
      return
    }

    // Find the SVG with actual nodes (in case there are multiple)
    let targetSvg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null
    let maxNodes = 0

    d3.select(container.value)
      .selectAll<SVGSVGElement, unknown>('svg')
      .each(function (this: SVGSVGElement) {
        const svgSelection = d3.select(this)
        const nodeCount = svgSelection.selectAll('.node').size()
        if (nodeCount > maxNodes) {
          maxNodes = nodeCount
          targetSvg = svgSelection
        }
      })

    if (!targetSvg || targetSvg.empty()) {
      return
    }

    const svg = targetSvg
    const nodes = svg.selectAll<SVGCircleElement, GraphNode>('.node')

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    let hasNodes = false

    nodes.each((d: GraphNode) => {
      if (d.x !== undefined && d.y !== undefined) {
        minX = Math.min(minX, d.x)
        minY = Math.min(minY, d.y)
        maxX = Math.max(maxX, d.x)
        maxY = Math.max(maxY, d.y)
        hasNodes = true
      }
    })

    if (!hasNodes) { return }

    const width = container.value.clientWidth || 800
    const height = container.value.clientHeight || 600
    const padding = 60

    const fullWidth = maxX - minX
    const fullHeight = maxY - minY

    const scale = Math.min(
      (width - padding * 2) / fullWidth,
      (height - padding * 2) / fullHeight,
      2
    )

    const tx = (width / 2) - (minX + fullWidth / 2) * scale
    const ty = (height / 2) - (minY + fullHeight / 2) * scale

    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale)
    zoomBehavior.value.transform(svg, transform)
  }

  return {
    selectedNode,
    highlightedNodes,
    lockedNodes,
    viewState,
    initializeGraph,
    centerNode,
    setViewMode,
    updateForces,
    applyViewModeForces,
    applyProjectRowLayout,
    setGridConfig,
    resetLockedNodes,
    selectNodeById,
    fitToView,
  }
}
