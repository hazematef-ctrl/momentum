function NudgeBanner() {
  return (
    <aside className="flex items-start gap-3 rounded-2xl border border-sage/15 bg-sage-pale/65 px-5 py-4 text-sm text-sage-deep">
      <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 size-4 shrink-0" aria-hidden="true">
        <path
          d="M10 2.5v2m0 11v2M2.5 10h2m11 0h2M4.7 4.7l1.4 1.4m7.8 7.8 1.4 1.4m0-10.6-1.4 1.4m-7.8 7.8-1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <p className="leading-relaxed">
        A gentle reminder: <span className="font-medium">you can stop after five minutes.</span>{' '}
        Starting is enough.
      </p>
    </aside>
  )
}

export default NudgeBanner
