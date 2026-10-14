import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/mytasks', { replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to log in.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-4xl border border-white/80 bg-white/75 p-7 shadow-[0_24px_80px_-48px_rgba(66,77,57,0.34)] sm:p-10">
        <Link to="/" className="text-sm font-semibold tracking-[0.15em] text-sage-deep uppercase">Momentum</Link>
        <h1 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-soft">Log in to pick up where you left off.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-ink">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-sand-deep/70 bg-white px-4 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-sm font-medium text-ink">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-sand-deep/70 bg-white px-4 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
          </div>
          {error && <p role="alert" className="text-sm text-[#783f35]">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full cursor-pointer text-sm">
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-soft">
          New to Momentum? <Link to="/signup" className="font-medium text-sage-deep underline">Create an account</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
