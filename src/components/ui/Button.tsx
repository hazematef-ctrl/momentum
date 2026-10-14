import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'complete' | 'secondary' | 'danger'
}

function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-ink text-white shadow-sm hover:bg-ink/85 focus-visible:outline-sage',
    complete: 'bg-sage-deep text-white shadow-sm hover:bg-ink focus-visible:outline-sage',
    secondary:
      'border border-sage/30 bg-sage-pale text-sage-deep hover:bg-[#dce7d4] focus-visible:outline-sage',
    danger:
      'border border-[#e5beb3] bg-[#f7e5df] text-[#783f35] hover:bg-[#efd2c9] focus-visible:outline-[#a14f43]',
  }[variant]

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:border-sand-deep disabled:bg-sand-deep disabled:text-slate-soft disabled:opacity-100 disabled:shadow-none ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
