import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui'

function AuthPage() {
  const { continueAsGuest, error: sessionError, clearError } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isContinuing, setIsContinuing] = useState(false)

  async function handleGuest() {
    setIsContinuing(true)
    setError(null)
    clearError()
    try {
      await continueAsGuest()
      navigate('/mytasks', { replace: true })
    } catch (guestError) {
      setError(guestError instanceof Error ? guestError.message : 'Could not start guest mode.')
    } finally {
      setIsContinuing(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-lg rounded-4xl border border-white/80 bg-white/75 p-7 shadow-[0_24px_80px_-48px_rgba(66,77,57,0.34)] sm:p-10">
        <p className="text-sm font-semibold tracking-[0.15em] text-sage-deep uppercase">Momentum</p>
        <h1 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-ink sm:text-4xl">
          Make space for what matters.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-soft">
          Sign in to keep your own task list, or continue as a guest to get started.
        </p>
        <div className="mt-8 grid gap-3">
          <Link
            to="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-medium text-white transition-colors hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-sand-deep bg-white px-6 text-sm font-medium text-ink transition-colors hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          >
            Create an account
          </Link>
          <div className="my-1 flex items-center gap-3 text-xs text-slate-soft">
            <span className="h-px flex-1 bg-sand-deep" />
            or
            <span className="h-px flex-1 bg-sand-deep" />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleGuest}
            disabled={isContinuing}
            className="min-h-12 cursor-pointer text-sm"
          >
            {isContinuing ? 'Starting guest session…' : 'Continue as guest'}
          </Button>
        </div>
        {(error || sessionError) && (
          <p role="alert" className="mt-4 text-sm text-[#783f35]">{error ?? sessionError}</p>
        )}
      </section>
    </main>
  )
}

export default AuthPage
