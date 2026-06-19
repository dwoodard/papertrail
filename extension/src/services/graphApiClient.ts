/**
 * Graph API Client
 * Fetches graph data from the Laravel backend instead of using hardcoded graphs.json
 */

interface GraphProject {
  id: string
  name: string
  slug: string
  goal: string
  status: string
  nodeCount: number
  edgeCount: number
  placeCount: number
}

interface GraphNode {
  id: string
  label: string
  type: string
  source?: string
  properties?: Record<string, any>
  value?: number
  confidence?: number
}

interface GraphLink {
  id: string
  source: string
  target: string
  type: string
  confidence: number
}

interface GraphProjectData {
  project: {
    id: string
    name: string
    slug: string
  }
  nodes: GraphNode[]
  links: GraphLink[]
}

interface NodeRelation {
  nodeId: string
  nodeName: string
  nodeType: string
  relationType: string
  direction: 'incoming' | 'outgoing'
  confidence: number
  connectionCount: number
}

const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const graphApiClient = {
  /**
   * Create a new project
   */
  async createProject(id: string, name: string, goal?: string): Promise<GraphProject> {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, goal }),
    })
    if (!response.ok) throw new Error('Failed to create project')
    return response.json()
  },

  /**
   * Get all projects with graph statistics
   */
  async getProjects(): Promise<GraphProject[]> {
    const response = await fetch(`${API_BASE}/graph/projects`)
    if (!response.ok) throw new Error('Failed to fetch projects')
    const data = await response.json()
    return data.projects
  },

  /**
   * Get graph data for a specific project
   */
  async getProjectGraph(
    projectId: string,
    options?: {
      search?: string
      types?: string[]
      minConnections?: number
    }
  ): Promise<GraphProjectData> {
    const params = new URLSearchParams()
    if (options?.search) params.append('search', options.search)
    if (options?.types?.length) {
      options.types.forEach(type => params.append('types[]', type))
    }
    if (options?.minConnections) {
      params.append('minConnections', String(options.minConnections))
    }

    const query = params.toString() ? `?${params}` : ''
    const response = await fetch(`${API_BASE}/graph/project/${projectId}${query}`)
    if (!response.ok) throw new Error('Failed to fetch project graph')
    return response.json()
  },

  /**
   * Get all relations for a specific node
   */
  async getNodeRelations(nodeId: string): Promise<NodeRelation[]> {
    const response = await fetch(`${API_BASE}/graph/node/${nodeId}/relations`)
    if (!response.ok) throw new Error('Failed to fetch node relations')
    const data = await response.json()
    return data.relations
  },

  /**
   * Get nodes shared across multiple projects
   */
  async getSharedNodes() {
    const response = await fetch(`${API_BASE}/graph/shared-nodes`)
    if (!response.ok) throw new Error('Failed to fetch shared nodes')
    const data = await response.json()
    return data.sharedNodes
  },
}
