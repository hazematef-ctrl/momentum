import type { TaskPriority } from '../../types'

interface TaskPriorityFieldProps {
  id: string
  value: TaskPriority
  onChange: (priority: TaskPriority) => void
}

function TaskPriorityField({ id, value, onChange }: TaskPriorityFieldProps) {
  return (
    <label
      htmlFor={id}
      className="flex flex-col gap-1.5 text-xs text-slate-soft"
    >
      Priority
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as TaskPriority)}
        className="min-h-11 rounded-full border border-sand-deep/70 bg-white/80 px-4 text-sm capitalize text-ink outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </label>
  )
}

export default TaskPriorityField
