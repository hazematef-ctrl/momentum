import type { TaskSchedule } from '../../types'

interface TaskScheduleFieldsProps {
  idPrefix: string
  value: TaskSchedule
  onChange: (schedule: TaskSchedule) => void
}

function TaskScheduleFields({ idPrefix, value, onChange }: TaskScheduleFieldsProps) {
  function update(field: keyof TaskSchedule, fieldValue: string) {
    onChange({ ...value, [field]: fieldValue })
  }

  const inputClass =
    'min-h-11 min-w-0 rounded-full border border-sand-deep/70 bg-white/80 px-4 text-sm text-ink outline-none transition focus:border-sage focus:ring-4 focus:ring-sage/10'

  return (
    <fieldset className="grid gap-3 sm:grid-cols-3">
      <legend className="mb-2 text-xs font-medium text-slate-soft">
        Schedule (optional)
      </legend>
      <label className="flex flex-col gap-1.5 text-xs text-slate-soft" htmlFor={`${idPrefix}-date`}>
        Date
        <input
          id={`${idPrefix}-date`}
          type="date"
          value={value.scheduledDate}
          onChange={(event) => update('scheduledDate', event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-slate-soft" htmlFor={`${idPrefix}-start`}>
        Starts
        <input
          id={`${idPrefix}-start`}
          type="time"
          value={value.startTime}
          onChange={(event) => update('startTime', event.target.value)}
          className={inputClass}
        />
      </label>
      <label className="flex flex-col gap-1.5 text-xs text-slate-soft" htmlFor={`${idPrefix}-end`}>
        Ends
        <input
          id={`${idPrefix}-end`}
          type="time"
          value={value.endTime}
          onChange={(event) => update('endTime', event.target.value)}
          className={inputClass}
        />
      </label>
    </fieldset>
  )
}

export default TaskScheduleFields
