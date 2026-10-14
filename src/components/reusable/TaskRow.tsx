import { useState, type FormEvent } from 'react'
import TaskPriorityField from './TaskPriorityField'
import TaskScheduleFields from './TaskScheduleFields'
import { Button } from '../ui'
import type { Task, TaskPriority, TaskSchedule } from '../../types'
import { formatTaskCreatedAt } from '../../utils/formatTaskCreatedAt'
import { formatTaskScheduleDate } from '../../utils/formatTaskScheduleDate'
import { formatTaskTime } from '../../utils/formatTaskTime'

function getTaskSchedule(task: Task): TaskSchedule {
  return {
    scheduledDate: task.scheduledDate ?? '',
    startTime: task.startTime ?? '',
    endTime: task.endTime ?? '',
  }
}

interface TaskRowProps {
  task: Task
  isFocused: boolean
  onUpdate: (
    id: string,
    title: string,
    description: string,
    schedule: TaskSchedule,
    priority: TaskPriority,
  ) => Promise<string | null>
  onToggle: (id: string) => Promise<void>
  onToggleFavourite: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function TaskRow({
  task,
  isFocused,
  onUpdate,
  onToggle,
  onToggleFavourite,
  onDelete,
}: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(task.title)
  const [descriptionDraft, setDescriptionDraft] = useState(task.description)
  const [scheduleDraft, setScheduleDraft] = useState(() => getTaskSchedule(task))
  const [priorityDraft, setPriorityDraft] = useState(task.priority)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return
    setIsSaving(true)
    try {
      const error = await onUpdate(
        task.id,
        title,
        descriptionDraft,
        scheduleDraft,
        priorityDraft,
      )
      if (error) {
        setEditError(error)
        return
      }
      setEditError(null)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  function handleCancel() {
    setDraft(task.title)
    setDescriptionDraft(task.description)
    setScheduleDraft(getTaskSchedule(task))
    setPriorityDraft(task.priority)
    setEditError(null)
    setIsEditing(false)
  }

  return (
    <li
      className={`flex flex-col gap-4 rounded-3xl border p-4 shadow-[0_16px_50px_-42px_rgba(66,77,57,0.32)] sm:flex-row sm:items-center sm:p-5 ${
        task.isCompleted
          ? 'border-sage/15 bg-sage-pale/35'
          : 'border-white/80 bg-white/75'
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-label={task.isCompleted ? `Reopen ${task.title}` : `Complete ${task.title}`}
        className={`flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage ${
          task.isCompleted
            ? 'border-sage bg-sage text-white'
            : 'border-sand-deep bg-cream hover:border-sage'
        }`}
      >
        {task.isCompleted && (
          <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
            <path d="m4.5 10.2 3.7 3.7 7.4-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {isEditing ? (
        <form onSubmit={handleSave} className="flex min-w-0 flex-1 flex-col gap-3">
          <label htmlFor={`edit-task-${task.id}`} className="sr-only">Edit task title</label>
          <input
            id={`edit-task-${task.id}`}
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="min-h-11 min-w-0 rounded-full border border-sand-deep bg-white px-4 text-sm text-ink outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
          />
          <label htmlFor={`edit-task-description-${task.id}`} className="sr-only">
            Edit task description (optional)
          </label>
          <textarea
            id={`edit-task-description-${task.id}`}
            value={descriptionDraft}
            onChange={(event) => setDescriptionDraft(event.target.value)}
            placeholder="Add a description (optional)"
            rows={2}
            className="min-h-16 resize-y rounded-2xl border border-sand-deep bg-white px-4 py-3 text-sm text-ink outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
          />
          <TaskScheduleFields
            idPrefix={`edit-task-${task.id}`}
            value={scheduleDraft}
            onChange={setScheduleDraft}
          />
          <TaskPriorityField
            id={`edit-task-priority-${task.id}`}
            value={priorityDraft}
            onChange={setPriorityDraft}
          />
          {editError && (
            <p role="alert" className="text-sm text-[#783f35]">
              {editError}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={!draft.trim() || isSaving} className="min-h-11 cursor-pointer px-4 text-sm">
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="min-h-11 cursor-pointer px-4 text-sm"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`wrap-break-word text-base font-medium ${task.isCompleted ? 'text-sage-deep' : 'text-ink'}`}>
                {task.title}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                  task.priority === 'high'
                    ? 'bg-rose-100 text-rose-800'
                    : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {task.priority} priority
              </span>
              {task.isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sage-pale px-2.5 py-1 text-[11px] font-semibold text-sage-deep">
                  <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden="true">
                    <path d="m3.5 8.2 2.8 2.7 6.2-6.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Completed
                </span>
              )}
            </div>
            {task.description && (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-soft">
                {task.description}
              </p>
            )}
            {task.scheduledDate && task.startTime && task.endTime && (
              <p className="mt-2 inline-flex flex-wrap items-center gap-1.5 rounded-full bg-sage-pale/75 px-3 py-1 text-xs font-medium text-sage-deep">
                <svg viewBox="0 0 16 16" fill="none" className="size-3.5" aria-hidden="true">
                  <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M8 4.8V8l2.1 1.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
                {formatTaskScheduleDate(task.scheduledDate)} · {formatTaskTime(task.startTime)}–{formatTaskTime(task.endTime)}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-soft">
              {!task.isCompleted && (
                <span>{isFocused ? 'Current home focus' : 'Ready when you are'}</span>
              )}
              <time
                dateTime={new Date(task.createdAt).toISOString()}
                className="rounded-full bg-cream-deep/70 px-2.5 py-1"
              >
                Created {formatTaskCreatedAt(task.createdAt)}
              </time>
              {task.completedAt !== null && (
                <time
                  dateTime={new Date(task.completedAt).toISOString()}
                  className="rounded-full bg-sage-pale px-2.5 py-1 text-sage-deep"
                >
                  Completed {formatTaskCreatedAt(task.completedAt)}
                </time>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2 pl-11 sm:pl-0">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onToggleFavourite(task.id)}
              aria-label={task.favourite ? `Remove ${task.title} from favourites` : `Add ${task.title} to favourites`}
              className="size-10 cursor-pointer px-0 text-base"
            >
              <span aria-hidden="true">{task.favourite ? '★' : '☆'}</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDraft(task.title)
                setDescriptionDraft(task.description)
                setScheduleDraft(getTaskSchedule(task))
                setPriorityDraft(task.priority)
                setEditError(null)
                setIsEditing(true)
              }}
              className="min-h-10 cursor-pointer px-4 text-xs"
            >
              Edit
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => onDelete(task.id)}
              className="min-h-10 cursor-pointer px-4 text-xs"
            >
              Delete
            </Button>
          </div>
        </>
      )}
    </li>
  )
}

export default TaskRow
