import { useEffect, useRef, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react'
import { ChevronDown, X } from 'lucide-react'

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 text-white border border-brand-500 hover:bg-brand-600 hover:border-brand-600 shadow-[0_1px_1px_rgba(16,24,40,0.08)] disabled:bg-brand-200 disabled:border-brand-200',
  secondary: 'bg-white text-gray-800 border border-line-strong hover:bg-gray-50 hover:border-gray-400/60 shadow-[0_1px_1px_rgba(16,24,40,0.04)] disabled:text-gray-400',
  ghost: 'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-300',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md'; icon?: ReactNode }) {
  return (
    <button
      type="button"
      {...rest}
      className={cx(
        'inline-flex items-center justify-center gap-1.5 rounded-ctl font-medium whitespace-nowrap transition-colors duration-150',
        size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3 text-[13px]',
        variants[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({ label, children, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...rest}
      className={cx('inline-flex h-7 w-7 items-center justify-center rounded-ctl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900', className)}
    >
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Badge                                                               */
/* ------------------------------------------------------------------ */

type Tone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'
const tones: Record<Tone, string> = {
  gray: 'bg-gray-100 text-gray-700 ring-gray-200',
  blue: 'bg-brand-50 text-brand-700 ring-brand-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-800 ring-amber-100',
  red: 'bg-red-50 text-red-700 ring-red-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
}
const dots: Record<Tone, string> = {
  gray: 'bg-gray-400',
  blue: 'bg-brand-500',
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  violet: 'bg-violet-500',
}

export function Badge({ tone = 'gray', dot, children, className }: { tone?: Tone; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex h-5 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium ring-1 ring-inset whitespace-nowrap', tones[tone], className)}>
      {dot && <span className={cx('h-1.5 w-1.5 rounded-full', dots[tone])} aria-hidden />}
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Toggle                                                              */
/* ------------------------------------------------------------------ */

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full transition-colors duration-150',
        checked ? 'bg-brand-500' : 'bg-gray-300',
        disabled && 'opacity-50',
      )}
    >
      <span className={cx('inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-150', checked ? 'translate-x-[16px]' : 'translate-x-[2px]')} />
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Select                                                              */
/* ------------------------------------------------------------------ */

export function Select({
  value,
  options,
  onChange,
  label,
  className,
  active,
}: {
  value: string
  options: string[]
  onChange: (v: string) => void
  label: string
  className?: string
  active?: boolean
}) {
  return (
    <span className={cx('relative inline-flex', className)}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          'h-8 w-full appearance-none rounded-ctl border bg-white pl-2.5 pr-7 text-[13px] text-gray-800 transition-colors hover:border-gray-400/70 focus:outline-none focus-visible:border-brand-500 focus-visible:ring-2 focus-visible:ring-brand-100',
          active ? 'border-brand-500 bg-brand-50/60 text-brand-700' : 'border-line-strong',
        )}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500" aria-hidden />
    </span>
  )
}

export const inputClass =
  'h-8 rounded-ctl border border-line-strong bg-white px-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 transition-colors hover:border-gray-400/70 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

/* ------------------------------------------------------------------ */
/* Layout bits                                                         */
/* ------------------------------------------------------------------ */

export function Card({ children, className, ...rest }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={cx('rounded-ctl border border-line bg-white', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, actions, icon }: { title: ReactNode; subtitle?: ReactNode; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
      <div className="flex min-w-0 items-start gap-2">
        {icon && <span className="mt-0.5 text-gray-500">{icon}</span>}
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12px] text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  breadcrumbs,
  meta,
  actions,
  children,
}: {
  title: ReactNode
  breadcrumbs?: { label: string; onClick?: () => void }[]
  meta?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="border-b border-line bg-white px-8 pt-4">
      {breadcrumbs && (
        <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1.5 text-[12px] text-gray-500">
          {breadcrumbs.map((b, i) => (
            <span key={b.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-gray-300">/</span>}
              {b.onClick ? (
                <button className="hover:text-gray-900 hover:underline" onClick={b.onClick}>
                  {b.label}
                </button>
              ) : (
                <span className="text-gray-700">{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-center justify-between gap-4 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="shrink-0 whitespace-nowrap text-[18px] font-semibold tracking-[-0.01em] text-gray-900">{title}</h1>
          {meta && <div className="min-w-0 overflow-hidden">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="-mb-px flex gap-5">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx(
            'flex h-9 items-center gap-1.5 border-b-2 text-[13px] font-medium transition-colors',
            value === t.id ? 'border-brand-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800',
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded-full bg-gray-100 px-1.5 text-[11px] text-gray-600">{t.count}</span>}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Modal                                                               */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 520,
  labelledBy,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: number
  labelledBy?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const node = ref.current
    node?.querySelector<HTMLElement>('button, [href], input, select, textarea')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
      if (e.key === 'Tab' && node) {
        const f = Array.from(node.querySelectorAll<HTMLElement>('button:not(:disabled), [href], input, select, textarea'))
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      prev?.focus?.()
    }
  }, [open, onClose])
  if (!open) return null
  const titleId = labelledBy ?? 'modal-title'
  return (
    <div className="no-print fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 p-4 anim-fade" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        style={{ maxWidth: width }}
        className="anim-pop flex max-h-[calc(100vh-48px)] w-full flex-col overflow-hidden rounded-lg border border-line bg-white shadow-[0_20px_50px_-12px_rgba(16,24,40,0.25)]"
      >
        {title && (
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 id={titleId} className="text-[14px] font-semibold text-gray-900">
              {title}
            </h2>
            <IconButton label="Close" onClick={onClose}>
              <X size={16} />
            </IconButton>
          </div>
        )}
        <div className="thin-scroll overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-line bg-gray-50/60 px-5 py-3">{footer}</div>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function Avatar({ initials, tone = 'gray', size = 24 }: { initials: string; tone?: 'gray' | 'blue' | 'amber' | 'violet' | 'green'; size?: number }) {
  const bg = { gray: 'bg-gray-200 text-gray-700', blue: 'bg-brand-100 text-brand-700', amber: 'bg-amber-100 text-amber-800', violet: 'bg-violet-100 text-violet-700', green: 'bg-emerald-100 text-emerald-700' }[tone]
  return (
    <span className={cx('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', bg)} style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden>
      {initials}
    </span>
  )
}

export const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')

export function Field({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[12px] font-medium text-gray-700">{label}</div>
      {children}
      {hint && <div className="text-[12px] text-gray-500">{hint}</div>}
    </div>
  )
}

export function SimulatedNote({ children }: { children: ReactNode }) {
  return <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-medium text-gray-500">{children}</span>
}
