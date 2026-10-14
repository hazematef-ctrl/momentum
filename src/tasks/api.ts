import type { Task, TaskPriority, TaskSchedule } from '../types'

interface TaskInput {
  title: string
  description: string
  priority: TaskPriority
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    const message =
      typeof body === 'object' &&
      body !== null &&
      'error' in body &&
      typeof body.error === 'string'
        ? body.error
        : `Request failed with status ${response.status}.`
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function toTaskInput(
  title: string,
  description: string,
  schedule: TaskSchedule,
  priority: TaskPriority,
): TaskInput {
  return {
    title,
    description,
    priority,
    scheduledDate: schedule.scheduledDate || null,
    startTime: schedule.startTime || null,
    endTime: schedule.endTime || null,
  }
}

export const taskApi = {
  getAll: () => request<Task[]>('/tasks'),
  create: (
    title: string,
    description: string,
    schedule: TaskSchedule,
    priority: TaskPriority,
  ) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(toTaskInput(title, description, schedule, priority)),
    }),
  update: (
    id: string,
    title: string,
    description: string,
    schedule: TaskSchedule,
    priority: TaskPriority,
  ) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(toTaskInput(title, description, schedule, priority)),
    }),
  setCompletion: (id: string, isCompleted: boolean) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}/completion`, {
      method: 'PATCH',
      body: JSON.stringify({ isCompleted }),
    }),
  setFavourite: (id: string, favourite: boolean) =>
    request<Task>(`/tasks/${encodeURIComponent(id)}/favourite`, {
      method: 'PATCH',
      body: JSON.stringify({ favourite }),
    }),
  delete: (id: string) =>
    request<void>(`/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
