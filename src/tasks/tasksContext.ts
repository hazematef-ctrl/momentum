import { createContext } from 'react'
import type { Task, TaskPriority, TaskSchedule } from '../types'

export interface TaskState {
  tasks: Task[]
  focusedTaskId: string | null
}

export interface TasksContextValue extends TaskState {
  isLoading: boolean
  error: string | null
  clearError: () => void
  addTask: (title: string, description?: string, schedule?: TaskSchedule, priority?: TaskPriority) => Promise<string | null>
  updateTask: (id: string, title: string, description: string, schedule: TaskSchedule, priority: TaskPriority) => Promise<string | null>
  toggleTask: (id: string) => Promise<void>
  toggleFavourite: (id: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  cycleFocus: () => void
  completeFocusedTask: () => Promise<void>
}

export const TasksContext = createContext<TasksContextValue | null>(null)
