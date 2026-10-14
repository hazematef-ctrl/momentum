import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/AuthContext'
import { Navigation } from './components'
import {
  AuthPage,
  DashboardPage,
  FavouritesPage,
  HomePage,
  LoginPage,
  ProfilePage,
  SchedulePage,
  SignupPage,
} from './pages'
import { TasksProvider, useTasks } from './tasks'

function AppLayout() {
  const { isLoading, error, clearError } = useTasks()
  const { status: authStatus, error: authError, clearError: clearAuthError } = useAuth()

  if (authStatus === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <p role="status" className="text-sm text-slate-soft">Checking your session…</p>
      </main>
    )
  }

  if (authStatus === 'anonymous') {
    return (
      <>
        {authError && (
          <div role="alert" className="fixed inset-x-5 top-5 z-10 mx-auto flex max-w-lg items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <p>{authError}</p>
            <button type="button" onClick={clearAuthError} className="cursor-pointer font-medium">Dismiss</button>
          </div>
        )}
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </>
    )
  }

  return (
    <div className="min-h-screen md:flex">
      <Navigation />
      <main className="min-h-[calc(100svh-15rem)] min-w-0 flex-1 px-5 py-8 sm:px-8 md:min-h-screen md:px-12 md:py-10">
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-4xl flex-col md:min-h-[calc(100svh-5rem)]">
          {error && (
            <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              <p>{error}</p>
              <button
                type="button"
                onClick={clearError}
                aria-label="Dismiss error"
                className="cursor-pointer font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
          {isLoading ? (
            <p role="status" className="my-auto text-center text-sm text-slate-soft">
              Loading your tasks…
            </p>
          ) : (
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/mytasks" element={<DashboardPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/favourites" element={<FavouritesPage />} />
              <Route path="/dashboard" element={<Navigate to="/mytasks" replace />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </div>
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TasksProvider>
          <AppLayout />
        </TasksProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
