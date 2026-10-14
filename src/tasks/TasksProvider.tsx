import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'
import type { Task, TaskPriority, TaskSchedule } from '../types'
import { TasksContext, type TaskState } from './tasksContext'
import { taskApi } from './api'
import { validateTaskSchedule } from './scheduling'

const EMPTY_TASK_STATE: TaskState = { tasks: [], focusedTaskId: null }
const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
}

function nextOpenTaskId(tasks: Task[], currentId: string | null): string | null {
  const openTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort((first, second) => PRIORITY_RANK[second.priority] - PRIORITY_RANK[first.priority])
  if (openTasks.length === 0) return null
  const currentIndex = openTasks.findIndex((task) => task.id === currentId)
  return openTasks[(currentIndex + 1 + openTasks.length) % openTasks.length].id
}

function highestPriorityTaskId(tasks: Task[], preferredId: string | null): string | null {
  const openTasks = tasks.filter((task) => !task.isCompleted)
  if (openTasks.length === 0) return null

  const highestPriority = Math.max(...openTasks.map((task) => PRIORITY_RANK[task.priority]))
  const highestPriorityTasks = openTasks.filter(
    (task) => PRIORITY_RANK[task.priority] === highestPriority,
  )

  return (
    highestPriorityTasks.find((task) => task.id === preferredId)?.id ??
    highestPriorityTasks[0].id
  )
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, sessionId } = useAuth()
  const [state, setState] = useState(EMPTY_TASK_STATE)
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if ((authStatus !== 'guest' && authStatus !== 'authenticated') || !sessionId) return

    let isMounted = true
    taskApi.getAll()
      .then((tasks) => {
        if (isMounted) {
          setState({
            tasks,
            focusedTaskId: highestPriorityTaskId(tasks, null),
          })
          setError(null)
        }
      })
      .catch((loadError: unknown) => {
        if (isMounted) {
          setState(EMPTY_TASK_STATE)
          setError(getErrorMessage(loadError))
        }
      })
      .finally(() => {
        if (isMounted) setLoadedSessionId(sessionId)
      })

    return () => {
      isMounted = false
    }
  }, [authStatus, sessionId])

  const isLoading =
    authStatus === 'loading' ||
    ((authStatus === 'guest' || authStatus === 'authenticated') &&
      loadedSessionId !== sessionId)
  const visibleState = loadedSessionId === sessionId ? state : EMPTY_TASK_STATE

  async function addTask(
    title: string,
    description = '',
    schedule?: TaskSchedule,
    priority: TaskPriority = 'medium',
  ): Promise<string | null> {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return 'Enter a task title.'

    const taskSchedule = schedule ?? {
      scheduledDate: '',
      startTime: '',
      endTime: '',
    }
    const scheduleError = validateTaskSchedule(taskSchedule, state.tasks)
    if (scheduleError) return scheduleError

    try {
      const task = await taskApi.create(trimmedTitle, description.trim(), taskSchedule, priority)
      setState((current) => {
        const tasks = [...current.tasks, task]
        return {
          tasks,
          focusedTaskId: highestPriorityTaskId(tasks, current.focusedTaskId),
        }
      })
      return null
    } catch (requestError) {
      return getErrorMessage(requestError)
    }
  }

  async function updateTask(
    id: string,
    title: string,
    description: string,
    schedule: TaskSchedule,
    priority: TaskPriority,
  ): Promise<string | null> {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return 'Enter a task title.'
    if (!state.tasks.some((task) => task.id === id)) return 'This task could not be found.'
    const scheduleError = validateTaskSchedule(schedule, state.tasks, id)
    if (scheduleError) return scheduleError

    try {
      const updatedTask = await taskApi.update(id, trimmedTitle, description.trim(), schedule, priority)
      setState((current) => {
        const tasks = current.tasks.map((task) => task.id === id ? updatedTask : task)
        return {
          tasks,
          focusedTaskId: highestPriorityTaskId(tasks, current.focusedTaskId),
        }
      })
      return null
    } catch (requestError) {
      return getErrorMessage(requestError)
    }
  }

  async function toggleTask(id: string): Promise<void> {
    try {
      const currentTask = state.tasks.find((task) => task.id === id)
      if (!currentTask) return
      const updatedTask = await taskApi.setCompletion(id, !currentTask.isCompleted)
      setState((current) => {
        const tasks = current.tasks.map((task) => task.id === id ? updatedTask : task)
        return {
          tasks,
          focusedTaskId: highestPriorityTaskId(tasks, current.focusedTaskId),
        }
      })
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function toggleFavourite(id: string): Promise<void> {
    try {
      const currentTask = state.tasks.find((task) => task.id === id)
      if (!currentTask) return
      const updatedTask = await taskApi.setFavourite(id, !currentTask.favourite)
      setState((current) => ({
        ...current,
        tasks: current.tasks.map((task) => task.id === id ? updatedTask : task),
      }))
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  async function deleteTask(id: string): Promise<void> {
    try {
      await taskApi.delete(id)
      setState((current) => {
        const tasks = current.tasks.filter((task) => task.id !== id)
        return {
          tasks,
          focusedTaskId: highestPriorityTaskId(tasks, current.focusedTaskId),
        }
      })
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  function cycleFocus() {
    setState((current) => ({
      ...current,
      focusedTaskId: nextOpenTaskId(current.tasks, current.focusedTaskId),
    }))
  }

  async function completeFocusedTask(): Promise<void> {
    const task = state.tasks.find((item) => item.id === state.focusedTaskId)
    if (!task) return

    try {
      const completedTask = await taskApi.setCompletion(task.id, true)
      setState((current) => {
        const tasks = current.tasks.map((item) => item.id === task.id ? completedTask : item)
        return { tasks, focusedTaskId: nextOpenTaskId(tasks, task.id) }
      })
      setError(null)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    }
  }

  return (
    <TasksContext.Provider
      value={{
        ...visibleState,
        isLoading,
        error,
        clearError: () => setError(null),
        addTask,
        updateTask,
        toggleTask,
        toggleFavourite,
        deleteTask,
        cycleFocus,
        completeFocusedTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  )
}
