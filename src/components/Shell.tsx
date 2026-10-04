import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  ChartColumn,
  Check,
  ChevronDown,
  Compass,
  FlaskConical,
  Gift,
  Library,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { useApp, type Route } from '../state/AppState'
import { Avatar, cx } from './ui'
import { insights, lostDeals, workspace } from '../data/lossLensData'

const nav: { id: Route; label: string; icon: ReactNode; match: Route[]; isNew?: boolean }[] = [
  { id: 'studies', label: 'Studies', icon: <FlaskConical size={16} />, match: ['studies', 'study'] },
  { id: 'candidates', label: 'Candidates', icon: <Users size={16} />, match: ['candidates'] },
  { id: 'repository', label: 'Repository', icon: <Library size={16} />, match: ['repository', 'interview'] },
  { id: 'incentives', label: 'Incentives', icon: <Gift size={16} />, match: ['incentives'] },
  { id: 'analytics', label: 'Analytics', icon: <ChartColumn size={16} />, match: ['analytics'] },
  { id: 'win-loss', label: 'Win/Loss', icon: <Target size={16} />, match: ['win-loss', 'win-loss/deals', 'deal'], isNew: true },
]

function GQMark() {
  return (
    <div className="flex items-center gap-2">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <rect width="22" height="22" rx="5" fill="#266BD8" />
        <path d="M11 5.2a5.8 5.8 0 1 0 5.6 7.2h-5.1" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="15.6" cy="15.6" r="1.4" fill="#fff" />
      </svg>
      <span className="text-[14px] font-semibold tracking-[-0.01em] text-gray-900">Great Question</span>
    </div>
  )
}

function WorkspaceMenu() {
  const [open, setOpen] = useState(false)
  const { toast } = useApp()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-ctl border border-line bg-white px-2 py-1.5 text-left transition-colors hover:border-line-strong"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-[11px] font-bold text-white">L</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-medium text-gray-900">{workspace.name}</span>
          <span className="block truncate text-[11px] text-gray-500">Business plan</span>
        </span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>
      {open && (
        <div role="menu" className="anim-pop absolute left-0 right-0 top-full z-40 mt-1 rounded-ctl border border-line bg-white p-1 shadow-lg">
          <button role="menuitem" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-[13px] hover:bg-gray-50">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-900 text-[10px] font-bold text-white">L</span>
            Ledgerly
            <Check size={14} className="ml-auto text-brand-500" />
          </button>
          <button
            role="menuitem"
            onClick={() => {
              setOpen(false)
              toast('Only the Ledgerly demo workspace exists in this prototype', 'info')
            }}
            className="w-full rounded px-2 py-1.5 text-left text-[13px] text-gray-500 hover:bg-gray-50"
          >
            Create workspace…
          </button>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { route, navigate } = useApp()
  return (
    <aside className="no-print flex w-[232px] shrink-0 flex-col border-r border-line bg-white">
      <div className="px-4 pb-3 pt-4">
        <GQMark />
      </div>
      <div className="px-3 pb-3">
        <WorkspaceMenu />
      </div>
      <nav aria-label="Primary" className="flex-1 space-y-0.5 px-3">
        {nav.map((n) => {
          const active = n.match.includes(route)
          return (
            <button
              key={n.id}
              data-tour={n.id === 'win-loss' ? 'nav-winloss' : undefined}
              aria-current={active ? 'page' : undefined}
              onClick={() => navigate(n.id)}
              className={cx(
                'group flex h-8 w-full items-center gap-2.5 rounded-ctl px-2.5 text-[13px] font-medium transition-colors duration-150',
                active ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <span className={active ? 'text-brand-500' : 'text-gray-400 group-hover:text-gray-600'}>{n.icon}</span>
              {n.label}
              {n.isNew && <span className="ml-auto rounded-full bg-brand-500 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white">New</span>}
            </button>
          )
        })}
      </nav>
      <div className="border-t border-line p-3">
        <button
          onClick={() => navigate('settings')}
          aria-current={route === 'settings' || route === 'salesforce' ? 'page' : undefined}
          className={cx(
            'flex h-8 w-full items-center gap-2.5 rounded-ctl px-2.5 text-[13px] font-medium transition-colors',
            route === 'settings' || route === 'salesforce' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
          )}
        >
          <Settings size={16} className={route === 'settings' || route === 'salesforce' ? 'text-brand-500' : 'text-gray-400'} />
          Settings
        </button>
      </div>
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Global search                                                       */
/* ------------------------------------------------------------------ */

function GlobalSearch() {
  const { navigate, setModal } = useApp()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        ref.current?.querySelector('input')?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const items: { label: string; kind: string; go: () => void }[] = [
      { label: 'Win/Loss dashboard', kind: 'Page', go: () => navigate('win-loss') },
      { label: 'Win/Loss — Always-on', kind: 'Study', go: () => navigate('study') },
      { label: 'Acme Freight · Win/loss interview', kind: 'Repository', go: () => navigate('interview') },
      { label: 'Acme Freight · Deal activity', kind: 'Deal', go: () => navigate('deal') },
      { label: 'Salesforce triggers', kind: 'Settings', go: () => navigate('salesforce') },
      { label: 'Incentives wallet', kind: 'Page', go: () => navigate('incentives') },
      ...insights.map((i) => ({ label: i.headline, kind: 'Insight', go: () => setModal({ kind: 'clip', payload: i.citationId }) })),
      ...lostDeals
        .filter((d) => d.id !== 'acme-freight')
        .map((d) => ({ label: `${d.account} · ${d.contactRole}`, kind: 'Lost deal', go: () => navigate('win-loss/deals') })),
    ]
    const s = q.trim().toLowerCase()
    if (!s) return items.slice(0, 6)
    return items.filter((i) => i.label.toLowerCase().includes(s) || i.kind.toLowerCase().includes(s)).slice(0, 8)
  }, [q, navigate, setModal])

  return (
    <div className="relative w-[340px]" ref={ref}>
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
      <input
        aria-label="Search Great Question"
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) {
            results[0].go()
            setOpen(false)
            setQ('')
          }
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Search studies, candidates, insights…"
        className="h-8 w-full rounded-ctl border border-line bg-gray-50 pl-8 pr-12 text-[13px] placeholder:text-gray-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-line bg-white px-1 text-[10px] text-gray-400">⌘K</kbd>
      {open && (
        <div className="anim-pop absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-ctl border border-line bg-white py-1 shadow-lg">
          {results.length === 0 && <div className="px-3 py-2 text-[12px] text-gray-500">No results for “{q}”</div>}
          {results.map((r) => (
            <button
              key={r.kind + r.label}
              onClick={() => {
                r.go()
                setOpen(false)
                setQ('')
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-gray-50"
            >
              <span className="w-[72px] shrink-0 text-[11px] text-gray-400">{r.kind}</span>
              <span className="truncate text-gray-800">{r.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopBar() {
  const { setAskOpen, askOpen, setTour, setWelcomeOpen } = useApp()
  return (
    <header className="no-print flex h-12 shrink-0 items-center justify-between gap-4 border-b border-line bg-white px-6">
      <GlobalSearch />
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            setTour((t) => ({ ...t, open: false }))
            setWelcomeOpen(true)
          }}
          className="flex h-8 items-center gap-1.5 rounded-ctl px-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <Compass size={15} />
          Product tour
        </button>
        <button
          data-tour="askai-entry"
          onClick={() => setAskOpen(!askOpen)}
          aria-pressed={askOpen}
          className={cx(
            'flex h-8 items-center gap-1.5 rounded-ctl border px-2.5 text-[13px] font-medium transition-colors',
            askOpen ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-line-strong bg-white text-gray-800 hover:bg-gray-50',
          )}
        >
          <Sparkles size={15} className="text-brand-500" />
          Ask AI
        </button>
        <span className="mx-1 h-5 w-px bg-line" aria-hidden />
        <span title={`${workspace.user.name} · ${workspace.user.role}`}>
          <Avatar initials={workspace.user.initials} tone="blue" size={28} />
        </span>
      </div>
    </header>
  )
}
