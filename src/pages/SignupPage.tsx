import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/ui'

function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    try {
      await signup(name, email, password)
      navigate('/mytasks', { replace: true })
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Unable to create your account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <section className="w-full max-w-md rounded-4xl border border-white/80 bg-white/75 p-7 shadow-[0_24px_80px_-48px_rgba(66,77,57,0.34)] sm:p-10">
        <Link to="/" className="text-sm font-semibold tracking-[0.15em] text-sage-deep uppercase">Momentum</Link>
        <h1 className="mt-5 text-3xl font-medium tracking-[-0.04em] text-ink">Create your account</h1>
        <p className="mt-2 text-sm text-slate-soft">Your tasks will be private to your account.</p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label htmlFor="signup-name" className="mb-2 block text-sm font-medium text-ink">Name</label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-sand-deep/70 bg-white px-4 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="mb-2 block text-sm font-medium text-ink">Email</label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="mb-2 block text-sm font-medium text-ink">Password</label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-sand-deep/70 bg-white px-4 text-sm outline-none focus:border-sage focus:ring-4 focus:ring-sage/10"
            />
            <p className="mt-1 text-xs text-slate-soft">Use at least 8 characters.</p>
          </div>
          {error && <p role="alert" className="text-sm text-[#783f35]">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full cursor-pointer text-sm">
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-soft">
          Already have an account? <Link to="/login" className="font-medium text-sage-deep underline">Log in</Link>
        </p>
      </section>
    </main>
  )
}

export default SignupPage
