import { useAuth } from '../auth/AuthContext'

function ProfilePage() {
  const { user, isGuest } = useAuth()
  const name = user?.name ?? 'Guest'
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <section aria-labelledby="profile-heading" className="mx-auto w-full max-w-3xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-sage-deep">Your account</p>
        <h1
          id="profile-heading"
          className="mt-2 text-3xl leading-tight font-medium tracking-[-0.04em] text-ink sm:text-4xl"
        >
          Profile
        </h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-soft">
          A little space for your personal details.
        </p>
      </div>

      <div className="rounded-4xl border border-white/80 bg-white/75 p-6 shadow-[0_24px_80px_-48px_rgba(66,77,57,0.34)] sm:p-9">
        <div className="flex flex-col items-start gap-5 border-b border-sand-deep/70 pb-7 sm:flex-row sm:items-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-sage-deep text-lg font-semibold tracking-wide text-white">
            {initials}
          </span>
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-slate-soft uppercase">
              {isGuest ? 'Guest session' : 'Account name'}
            </p>
            <h2 className="mt-1 text-2xl font-medium tracking-[-0.03em] text-ink">
              {name}
            </h2>
          </div>
        </div>

        <div className="pt-6">
          <p className="text-sm font-semibold text-ink">
            {isGuest ? 'Using Momentum as a guest' : 'Signed-in account'}
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-soft">
            {isGuest
              ? 'Your tasks are saved in the separate guest list. Create an account to keep a private task list tied to your sign-in.'
              : 'Your tasks are saved to your account and are available when you sign in again.'}
          </p>
          {user && (
            <div className="mt-5 border-t border-sand-deep/70 pt-5">
              <p className="text-xs font-semibold tracking-wide text-slate-soft uppercase">Email address</p>
              <p className="mt-1 text-sm text-ink">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
