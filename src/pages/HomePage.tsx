import { DailyFocus, Header, NudgeBanner } from '../components'
import { useTasks } from '../tasks'

function HomePage() {
  const {
    tasks,
    focusedTaskId,
    addTask,
    completeFocusedTask,
    cycleFocus,
  } = useTasks()
  const openTasks = tasks.filter((task) => !task.isCompleted)
  const focusedTask =
    openTasks.find((task) => task.id === focusedTaskId) ?? openTasks[0] ?? null

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col justify-center py-12">
        <DailyFocus
          task={focusedTask}
          openTaskCount={openTasks.length}
          onAddTask={(title, description) => addTask(title, description)}
          onComplete={completeFocusedTask}
          onCycle={cycleFocus}
        />
      </div>
      <NudgeBanner />
      <footer className="pt-8 text-center text-xs tracking-wide text-slate-soft">
        One small step is enough for now.
      </footer>
    </>
  )
}

export default HomePage
