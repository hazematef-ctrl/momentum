import type { Task, TaskSchedule } from '../types'

export function validateTaskSchedule(
  schedule: TaskSchedule,
  tasks: Task[],
  currentTaskId?: string,
): string | null {
  const { scheduledDate, startTime, endTime } = schedule
  const hasAnyValue = scheduledDate !== '' || startTime !== '' || endTime !== ''

  if (!hasAnyValue) return null
  if (!scheduledDate || !startTime || !endTime) {
    return 'Choose a date, start time, and end time, or leave the schedule empty.'
  }
  if (startTime >= endTime) {
    return 'The end time must be later than the start time.'
  }

  const overlaps = tasks.some(
    (task) =>
      task.id !== currentTaskId &&
      !task.isCompleted &&
      task.scheduledDate === scheduledDate &&
      task.startTime !== null &&
      task.endTime !== null &&
      startTime < task.endTime &&
      endTime > task.startTime,
  )

  return overlaps ? 'This time overlaps another scheduled task.' : null
}
