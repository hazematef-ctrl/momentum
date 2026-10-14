export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthSession {
  user: AuthUser | null
  isGuest: boolean
  sessionId: string | null
}

async function request<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api/auth${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    const responseBody: unknown = await response.json().catch(() => null)
    const message =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'error' in responseBody &&
      typeof responseBody.error === 'string'
        ? responseBody.error
        : `Request failed with status ${response.status}.`
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const authApi = {
  getSession: () => request<AuthSession>('/session'),
  continueAsGuest: () => request<AuthSession>('/guest', {}),
  login: (email: string, password: string) =>
    request<AuthSession>('/login', { email, password }),
  signup: (name: string, email: string, password: string) =>
    request<AuthSession>('/signup', { name, email, password }),
  logout: () => request<void>('/logout', {}),
}
