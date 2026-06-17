import { ref, onMounted, onUnmounted, Ref } from 'vue'
import * as d3 from 'd3'

export interface GraphNode {
  id: string
  name: string
  type: 'business' | 'person' | 'location' | 'website' | 'contact'
  value?: number
  confidence?: number
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

export function useGraphSimulation(container: Ref<HTMLElement | null>) {
  const selectedNode = ref<GraphNode | null>(null)
  const highlightedNodes = ref<Set<string>>(new Set())
  const simulation = ref<d3.Simulation<GraphNode, GraphLink> | null>(null)

  function initializeGraph(data: GraphData, onNodeSelect: (node: GraphNode | null) => void) {
    if (!container.value) return

    const width = container.value.clientWidth
    const height = container.value.clientHeight

    // Clear previous
    d3.select(container.value).selectAll('svg').remove()

    // Create SVG
    const svg = d3
      .select(container.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('class', 'graph-svg')

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
    const zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoomBehavior)

    // Create force simulation
    const sim = d3
      .forceSimulation<GraphNode, GraphLink>(data.nodes)
      .force(
        'link',
        d3
          .forceLink<GraphNode, GraphLink>(data.links)
          .id((d) => d.id)
          .distance(100)
          .strength(0.5),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))

    simulation.value = sim

    // Create links group
    const linksGroup = g.append('g').attr('class', 'links-layer')
    const link = linksGroup
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('class', (d) => `link link-${d.status}`)
      .attr('stroke-width', (d) => (d.status === 'confirmed' ? 2.5 : 2))
      .attr('marker-end', (d) =>
        d.status === 'confirmed' ? 'url(#arrow-confirmed)' : 'url(#arrow-suggested)',
      )

    // Create nodes group
    const nodesGroup = g.append('g').attr('class', 'nodes-layer')
    const node = nodesGroup
      .selectAll('circle')
      .data(data.nodes)
      .enter()
      .append('circle')
      .attr('r', (d) => {
        const baseSize = 25
        return baseSize + (d.value || 0) * 5
      })
      .attr('class', (d) => `node node-${d.type}`)
      .attr('fill', (d) => getNodeColor(d.type))
      .attr('stroke', 'var(--pt-border)')
      .attr('stroke-width', 2)
      .attr('opacity', (d) => d.confidence || 1)
      .style('cursor', 'pointer')
      .call(
        d3
          .drag<SVGCircleElement, GraphNode>()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded),
      )
      .on('click', (event, d) => {
        event.stopPropagation()
        selectedNode.value = d
        onNodeSelect(d)
        updateNodeStyle()
      })
      .on('mouseenter', (event, d) => {
        highlightNeighbors(d.id, data.links)
        updateLinkOpacity()
      })
      .on('mouseleave', () => {
        highlightedNodes.value.clear()
        updateLinkOpacity()
      })

    // Create labels
    const labels = g
      .append('g')
      .attr('class', 'labels-layer')
      .selectAll('text')
      .data(data.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('font-size', '10px')
      .attr('fill', 'var(--pt-text)')
      .attr('pointer-events', 'none')
      .text((d) => d.name)
      .style('opacity', 0)

    // Deselect on background click
    svg.on('click', () => {
      selectedNode.value = null
      onNodeSelect(null)
      updateNodeStyle()
    })

    function updateNodeStyle() {
      node.attr('stroke-width', (d) => (d.id === selectedNode.value?.id ? 4 : 2)).attr(
        'filter',
        (d) => (d.id === selectedNode.value?.id ? 'url(#node-glow)' : 'none'),
      )
    }

    function updateLinkOpacity() {
      link.style('opacity', (d) => {
        const sourceId = typeof d.source === 'string' ? d.source : d.source.id
        const targetId = typeof d.target === 'string' ? d.target : d.target.id
        return highlightedNodes.value.has(sourceId) || highlightedNodes.value.has(targetId)
          ? 1
          : 0.2
      })

      node.style('opacity', (d) => (highlightedNodes.value.has(d.id) ? 1 : 0.3))
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
      if (!event.active) sim.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragEnded(event: d3.D3DragEvent<SVGCircleElement, GraphNode, GraphNode>) {
      if (!event.active) sim.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Update positions on simulation tick
    sim.on('tick', () => {
      link
        .attr('x1', (d) => (typeof d.source === 'string' ? 0 : d.source.x || 0))
        .attr('y1', (d) => (typeof d.source === 'string' ? 0 : d.source.y || 0))
        .attr('x2', (d) => (typeof d.target === 'string' ? 0 : d.target.x || 0))
        .attr('y2', (d) => (typeof d.target === 'string' ? 0 : d.target.y || 0))

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

  return {
    selectedNode,
    highlightedNodes,
    initializeGraph,
  }
}
