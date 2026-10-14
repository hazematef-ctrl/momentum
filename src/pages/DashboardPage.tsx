import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { TaskPriorityField, TaskRow, TaskScheduleFields } from '../components'
import { Button } from '../components/ui'
import { useTasks } from '../tasks'
import type { TaskPriority, TaskSchedule } from '../types'

function DashboardPage() {
  const {
    tasks,
    focusedTaskId,
    addTask,
    updateTask,
    toggleTask,
    toggleFavourite,
    deleteTask,
  } = useTasks()
  const [newTask, setNewTask] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskSchedule, setNewTaskSchedule] = useState<TaskSchedule>({
    scheduledDate: '',
    startTime: '',
    endTime: '',
  })
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [addError, setAddError] = useState<string | null>(null)
  const normalizedSearchQuery = searchQuery.trim().toLocaleLowerCase()
  const matchingTasks = tasks.filter((task) => {
    if (!normalizedSearchQuery) return true
    return `${task.title} ${task.description}`
      .toLocaleLowerCase()
      .includes(normalizedSearchQuery)
  })
  const openTasks = matchingTasks.filter((task) => !task.isCompleted)
  const completedTasks = matchingTasks.filter((task) => task.isCompleted)

  useEffect(() => () => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
  }, [])

  function handleSearchChange(value: string) {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(value)
      searchTimeoutRef.current = null
    }, 300)
  }

  function clearSearch() {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = null
    if (searchInputRef.current) searchInputRef.current.value = ''
    setSearchQuery('')
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = newTask.trim()
    if (!title) return
    const error = await addTask(
      title,
      newTaskDescription,
      newTaskSchedule,
      newTaskPriority,
    )
    if (error) {
      setAddError(error)
      return
    }
    setNewTask('')
    setNewTaskDescription('')
    setNewTaskSchedule({ scheduledDate: '', startTime: '', endTime: '' })
    setNewTaskPriority('medium')
    setAddError(null)
  }

  return (
    <section aria-labelledby="dashboard-heading">
      <div className="mb-8">
        <p className="text-sm font-medium text-sage-deep">Your personal task space</p>
        <h1 id="dashboard-heading" className="mt-2 text-3xl leading-tight font-medium tracking-[-0.04em] text-ink sm:text-4xl">
          Your tasks, at your pace.
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-soft">
          Keep the whole list here. Home will help you stay with one open task at a time.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="mb-8 flex flex-col gap-3 rounded-4xl border border-white/80 bg-white/65 p-4 sm:p-5"
      >
        <label htmlFor="new-dashboard-task" className="sr-only">
          Add a task
        </label>
        <input
          id="new-dashboard-task"
          value={newTask}
          onChange={(event) => setNewTask(event.target.value)}
          placeholder="What would you like to remember?"
          className="min-h-12 min-w-0 rounded-full border border-sand-deep/70 bg-white/80 px-5 text-sm text-ink outline-none transition placeholder:text-slate-soft/75 focus:border-sage focus:ring-4 focus:ring-sage/10"
        />
        <label htmlFor="new-dashboard-task-description" className="sr-only">
          Task description (optional)
        </label>
        <textarea
          id="new-dashboard-task-description"
          value={newTaskDescription}
          onChange={(event) => setNewTaskDescription(event.target.value)}
          placeholder="Add a description (optional)"
          rows={2}
          className="min-h-16 resize-y rounded-2xl border border-sand-deep/70 bg-white/80 px-5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-soft/75 focus:border-sage focus:ring-4 focus:ring-sage/10"
        />
        <TaskScheduleFields
          idPrefix="new-dashboard-task"
          value={newTaskSchedule}
          onChange={setNewTaskSchedule}
        />
        <TaskPriorityField
          id="new-dashboard-task-priority"
          value={newTaskPriority}
          onChange={setNewTaskPriority}
        />
        {addError && (
          <p role="alert" className="text-sm text-[#783f35]">
            {addError}
          </p>
        )}
        <div className="flex justify-end">
          <Button type="submit" disabled={!newTask.trim()} className="min-h-12 cursor-pointer px-6 text-sm">
            Add task <span aria-hidden="true">+</span>
          </Button>
        </div>
      </form>

      {tasks.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center">
          <p className="text-lg font-medium text-ink">Your list can start small.</p>
          <p className="mt-2 text-sm text-slate-soft">Add a task above, or head home to choose your first step.</p>
          <Link
            to="/"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-sage px-5 text-sm font-medium text-white transition-colors hover:bg-sage-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            Go to Home
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <label htmlFor="task-search" className="sr-only">
              Search tasks
            </label>
            <input
              id="task-search"
              type="search"
              ref={searchInputRef}
              onChange={(event) => handleSearchChange(event.currentTarget.value)}
              placeholder="Search tasks by name or description"
              className="min-h-12 w-full rounded-full border border-sand-deep/70 bg-white/80 px-5 text-sm text-ink outline-none transition placeholder:text-slate-soft/75 focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
          </div>

          {matchingTasks.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center">
              <p className="text-lg font-medium text-ink">No matching tasks.</p>
              <p className="mt-2 text-sm text-slate-soft">
                Try a different search, or clear it to see your full list.
              </p>
              <button
                type="button"
                onClick={clearSearch}
                className="mt-5 inline-flex min-h-11 cursor-pointer items-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              <section aria-labelledby="open-tasks-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2 id="open-tasks-heading" className="text-sm font-semibold tracking-wide text-ink">
                    To do
                  </h2>
                  <span className="rounded-full bg-sage-pale px-3 py-1 text-xs font-medium text-sage-deep">
                    {openTasks.length}
                  </span>
                </div>
                {openTasks.length > 0 ? (
                  <ul className="space-y-3">
                    {openTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isFocused={task.id === focusedTaskId}
                        onUpdate={updateTask}
                        onToggle={toggleTask}
                        onToggleFavourite={toggleFavourite}
                        onDelete={deleteTask}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-3xl bg-white/55 px-5 py-6 text-sm text-slate-soft">
                    You&apos;ve completed everything matching this search.
                  </p>
                )}
              </section>

              {completedTasks.length > 0 && (
                <section aria-labelledby="completed-tasks-heading">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 id="completed-tasks-heading" className="text-sm font-semibold tracking-wide text-ink">
                      Completed
                    </h2>
                    <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-soft">
                      {completedTasks.length}
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {completedTasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        isFocused={task.id === focusedTaskId}
                        onUpdate={updateTask}
                        onToggle={toggleTask}
                        onToggleFavourite={toggleFavourite}
                        onDelete={deleteTask}
                      />
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default DashboardPage
