# Momentum

Momentum is a small personal task planner. It helps you focus on one task, keep a
task list, mark important tasks, set priorities, and see scheduled tasks for a
chosen day.

This README explains how the app is organized, what each feature does, and how
the React frontend, Express API, and SQLite database work together.

## Run the app

You need Node.js and npm installed.

```bash
npm install
npm run dev
```

Vite prints a local address in the terminal. Open that address in your browser.
The development command starts both Vite and Express.

Useful commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the local development server. |
| `npm run dev:client` | Starts only the Vite frontend. |
| `npm run dev:server` | Starts only the Express API in watch mode. |
| `npm run build` | Type-checks the frontend and API, then creates `dist/`. |
| `npm run typecheck:server` | Type-checks the API only. |
| `npm run preview` | Serves the built app locally so you can preview it. |
| `npm run lint` | Checks the project with Oxlint. |

## What the app can do

- **Home (`/`)** shows one open task as the current focus. You can finish it,
  cycle to another open task, or quickly add a simple task.
- **My Tasks (`/mytasks`)** lets you create, edit, complete, reopen, favourite,
  and delete tasks. Search by task name or description, with open and completed
  tasks shown in separate lists. Search filtering runs after typing pauses.
- **Authentication** provides `/login` and `/signup` pages, plus a guest option.
  Signed-in accounts have private task lists; guest sessions use a separate
  guest task list.
- **Favourites (`/favourites`)** shows tasks marked with a star, separated into
  open and completed lists. The star can be toggled on this page or in My Tasks.
- **Schedule (`/schedule`)** shows tasks with a complete date and time range for
  the selected day. Tasks are ordered by their start time.
- **Profile (`/profile`)** displays the signed-in user's name and email, or
  identifies the active guest session.
- **Priority** can be low, medium, or high. The task row uses a different badge
  color for each level.
- **Focus selection** favors higher-priority open tasks. The Home page also has
  a Next task button to cycle through open tasks.
- **Schedule validation** requires a date, start time, and end time together;
  the end must be later than the start; and an open task cannot overlap another
  open task on the same date.
- The layout is responsive and uses accessible labels and keyboard focus styles.

## How the project is organized

```text
src/
  App.tsx                     Routes and app-wide providers
  main.tsx                    Starts React and loads global CSS
  index.css                   Global styles and Tailwind setup
  components/
    reusable/                 Shared app components
    ui/                       Small general-purpose UI components
  pages/                      One component for each screen
  auth/                       Authentication state and API client
  tasks/                      Task state, API client, and schedule rules
  types/                      TypeScript task and schedule shapes
  utils/                      Date and time display helpers
server/
  src/
    index.ts                  Express routes and server-side validation
    database.ts               SQLite connection and schema
  data/                       Local SQLite database (not committed)
```

### Important files

| File or folder | Responsibility |
| --- | --- |
| `src/main.tsx` | Creates the React root and renders the app. |
| `src/App.tsx` | Sets up React Router, the shared task provider, and page routes. |
| `src/auth/AuthProvider.tsx` | Restores the current sign-in or guest session and provides auth actions. |
| `src/pages/LoginPage.tsx` | Signs in an existing account. |
| `src/pages/SignupPage.tsx` | Creates an account. |
| `src/pages/AuthPage.tsx` | Entry page with login, signup, and guest options. |
| `src/pages/` | Contains Home, My Tasks, Schedule, Favourites, and Profile screens. |
| `src/components/reusable/TaskRow.tsx` | Shared task display and controls used by My Tasks and Favourites. |
| `src/components/reusable/DailyFocus.tsx` | Home page's focused-task panel and quick-add form. |
| `src/components/reusable/TaskScheduleFields.tsx` | Shared date, start-time, and end-time inputs. |
| `src/components/reusable/TaskPriorityField.tsx` | Shared priority dropdown. |
| `src/components/reusable/Navigation.tsx` | Main navigation links and mobile menu. |
| `src/components/ui/Button.tsx` | Shared button styles and variants. |
| `src/tasks/TasksProvider.tsx` | Holds task state and implements task actions. |
| `src/tasks/api.ts` | Sends task reads and mutations to the Express API. |
| `src/tasks/tasksContext.ts` | Describes the values and actions available through task context. |
| `src/tasks/useTasks.ts` | Lets a component read and use the task context. |
| `src/tasks/scheduling.ts` | Checks that task schedules are complete, ordered, and non-overlapping. |
| `src/types/task.ts` | Defines the `Task`, `TaskPriority`, and `TaskSchedule` types. |
| `src/utils/` | Formats dates and times for display. |
| `server/src/index.ts` | Implements task API endpoints and validates requests. |
| `server/src/database.ts` | Creates and opens the SQLite task database. |

## How the app works

### Starting the app and moving between pages

`src/main.tsx` starts React. It renders `App` inside React Strict Mode and
imports the global stylesheet.

`src/App.tsx` wraps the pages in a browser router and a single `TasksProvider`.
The provider loads tasks from the API and shares them across every route.

The routes are:

| URL | Page |
| --- | --- |
| `/` | Home for signed-in/guest sessions; authentication entry otherwise |
| `/login` | Login |
| `/signup` | Signup |
| `/mytasks` | My Tasks |
| `/schedule` | Schedule |
| `/favourites` | Favourites |
| `/profile` | Profile |
| `/dashboard` | Redirects to `/mytasks` |

Unknown URLs redirect to Home. The navigation UI is in
`src/components/reusable/Navigation.tsx`.

### The task data

The `Task` type in `src/types/task.ts` describes one task. The server creates
task IDs and timestamps; SQLite stores task records in
`server/data/momentum.sqlite`.

| Field | Meaning |
| --- | --- |
| `id` | Unique ID created by the API. |
| `title` | Required task name. |
| `description` | Optional extra detail; an empty string means no description. |
| `favourite` | Whether the task is starred. |
| `priority` | `low`, `medium`, or `high`. |
| `scheduledDate` | Date in `YYYY-MM-DD` form, or `null` if unscheduled. |
| `startTime` | Start time in `HH:mm` form, or `null`. |
| `endTime` | End time in `HH:mm` form, or `null`. |
| `isCompleted` | Whether the task is finished. |
| `createdAt` | Creation time as milliseconds since January 1, 1970. |
| `completedAt` | Completion time in the same format, or `null`. |

`TaskSchedule` is the form version of a schedule. Its date and time fields are
strings; blank strings mean no schedule has been entered.

### Task state and actions

`src/tasks/TasksProvider.tsx` loads task records from the API and holds the
current list and focused task ID in React state. Other components use
`useTasks()` to read the list and call actions exposed by the provider.
Mutations update the UI after the server confirms success; API failures are
shown in the app.

- **Add:** trims the title and description, checks the schedule, then asks the
  API to create and persist the task. New tasks use medium priority by default.
- **Edit:** checks the title and schedule, then updates the task's title,
  description, priority, and schedule.
- **Complete or reopen:** flips `isCompleted`. Completing a task records
  `completedAt`; reopening clears it.
- **Favourite:** flips the task's `favourite` value.
- **Delete:** removes the task.
- **Focus cycle:** moves to the next open task in priority order, wrapping
  around to the beginning.
- **Complete focused task:** completes the current focus and moves to the next
  open task.

Focus selection remains in memory and is recalculated after tasks load. Task
records persist across app and server restarts.

### Focus and priority

Priority is ranked high, then medium, then low.

When the app chooses a focus after adding, editing, completing, or deleting a
task, it selects the highest-priority open task. If the current focus is still
among the highest-priority tasks, it stays selected; otherwise, the first task
at that priority is selected.

The Next task action cycles through all open tasks, with higher-priority tasks
first. Equal-priority tasks keep their existing order in the task list.

The Home page reads this focus and passes it to `DailyFocus`. The current focus
ID is only held in memory; it is not a separate task field or a database record.

### Schedule rules

`src/tasks/scheduling.ts` validates schedules in the UI, and the API repeats
validation before writing to the database. A task can either have no schedule
or have all three values: date, start time, and end time. The end time must be
later than the start time. An open task must not overlap another open task on
the same date. Completed tasks do not block a time slot.

The Schedule page starts on today's local date. It filters tasks to that date
and only includes tasks with both start and end times, then sorts by start
time. The date and time display helpers are in `src/utils/`.

### Shared components

`TaskRow` contains common task UI and actions, so the My Tasks and Favourites
screens do not need separate implementations of editing, completion, starring,
and deletion. The task form uses shared schedule and priority fields.

`src/components/index.ts`, `src/components/reusable/index.ts`, and
`src/components/ui/index.ts` re-export components so other files can import
them from a shorter path.

## Authentication and privacy

User accounts use normalized email addresses and bcrypt-hashed passwords.
Login sessions use random tokens stored as hashes in SQLite and sent to the
browser in an HttpOnly, SameSite=Lax cookie. User sessions expire after 30
days. Guest sessions expire after one year and use a separate guest task list
that is shared across guest sessions. Signing out clears the current cookie;
guest tasks remain.

The `users` and `sessions` tables are created automatically. Existing tasks
without an owner remain in the guest task list. Each account-owned task is
scoped to its user ID, and the API checks ownership on every task operation.
The guest task list is shared between guest sessions; guest tasks are not
assigned to or exposed to signed-in accounts.

The database contains these tables:

| Table | Purpose |
| --- | --- |
| `users` | Account ID, display name, normalized unique email, bcrypt password hash, and creation time. |
| `sessions` | Hashed session token, account/guest type, optional account ID, creation time, and expiry. |
| `tasks` | Task details and an optional `user_id`; `NULL` identifies a guest task. |

### Configuration and secrets

The app does not require third-party API keys. The API reads `PORT` and
`MOMENTUM_DB_PATH` from the process environment. `PORT` defaults to `3000`;
`MOMENTUM_DB_PATH` defaults to `server/data/momentum.sqlite`. These can be set
in the shell before starting the server. Do not put real credentials or keys
in source files.

Git ignores `.env` files (except a deliberately safe `.env.example`),
private-key files, the `secrets/` directory, and local SQLite databases.
Never put actual credentials in `.env.example`; use placeholder values only.
If a secret has already been committed or pushed, removing it from a later
commit is not enough—revoke/rotate it immediately and remove it from Git
history before sharing the repository.

This is a learning app, not production-ready identity infrastructure. It does
not include email verification, password reset, rate limiting, or multi-factor
authentication. Add those protections and review deployment configuration
before exposing the service publicly.

## Current limitations

- Focus selection exists only in browser memory and is recalculated when tasks load.
- The profile page does not yet allow changing account details.
- The Home quick-add form creates a task with default medium priority and no
  schedule; the full My Tasks form supports priority and scheduling.
- The SQLite database is local and excluded from version control.

## Backend and database

The app uses a TypeScript Express API and SQLite. The frontend calls the API
using `/api` URLs; Vite proxies those requests to `http://localhost:3000` in
development. The API implementation is in `server/src/`.

The files are organized as follows:

```text
server/
  src/
    index.ts                  Express routes and request validation
    database.ts               SQLite connection and schema
```

The database schema is created automatically on server startup. By default,
the database file is `server/data/momentum.sqlite`. Set `MOMENTUM_DB_PATH` to
use a different database path, or `PORT` to change the API port.

### Task table

The SQLite `tasks` table corresponds to the frontend's `Task` type:

| Column | Stored value |
| --- | --- |
| `id` | Text UUID primary key |
| `title` | Required text |
| `description` | Text, default empty |
| `favourite` | Boolean, default false |
| `priority` | Text restricted to `low`, `medium`, or `high` |
| `scheduled_date` | Date text such as `2026-10-13`, nullable |
| `start_time` | Time text such as `09:30`, nullable |
| `end_time` | Time text such as `10:30`, nullable |
| `is_completed` | Boolean, default false |
| `created_at` | Integer milliseconds since epoch |
| `completed_at` | Integer milliseconds since epoch, nullable |
| `user_id` | Account owner UUID, or `NULL` for guest tasks |

The API returns `createdAt` and `completedAt` as milliseconds and keeps dates
and times in their existing string formats.

### API

Requests and responses use JSON. Task responses use the frontend's camel-case
field names, for example:

```json
{
  "id": "a-unique-id",
  "title": "Plan the week",
  "description": "",
  "favourite": false,
  "priority": "medium",
  "scheduledDate": "2026-10-13",
  "startTime": "09:30",
  "endTime": "10:00",
  "isCompleted": false,
  "createdAt": 1791873000000,
  "completedAt": null
}
```

Available endpoints:

| Method and path | Purpose |
| --- | --- |
| `GET /api/auth/session` | Restore the current account or guest session. |
| `POST /api/auth/signup` | Create an account and sign in. |
| `POST /api/auth/login` | Sign in to an account. |
| `POST /api/auth/guest` | Start or restore a guest session. |
| `POST /api/auth/logout` | End the current session. |
| `GET /api/tasks` | Return all tasks. |
| `POST /api/tasks` | Create a task; return the saved task. |
| `PATCH /api/tasks/:id` | Update title, description, priority, and schedule. |
| `PATCH /api/tasks/:id/completion` | Complete or reopen a task. |
| `PATCH /api/tasks/:id/favourite` | Toggle or set the favourite value. |
| `DELETE /api/tasks/:id` | Delete a task. |

Completion and favourite endpoints accept explicit values, such as
`{ "isCompleted": true }` and `{ "favourite": true }`.

The server validates every write, in addition to the frontend's checks:

- Titles must be non-empty, and priorities must be `low`, `medium`, or `high`.
- Schedules must be empty or contain a valid date and complete time range.
- End times must follow start times, and open tasks cannot overlap on the same
  date. Reopening a completed task also checks for a conflict.
- Task IDs must exist before update, completion, favourite, or delete actions.

Successful reads/updates return `200`, creation returns `201`, and deletion
returns `204`. Invalid input returns `400`; missing task IDs return `404`.
Errors are returned as JSON.

### Deployment notes

- The current API is intended for learning and local development. Add
  authentication rate limiting, email verification, and additional abuse
  protections before public deployment.
- Use HTTPS in production and keep secrets in environment variables.
- SQLite statements are parameterized; back up the database before schema
  changes once it contains important data.

## Growing the project

When adding a feature, first decide which part owns it:

1. Put its data shape in `src/types/`.
2. Put shared state and API actions in `src/tasks/`.
3. Put UI that is reused by multiple pages in `src/components/reusable/`.
4. Put screen-specific composition in `src/pages/`.
5. Put pure formatting or validation helpers in `src/utils/` or the existing
   task logic folder.
6. Export new shared components or pages from the matching `index.ts` file.
7. Add a route in `src/App.tsx` and a navigation link when the feature needs
   its own page.
8. Run `npm run lint` and `npm run build` after changes.

Avoid implementing the same task behavior separately on different pages.
Prefer extending the shared task context and components so every screen stays
consistent.
