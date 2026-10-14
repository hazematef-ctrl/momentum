import { useState } from "react";
import { Link } from "react-router-dom";
import { useTasks } from "../tasks";
import { formatTaskTime } from "../utils/formatTaskTime";

function getLocalDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function SchedulePage() {
  const { tasks } = useTasks();
  const [selectedDate, setSelectedDate] = useState(() =>
    getLocalDateInputValue(new Date()),
  );
  const scheduledTasks = tasks
    .filter(
      (task) =>
        task.scheduledDate === selectedDate &&
        task.startTime !== null &&
        task.endTime !== null,
    )
    .sort((first, second) => first.startTime!.localeCompare(second.startTime!));

  const dateHeading = selectedDate
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(`${selectedDate}T12:00:00`))
    : "Choose a date";

  return (
    <section
      aria-labelledby="schedule-heading"
      className="mx-auto w-full max-w-4xl"
    >
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-sage-deep">
            Make room for what matters
          </p>
          <h1
            id="schedule-heading"
            className="mt-2 text-3xl leading-tight font-medium tracking-[-0.04em] text-ink sm:text-4xl"
          >
            Your schedule
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-soft">
            Give each task a little space in your day.
          </p>
        </div>
        <label
          className="flex flex-col gap-1.5 text-xs font-medium text-slate-soft"
          htmlFor="schedule-date"
        >
          View day
          <input
            id="schedule-date"
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="min-h-11 rounded-full border border-sand-deep bg-white/80 px-4 text-sm text-ink outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
          />
        </label>
      </div>

      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink">{dateHeading}</h2>
        <span className="rounded-full bg-sage-pale px-3 py-1 text-xs font-medium text-sage-deep">
          {scheduledTasks.length}{" "}
          {scheduledTasks.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      {scheduledTasks.length > 0 ? (
        <ol className="space-y-4">
          {scheduledTasks.map((task) => (
            <li key={task.id}>
              <article
                className={`relative rounded-3xl border p-4 shadow-[0_16px_50px_-42px_rgba(66,77,57,0.32)] sm:p-5 ${
                  task.isCompleted
                    ? "border-sage/15 bg-sage-pale/35"
                    : "border-white/80 bg-white/75"
                }`}
              >
                <p className="text-xs font-medium text-sage-deep">
                  {formatTaskTime(task.startTime!)} —{" "}
                  {formatTaskTime(task.endTime!)}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-ink">
                    {task.title}
                  </h3>
                  {task.isCompleted && (
                    <span className="rounded-full bg-sage-pale px-2.5 py-1 text-[11px] font-semibold text-sage-deep">
                      Completed
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-soft">
                    {task.description}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-4xl border border-dashed border-sand-deep bg-white/40 px-6 py-12 text-center">
          <p className="text-lg font-medium text-ink">
            Nothing scheduled for this day.
          </p>
          <p className="mt-2 text-sm text-slate-soft">
            Add a date and time to a task to see it on your timeline.
          </p>
          <Link
            to="/mytasks"
            className="mt-5 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            Schedule a task
          </Link>
        </div>
      )}
    </section>
  );
}

export default SchedulePage;
