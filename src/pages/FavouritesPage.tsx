import { Link } from 'react-router-dom'
import { TaskRow } from '../components'
import { useTasks } from '../tasks'

function FavouritesPage() {
  const {
    tasks,
    focusedTaskId,
    updateTask,
    toggleTask,
    toggleFavourite,
    deleteTask,
  } = useTasks()
  const favourites = tasks.filter((task) => task.favourite)
  const openFavourites = favourites.filter((task) => !task.isCompleted)
  const completedFavourites = favourites.filter((task) => task.isCompleted)

  return (
    <section aria-labelledby="favourites-heading">
      <div className="mb-8">
        <p className="text-sm font-medium text-sage-deep">Keep the important ones close</p>
        <h1
          id="favourites-heading"
          className="mt-2 text-3xl leading-tight font-medium tracking-[-0.04em] text-ink sm:text-4xl"
        >
          Favourites
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-soft">
          Tasks you mark as favourites will appear here.
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="rounded-4xl border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center">
          <p className="text-lg font-medium text-ink">No favourites yet.</p>
          <p className="mt-2 text-sm text-slate-soft">
            Mark a task with the star to keep it handy here.
          </p>
          <Link
            to="/mytasks"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            View My Tasks
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {openFavourites.length > 0 && (
            <section aria-labelledby="open-favourites-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="open-favourites-heading" className="text-sm font-semibold tracking-wide text-ink">
                  To do
                </h2>
                <span className="rounded-full bg-sage-pale px-3 py-1 text-xs font-medium text-sage-deep">
                  {openFavourites.length}
                </span>
              </div>
              <ul className="space-y-3">
                {openFavourites.map((task) => (
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
          {completedFavourites.length > 0 && (
            <section aria-labelledby="completed-favourites-heading">
              <div className="mb-3 flex items-center justify-between">
                <h2 id="completed-favourites-heading" className="text-sm font-semibold tracking-wide text-ink">
                  Completed
                </h2>
                <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-soft">
                  {completedFavourites.length}
                </span>
              </div>
              <ul className="space-y-3">
                {completedFavourites.map((task) => (
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
    </section>
  )
}

export default FavouritesPage
