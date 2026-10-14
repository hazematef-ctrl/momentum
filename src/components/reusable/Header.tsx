import { useState } from 'react'

function Header() {
  const [today] = useState(() =>
    new Intl.DateTimeFormat('en', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(new Date()),
  )

  return (
    <header className="flex flex-col gap-2">
      <div className="space-y-2">
        <p className="text-sm font-medium text-sage-deep">{today}</p>
        <h1 className="max-w-lg text-3xl leading-tight font-medium tracking-[-0.04em] text-ink sm:text-4xl">
          Take a breath.
          <br className="hidden sm:block" /> Let&apos;s focus on just one thing.
        </h1>
      </div>
    </header>
  )
}

export default Header
