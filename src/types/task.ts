export interface Task {
  id: string
  title: string
  description: string
  favourite: boolean
  priority: TaskPriority
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
  isCompleted: boolean
  createdAt: number
  completedAt: number | null
}

export type TaskPriority = 'low' | 'medium' | 'high'

export interface TaskSchedule {
  scheduledDate: string
  startTime: string
  endTime: string
}
