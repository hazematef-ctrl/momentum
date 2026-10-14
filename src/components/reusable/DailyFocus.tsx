import { useState, type FormEvent } from 'react'
import type { Task } from '../../types'
import { formatTaskCreatedAt } from '../../utils/formatTaskCreatedAt'
import { formatTaskTime } from '../../utils/formatTaskTime'
import { Button } from '../ui'

interface DailyFocusProps {
  task: Task | null
  openTaskCount: number
  onAddTask: (title: string, description: string) => Promise<string | null>
  onComplete: () => Promise<void>
  onCycle: () => void
}

function DailyFocus({
  task,
  openTaskCount,
  onAddTask,
  onComplete,
  onCycle,
}: DailyFocusProps) {
  const [draft, setDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')
  const [addError, setAddError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return

    setIsAdding(true)
    try {
      const error = await onAddTask(title, descriptionDraft)
      if (error) {
        setAddError(error)
        return
      }
      setDraft('')
      setDescriptionDraft('')
      setAddError(null)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section
      aria-labelledby="focus-heading"
      className="rounded-4xl border border-white/80 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(66,77,57,0.34)] backdrop-blur-sm sm:p-10"
    >
      <div className="mb-8 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-sage-pale text-sage-deep">
          <svg viewBox="0 0 24 24" fill="none" className="size-5" aria-hidden="true">
            <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="3.25" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </span>
        <div>
          <h2 id="focus-heading" className="text-sm font-semibold tracking-wide text-ink">
            Your focus, for now
          </h2>
          <p className="mt-0.5 text-xs text-slate-soft">There&apos;s no rush to do more.</p>
        </div>
      </div>

      {task ? (
        <div className="rounded-3xl bg-cream-deep/55 p-5 sm:p-6">
          <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-sage-deep uppercase">
            Just this one thing
          </p>
          <div className="flex flex-col justify-between sm:flex-row sm:items-center sm:gap-5">
            <div className="min-w-0">
              <p className="wrap-break-word text-2xl leading-snug font-medium tracking-tight text-ink sm:text-3xl">
                {task.title}
              </p>
              {task.description && (
                <p className="mt-2 max-w-xl whitespace-pre-wrap text-sm leading-relaxed text-slate-soft">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <time
                  dateTime={new Date(task.createdAt).toISOString()}
                  className="inline-flex rounded-full bg-white/75 px-3 py-1 text-xs text-slate-soft"
                >
                  Added {formatTaskCreatedAt(task.createdAt)}
                </time>
                {task.scheduledDate && task.startTime && task.endTime && (
                  <time
                    dateTime={`${task.scheduledDate}T${task.startTime}`}
                    className="inline-flex rounded-full bg-sage-pale/80 px-3 py-1 text-xs font-medium text-sage-deep"
                  >
                    {formatTaskTime(task.startTime)}–{formatTaskTime(task.endTime)}
                  </time>
                )}
              </div>
            </div>
            <div className="mt-7 flex shrink-0 flex-wrap gap-2 sm:justify-end">
              {openTaskCount > 1 && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCycle}
                  className="min-h-12 cursor-pointer px-4 text-sm"
                  aria-label="Switch to the next open task"
                >
                  Next task
                  <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                    <path d="M4 10h11m0 0-4-4m4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              )}
              <Button
                type="button"
                variant="complete"
                onClick={onComplete}
                className="min-h-12 cursor-pointer px-5 text-sm"
              >
                <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
                  <path d="m4.5 10.2 3.7 3.7 7.4-7.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                I&apos;ve done this
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-cream-deep/55 px-5 py-7 text-center sm:px-8 sm:py-9">
          <p className="text-lg leading-relaxed font-medium text-ink sm:text-xl">
            What is the absolute smallest next step?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-soft">
            It can be tiny. Start wherever you are.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <label htmlFor="next-step" className="mb-2 block text-xs font-medium text-slate-soft">
          Add a small step to your task list
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="next-step"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Something I need to do…"
            className="min-h-12 min-w-0 flex-1 rounded-full border border-sand-deep/70 bg-white/80 px-5 text-sm text-ink outline-none transition placeholder:text-slate-soft/75 focus:border-sage focus:ring-4 focus:ring-sage/10"
          />
        </div>
        <label htmlFor="next-step-description" className="sr-only">
          Task description (optional)
        </label>
        <textarea
          id="next-step-description"
          value={descriptionDraft}
          onChange={(event) => setDescriptionDraft(event.target.value)}
          placeholder="Add a little more detail (optional)"
          rows={2}
          className="mt-3 min-h-20 w-full resize-y rounded-2xl border border-sand-deep/70 bg-white/80 px-5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-soft/75 focus:border-sage focus:ring-4 focus:ring-sage/10"
        />
        {addError && (
          <p role="alert" className="mt-2 text-sm text-[#783f35]">
            {addError}
          </p>
        )}
        <div className="mt-3 flex justify-end">
          <Button type="submit" disabled={!draft.trim() || isAdding} className="min-h-12 px-6 text-sm">
            {isAdding ? 'Adding…' : 'Add task'}
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </form>
    </section>
  )
}

export default DailyFocus
