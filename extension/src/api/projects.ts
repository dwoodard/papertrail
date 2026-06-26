import { API_BASE } from './config'

export interface Project {
  id: string
  name: string
  goal: string | null
  status: string
  created_at: string
  updated_at: string
}

export async function fetchProjects(): Promise<Project[]> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`)
  }

  return response.json()
}

export async function createProject(
  id: string,
  name: string,
  goal?: string,
): Promise<Project> {
  const response = await fetch(`${API_BASE}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      name,
      goal: goal || null,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`)
  }

  return response.json()
}
