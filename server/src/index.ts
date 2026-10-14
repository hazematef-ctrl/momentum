import bcrypt from 'bcryptjs'
import express, { type ErrorRequestHandler, type NextFunction, type Request, type Response } from 'express'
import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { database } from './database.js'

const app = express()
const port = Number(process.env.PORT ?? 3000)
const priorities = ['low', 'medium', 'high'] as const
const SESSION_COOKIE = 'momentum_session'
const USER_SESSION_AGE = 30 * 24 * 60 * 60
const GUEST_COOKIE_AGE = 365 * 24 * 60 * 60
type Priority = (typeof priorities)[number]

interface Task {
  id: string
  title: string
  description: string
  favourite: boolean
  priority: Priority
  scheduledDate: string | null
  startTime: string | null
  endTime: string | null
  isCompleted: boolean
  createdAt: number
  completedAt: number | null
}

interface TaskRow {
  id: string
  title: string
  description: string
  favourite: number
  priority: Priority
  scheduled_date: string | null
  start_time: string | null
  end_time: string | null
  is_completed: number
  created_at: number
  completed_at: number | null
}

interface SessionInfo {
  id: string
  userId: string | null
  isGuest: boolean
}

interface SessionRow extends SessionInfo {
  token_hash: string
  expires_at: number | null
  name: string | null
  email: string | null
}

declare global {
  namespace Express {
    interface Request {
      authSession?: SessionInfo
    }
  }
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

app.use(express.json({ limit: '16kb' }))

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    favourite: row.favourite === 1,
    priority: row.priority,
    scheduledDate: row.scheduled_date,
    startTime: row.start_time,
    endTime: row.end_time,
    isCompleted: row.is_completed === 1,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.cookie
  if (!cookieHeader) return null
  for (const cookie of cookieHeader.split(';')) {
    const separator = cookie.indexOf('=')
    if (separator < 0 || cookie.slice(0, separator).trim() !== name) continue
    return cookie.slice(separator + 1).trim()
  }
  return null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function readSession(request: Request): SessionRow | undefined {
  const token = getCookie(request, SESSION_COOKIE)
  if (!token) return undefined
  const session = database.prepare(`
    SELECT s.id, s.user_id AS userId, s.is_guest AS isGuest, s.token_hash,
           s.expires_at, u.name, u.email
    FROM sessions s
    LEFT JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?
  `).get(hashToken(token)) as SessionRow | undefined

  if (session?.expires_at !== null && session?.expires_at !== undefined && session.expires_at <= Date.now()) {
    database.prepare('DELETE FROM sessions WHERE id = ?').run(session.id)
    return undefined
  }
  if (session) session.isGuest = Boolean(session.isGuest)
  return session
}

function setSessionCookie(response: Response, token: string, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`,
  )
}

function clearSessionCookie(response: Response) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`,
  )
}

function createSession(userId: string | null, isGuest: boolean) {
  const token = randomBytes(32).toString('base64url')
  const id = randomUUID()
  const createdAt = Date.now()
  const expiresAt = createdAt + (isGuest ? GUEST_COOKIE_AGE : USER_SESSION_AGE) * 1000
  database.prepare(`
    INSERT INTO sessions (id, token_hash, user_id, is_guest, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, hashToken(token), userId, isGuest ? 1 : 0, createdAt, expiresAt)
  return { token, id, userId, isGuest }
}

function getRequiredSession(request: Request): SessionInfo {
  if (!request.authSession) throw new HttpError(401, 'Please sign in or continue as a guest.')
  return request.authSession
}

function requireSession(request: Request, response: Response, next: NextFunction) {
  const session = readSession(request)
  if (!session) {
    response.status(401).json({ error: 'Please sign in or continue as a guest.' })
    return
  }
  request.authSession = {
    id: session.id,
    userId: session.userId,
    isGuest: session.isGuest,
  }
  next()
}

function getOwner(session: SessionInfo) {
  return session.userId
    ? { condition: 'user_id = ?', values: [session.userId] }
    : { condition: 'user_id IS NULL', values: [] }
}

function getTask(id: string, session: SessionInfo): Task {
  const owner = getOwner(session)
  const row = database
    .prepare(`SELECT * FROM tasks WHERE id = ? AND ${owner.condition}`)
    .get(id, ...owner.values) as TaskRow | undefined
  if (!row) throw new HttpError(404, 'Task not found.')
  return toTask(row)
}

function readTaskInput(body: unknown) {
  if (!isRecord(body)) throw new HttpError(400, 'Request body must be an object.')

  const { title, description = '', priority = 'medium', scheduledDate, startTime, endTime } = body
  if (typeof title !== 'string' || !title.trim()) {
    throw new HttpError(400, 'Enter a task title.')
  }
  if (typeof description !== 'string') {
    throw new HttpError(400, 'Description must be a string.')
  }
  if (!priorities.includes(priority as Priority)) {
    throw new HttpError(400, 'Priority must be low, medium, or high.')
  }

  const date = scheduledDate ?? null
  const start = startTime ?? null
  const end = endTime ?? null
  if (
    (date !== null && typeof date !== 'string') ||
    (start !== null && typeof start !== 'string') ||
    (end !== null && typeof end !== 'string')
  ) {
    throw new HttpError(400, 'Schedule values must be strings or null.')
  }

  const hasSchedule = date !== null || start !== null || end !== null
  if (hasSchedule && (!date || !start || !end)) {
    throw new HttpError(400, 'Choose a date, start time, and end time, or leave the schedule empty.')
  }
  if (date) {
    const parsedDate = new Date(`${date}T00:00:00.000Z`)
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== date
    ) {
      throw new HttpError(400, 'Choose a valid schedule date.')
    }
  }
  if (start && (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(end ?? ''))) {
    throw new HttpError(400, 'Choose valid start and end times.')
  }
  if (start && end && start >= end) {
    throw new HttpError(400, 'The end time must be later than the start time.')
  }

  return {
    title: title.trim(),
    description: description.trim(),
    priority: priority as Priority,
    scheduledDate: date as string | null,
    startTime: start as string | null,
    endTime: end as string | null,
  }
}

function ensureNoOverlap(
  scheduledDate: string | null,
  startTime: string | null,
  endTime: string | null,
  session: SessionInfo,
  currentTaskId?: string,
) {
  if (!scheduledDate || !startTime || !endTime) return
  const owner = getOwner(session)
  const overlap = database
    .prepare(`
      SELECT 1
      FROM tasks
      WHERE is_completed = 0
        AND scheduled_date = ?
        AND start_time < ?
        AND end_time > ?
        AND id != ?
        AND ${owner.condition}
      LIMIT 1
    `)
    .get(scheduledDate, endTime, startTime, currentTaskId ?? '', ...owner.values) as
    | { 1: number }
    | undefined
  if (overlap) throw new HttpError(400, 'This time overlaps another scheduled task.')
}

function validateEmail(value: unknown): string {
  if (typeof value !== 'string') throw new HttpError(400, 'Enter a valid email address.')
  const email = value.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Enter a valid email address.')
  }
  return email
}

function validatePassword(value: unknown): string {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) {
    throw new HttpError(400, 'Password must be between 8 and 128 characters.')
  }
  return value
}

function publicUser(row: { id: string; name: string; email: string }) {
  return { id: row.id, name: row.name, email: row.email }
}

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' })
})

app.get('/api/auth/session', (request, response) => {
  const session = readSession(request)
  if (!session) {
    response.json({ user: null, isGuest: false, sessionId: null })
    return
  }
  response.json({
    user: session.userId && session.name && session.email
      ? { id: session.userId, name: session.name, email: session.email }
      : null,
    isGuest: session.isGuest,
    sessionId: session.id,
  })
})

app.post('/api/auth/guest', (request, response, next) => {
  try {
    const currentSession = readSession(request)
    if (currentSession?.isGuest) {
      const token = getCookie(request, SESSION_COOKIE)
      if (token) setSessionCookie(response, token, GUEST_COOKIE_AGE)
      response.json({ user: null, isGuest: true, sessionId: currentSession.id })
      return
    }

    const session = createSession(null, true)
    setSessionCookie(response, session.token, GUEST_COOKIE_AGE)
    response.status(201).json({ user: null, isGuest: true, sessionId: session.id })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/signup', async (request, response, next) => {
  try {
    if (!isRecord(request.body)) throw new HttpError(400, 'Request body must be an object.')
    const { name, email: rawEmail, password: rawPassword } = request.body
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
      throw new HttpError(400, 'Name must be between 1 and 80 characters.')
    }
    const email = validateEmail(rawEmail)
    const password = validatePassword(rawPassword)
    const passwordHash = await bcrypt.hash(password, 12)
    const id = randomUUID()
    const insertUser = database.prepare(`
      INSERT INTO users (id, name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `)
    try {
      insertUser.run(id, name.trim(), email, passwordHash, Date.now())
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed: users.email')) {
        throw new HttpError(409, 'An account with this email already exists.')
      }
      throw error
    }

    const session = createSession(id, false)
    setSessionCookie(response, session.token, USER_SESSION_AGE)
    response.status(201).json({
      user: { id, name: name.trim(), email },
      isGuest: false,
      sessionId: session.id,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/login', async (request, response, next) => {
  try {
    if (!isRecord(request.body)) throw new HttpError(400, 'Request body must be an object.')
    const email = validateEmail(request.body.email)
    if (typeof request.body.password !== 'string') {
      throw new HttpError(400, 'Enter your password.')
    }
    const user = database.prepare(`
      SELECT id, name, email, password_hash FROM users WHERE email = ?
    `).get(email) as
      | { id: string; name: string; email: string; password_hash: string }
      | undefined
    if (!user || !(await bcrypt.compare(request.body.password, user.password_hash))) {
      throw new HttpError(401, 'Email or password is incorrect.')
    }

    const session = createSession(user.id, false)
    setSessionCookie(response, session.token, USER_SESSION_AGE)
    response.json({
      user: publicUser(user),
      isGuest: false,
      sessionId: session.id,
    })
  } catch (error) {
    next(error)
  }
})

app.post('/api/auth/logout', (request, response, next) => {
  try {
    const session = readSession(request)
    if (session) database.prepare('DELETE FROM sessions WHERE id = ?').run(session.id)
    clearSessionCookie(response)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use('/api/tasks', requireSession)

app.get('/api/tasks', (request, response) => {
  const session = getRequiredSession(request)
  const owner = getOwner(session)
  const rows = database
    .prepare(`SELECT * FROM tasks WHERE ${owner.condition} ORDER BY created_at, rowid`)
    .all(...owner.values) as TaskRow[]
  response.json(rows.map(toTask))
})

app.post('/api/tasks', (request, response, next) => {
  try {
    const session = getRequiredSession(request)
    const userId = session.userId
    const input = readTaskInput(request.body)
    ensureNoOverlap(input.scheduledDate, input.startTime, input.endTime, session)
    const task: Task = {
      id: randomUUID(),
      ...input,
      favourite: false,
      isCompleted: false,
      createdAt: Date.now(),
      completedAt: null,
    }
    database.prepare(`
      INSERT INTO tasks (
        id, title, description, favourite, priority, scheduled_date,
        start_time, end_time, is_completed, created_at, completed_at, user_id
      ) VALUES (?, ?, ?, 0, ?, ?, ?, ?, 0, ?, NULL, ?)
    `).run(
      task.id,
      task.title,
      task.description,
      task.priority,
      task.scheduledDate,
      task.startTime,
      task.endTime,
      task.createdAt,
      userId,
    )
    response.status(201).json(task)
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tasks/:id', (request, response, next) => {
  try {
    const session = getRequiredSession(request)
    const currentTask = getTask(request.params.id, session)
    const input = readTaskInput(request.body)
    ensureNoOverlap(input.scheduledDate, input.startTime, input.endTime, session, currentTask.id)
    database.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, scheduled_date = ?,
          start_time = ?, end_time = ?
      WHERE id = ?
    `).run(
      input.title,
      input.description,
      input.priority,
      input.scheduledDate,
      input.startTime,
      input.endTime,
      currentTask.id,
    )
    response.json(getTask(currentTask.id, session))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tasks/:id/completion', (request, response, next) => {
  try {
    const session = getRequiredSession(request)
    const task = getTask(request.params.id, session)
    if (!isRecord(request.body) || typeof request.body.isCompleted !== 'boolean') {
      throw new HttpError(400, 'isCompleted must be a boolean.')
    }
    if (task.isCompleted && !request.body.isCompleted) {
      ensureNoOverlap(task.scheduledDate, task.startTime, task.endTime, session, task.id)
    }
    if (task.isCompleted !== request.body.isCompleted) {
      database.prepare(`
        UPDATE tasks SET is_completed = ?, completed_at = ? WHERE id = ?
      `).run(
        request.body.isCompleted ? 1 : 0,
        request.body.isCompleted ? Date.now() : null,
        task.id,
      )
    }
    response.json(getTask(task.id, session))
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tasks/:id/favourite', (request, response, next) => {
  try {
    const session = getRequiredSession(request)
    const task = getTask(request.params.id, session)
    if (!isRecord(request.body) || typeof request.body.favourite !== 'boolean') {
      throw new HttpError(400, 'favourite must be a boolean.')
    }
    database.prepare('UPDATE tasks SET favourite = ? WHERE id = ?').run(
      request.body.favourite ? 1 : 0,
      task.id,
    )
    response.json(getTask(task.id, session))
  } catch (error) {
    next(error)
  }
})

app.delete('/api/tasks/:id', (request, response, next) => {
  try {
    const session = getRequiredSession(request)
    getTask(request.params.id, session)
    database.prepare('DELETE FROM tasks WHERE id = ?').run(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({ error: error.message })
    return
  }
  if (error instanceof SyntaxError && 'body' in error) {
    response.status(400).json({ error: 'Request body contains invalid JSON.' })
    return
  }
  console.error('Request failed.', error)
  response.status(500).json({ error: 'An unexpected server error occurred.' })
}

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Momentum API listening on http://localhost:${port}`)
})
