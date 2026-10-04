import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, Bot, Compass, Plug, X, Zap } from 'lucide-react'
import { useApp, usePlayback } from '../state/AppState'
import { Button, cx } from '../components/ui'
import { tourSteps } from './tourSteps'
import type { TourPlacement } from '../data/lossLensData'

const TOTAL = tourSteps.length
const PAD = 6
const GAP = 14
const CARD_W = 328
const EDGE = 16

type Rect = { top: number; left: number; width: number; height: number }

function unionRect(selector: string): Rect | null {
  const els = Array.from(document.querySelectorAll<HTMLElement>(selector)).filter((el) => el.offsetParent !== null || el.getClientRects().length)
  if (!els.length) return null
  let top = Infinity,
    left = Infinity,
    right = -Infinity,
    bottom = -Infinity
  els.forEach((el) => {
    const r = el.getBoundingClientRect()
    if (!r.width && !r.height) return
    top = Math.min(top, r.top)
    left = Math.min(left, r.left)
    right = Math.max(right, r.right)
    bottom = Math.max(bottom, r.bottom)
  })
  if (!isFinite(top)) return null
  return { top: top - PAD, left: left - PAD, width: right - left + PAD * 2, height: bottom - top + PAD * 2 }
}

const sameRect = (a: Rect | null, b: Rect | null) =>
  a === b || (!!a && !!b && Math.abs(a.top - b.top) < 0.5 && Math.abs(a.left - b.left) < 0.5 && Math.abs(a.width - b.width) < 0.5 && Math.abs(a.height - b.height) < 0.5)

function placeCard(r: Rect, h: number, preferred: TourPlacement) {
  const W = window.innerWidth
  const H = window.innerHeight
  const vTop = Math.max(r.top, 0)
  const vBottom = Math.min(r.top + r.height, H)
  const clampY = (y: number) => Math.max(EDGE, Math.min(y, H - h - EDGE))
  const clampX = (x: number) => Math.max(EDGE, Math.min(x, W - CARD_W - EDGE))
  const fits: Record<TourPlacement, boolean> = {
    right: r.left + r.width + GAP + CARD_W <= W - EDGE,
    left: r.left - GAP - CARD_W >= EDGE,
    bottom: vBottom + GAP + h <= H - EDGE,
    top: vTop - GAP - h >= EDGE,
  }
  const order: TourPlacement[] = [preferred, 'right', 'left', 'bottom', 'top']
  const p = order.find((o) => fits[o])
  const alignY = clampY(vTop)
  switch (p) {
    case 'right':
      return { top: alignY, left: r.left + r.width + GAP }
    case 'left':
      return { top: alignY, left: r.left - GAP - CARD_W }
    case 'bottom':
      return { top: vBottom + GAP, left: clampX(r.left + r.width - CARD_W) }
    case 'top':
      return { top: vTop - GAP - h, left: clampX(r.left + r.width - CARD_W) }
    default:
      return { top: H - h - EDGE, left: W - CARD_W - EDGE }
  }
}

const isTyping = (el: EventTarget | null) => {
  const n = el as HTMLElement | null
  if (!n) return false
  return n.tagName === 'INPUT' || n.tagName === 'TEXTAREA' || n.tagName === 'SELECT' || n.isContentEditable
}

/* ------------------------------------------------------------------ */
/* Controller                                                          */
/* ------------------------------------------------------------------ */

export function TourController() {
  const app = useApp()
  const { seek, setPlaying } = usePlayback()
  const { tour, setTour } = app
  const step = tourSteps[tour.step]
  const appRef = useRef(app)
  appRef.current = app
  const prevStep = useRef<number | null>(null)

  // Navigate + prepare the destination whenever the active step changes.
  useEffect(() => {
    if (!tour.open) {
      prevStep.current = null
      return
    }
    const s = tourSteps[tour.step]
    const dir = prevStep.current !== null && prevStep.current > tour.step ? 'back' : 'forward'
    prevStep.current = tour.step
    const a = appRef.current
    if (s.route && a.route !== s.route) a.navigate(s.route)
    s.setup?.({ app: a, seek, setPlaying }, dir)
  }, [tour.open, tour.step, seek, setPlaying])

  const canNext = !step?.requires || step.requires(app)
  const next = () => {
    if (!canNext) return
    if (tour.step < TOTAL - 1) setTour((t) => ({ ...t, step: t.step + 1 }))
  }
  const back = () => tour.step > 0 && setTour((t) => ({ ...t, step: t.step - 1 }))
  const skip = () => setTour((t) => ({ ...t, open: false, resumable: t.step < TOTAL - 1 }))

  // Keyboard: ← → Esc, ignored while typing.
  const keyRef = useRef({ next, back, skip })
  keyRef.current = { next, back, skip }
  useEffect(() => {
    if (!tour.open) return
    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.querySelector('[role="dialog"][aria-modal="true"]:not([data-tour-dialog])')) return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        keyRef.current.next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        keyRef.current.back()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        keyRef.current.skip()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tour.open])

  if (!tour.open || !step) return null
  if (step.kind === 'modal') return <ClosingModal onBack={back} />
  return <Spotlight key={tour.step} canNext={canNext} onNext={next} onBack={back} onSkip={skip} />
}

/* ------------------------------------------------------------------ */
/* Spotlight + coach-mark                                              */
/* ------------------------------------------------------------------ */

function Spotlight({ canNext, onNext, onBack, onSkip }: { canNext: boolean; onNext: () => void; onBack: () => void; onSkip: () => void }) {
  const app = useApp()
  const { tour } = app
  const step = tourSteps[tour.step]
  const selector = step.target?.(app) ?? ''
  const [rect, setRect] = useState<Rect | null>(null)
  const [missing, setMissing] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardH, setCardH] = useState(220)
  const scrolledFor = useRef<string>('')

  // Track the target every frame: handles navigation, layout shifts, scrolling and animation.
  useEffect(() => {
    let raf = 0
    const started = performance.now()
    const tick = () => {
      const r = selector ? unionRect(selector) : null
      if (r) {
        const key = `${tour.step}|${selector}`
        if (scrolledFor.current !== key) {
          scrolledFor.current = key
          const el = document.querySelector<HTMLElement>(selector)
          const tooTall = r.height > window.innerHeight - 120
          const offscreen = r.top < 56 || r.top + r.height > window.innerHeight - 8
          if (el && offscreen) el.scrollIntoView({ block: tooTall ? 'start' : 'center', behavior: 'smooth' })
        }
        setMissing(false)
      } else if (performance.now() - started > 900) {
        setMissing(true)
      }
      setRect((prev) => (sameRect(prev, r) ? prev : r))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [selector, tour.step])

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight)
  })

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true })
  }, [tour.step])

  const hint = step.hint?.(app)
  const placement = step.placement?.(app) ?? 'right'
  const W = typeof window !== 'undefined' ? window.innerWidth : 1440
  const H = typeof window !== 'undefined' ? window.innerHeight : 900
  const pos = rect ? placeCard(rect, cardH, placement) : { top: H / 2 - cardH / 2, left: W / 2 - CARD_W / 2 }

  // Blockers around the hole keep the rest of the app inert while the target stays interactive.
  const hole = rect ?? { top: 0, left: 0, width: 0, height: 0 }
  const blockers = rect
    ? [
        { top: 0, left: 0, width: W, height: Math.max(0, hole.top) },
        { top: hole.top + hole.height, left: 0, width: W, height: Math.max(0, H - hole.top - hole.height) },
        { top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height },
        { top: hole.top, left: hole.left + hole.width, width: Math.max(0, W - hole.left - hole.width), height: hole.height },
      ]
    : [{ top: 0, left: 0, width: W, height: H }]

  return (
    <div className="no-print">
      {blockers.map((b, i) => (
        <div key={i} className="fixed z-[60]" style={{ ...b, background: rect ? 'transparent' : 'rgba(17,24,39,0.5)' }} onClick={(e) => e.stopPropagation()} aria-hidden />
      ))}
      {rect && (
        <div
          className="pointer-events-none fixed z-[61] rounded-lg ring-2 ring-brand-500 transition-all duration-300 ease-out"
          style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height, boxShadow: '0 0 0 9999px rgba(17,24,39,0.5)' }}
          aria-hidden
        />
      )}
      <div
        ref={cardRef}
        role="dialog"
        data-tour-dialog
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        className="anim-pop fixed z-[70] rounded-lg border border-line bg-white shadow-[0_18px_40px_-12px_rgba(16,24,40,0.35)] outline-none transition-[top,left] duration-300 ease-out"
        style={{ top: pos.top, left: pos.left, width: CARD_W }}
      >
        <div className="px-4 pb-3 pt-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-600">
              Step {tour.step + 1} of {TOTAL}
            </span>
            <button onClick={onSkip} className="rounded px-1 text-[12px] text-gray-500 hover:text-gray-900">
              Skip tour
            </button>
          </div>
          <h2 id="tour-title" className="mt-1.5 text-[15px] font-semibold leading-snug text-gray-900">
            {step.title}
          </h2>
          <p id="tour-body" className="mt-1 text-[13px] leading-relaxed text-gray-600">
            {step.body}
          </p>
          {hint && (
            <p className={cx('mt-2.5 rounded-ctl px-2.5 py-1.5 text-[12px]', canNext ? 'bg-gray-50 text-gray-600' : 'bg-brand-50 font-medium text-brand-700')} aria-live="polite">
              {hint}
            </p>
          )}
          {missing && <p className="mt-2 text-[12px] text-amber-700">This part of the screen isn’t visible right now — use Next to continue.</p>}
        </div>
        <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
          <div className="flex gap-1" aria-hidden>
            {tourSteps.map((_, i) => (
              <span key={i} className={cx('h-1.5 rounded-full transition-all', i === tour.step ? 'w-4 bg-brand-500' : i < tour.step ? 'w-1.5 bg-brand-200' : 'w-1.5 bg-gray-200')} />
            ))}
          </div>
          <div className="flex gap-1.5">
            {tour.step > 0 && (
              <Button size="sm" variant="ghost" icon={<ArrowLeft size={13} />} onClick={onBack}>
                Back
              </Button>
            )}
            <Button size="sm" variant="primary" onClick={onNext} disabled={!canNext && !missing} title={!canNext ? 'Complete the action above to continue' : undefined}>
              Next <ArrowRight size={13} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Welcome + closing                                                   */
/* ------------------------------------------------------------------ */

function EditorialModal({ children, labelledBy }: { children: ReactNode; labelledBy: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus()
  }, [])
  return (
    <div className="no-print fixed inset-0 z-[85] flex items-center justify-center bg-gray-900/45 p-4 anim-fade">
      <div ref={ref} role="dialog" data-tour-dialog aria-modal="true" aria-labelledby={labelledBy} className="anim-pop w-full max-w-[540px] overflow-hidden rounded-xl border border-line bg-white shadow-[0_30px_70px_-20px_rgba(16,24,40,0.45)]">
        {children}
      </div>
    </div>
  )
}

export function WelcomeModal() {
  const { welcomeOpen, dismissWelcome, setTour, tour, navigate } = useApp()
  useEffect(() => {
    if (!welcomeOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissWelcome()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [welcomeOpen, dismissWelcome])
  if (!welcomeOpen) return null
  const start = (step: number) => {
    dismissWelcome()
    setTour({ open: true, step, resumable: false })
  }
  return (
    <EditorialModal labelledBy="welcome-title">
      <div className="relative overflow-hidden border-b border-line bg-[#f6f8fc] px-8 pb-7 pt-8">
        <svg className="absolute -right-8 -top-10 text-brand-100" width="220" height="220" viewBox="0 0 220 220" aria-hidden>
          <circle cx="100" cy="100" r="62" fill="none" stroke="currentColor" strokeWidth="14" />
          <path d="M146 146l52 52" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
        </svg>
        <div className="relative">
          <div className="text-[12px] font-medium text-gray-500">Great Question · Win/Loss</div>
          <h1 id="welcome-title" className="mt-2 font-serif text-[44px] leading-none tracking-[-0.02em] text-gray-900">
            LossLens
          </h1>
          <p className="mt-3 max-w-[400px] font-serif text-[20px] leading-snug text-gray-700">Every lost deal, interviewed automatically. A 3-minute tour.</p>
        </div>
      </div>
      <div className="px-8 py-5">
        <ol className="grid grid-cols-3 gap-3 text-[12px] text-gray-600">
          {[
            ['Trigger', 'Closed Lost in Salesforce'],
            ['Interview', 'AI moderator, 24/7'],
            ['Decide', 'Evidence for revenue & product'],
          ].map(([k, v], i) => (
            <li key={k} className="rounded-ctl border border-line px-3 py-2">
              <div className="text-[11px] font-semibold text-brand-600">0{i + 1}</div>
              <div className="font-medium text-gray-900">{k}</div>
              <div>{v}</div>
            </li>
          ))}
        </ol>
        <div className="mt-5 flex items-center gap-2">
          <Button data-autofocus variant="primary" className="h-9 px-4" onClick={() => start(0)}>
            Start tour <ArrowRight size={14} />
          </Button>
          <Button
            className="h-9 px-4"
            onClick={() => {
              dismissWelcome()
              navigate('win-loss')
            }}
          >
            Explore on my own
          </Button>
          {tour.resumable && tour.step > 0 && (
            <button className="ml-auto text-[12px] font-medium text-brand-600 hover:underline" onClick={() => start(tour.step)}>
              Resume at step {tour.step + 1}
            </button>
          )}
        </div>
      </div>
      <div className="border-t border-line bg-gray-50 px-8 py-2.5 text-[11px] text-gray-500">Concept prototype. Not a Great Question product.</div>
    </EditorialModal>
  )
}

function ClosingModal({ onBack }: { onBack: () => void }) {
  const { setTour, navigate } = useApp()
  const points = [
    { icon: <Zap size={16} />, title: 'Triggered by CRM', body: 'Qualify deals automatically and protect buyer relationships with configurable guardrails.' },
    { icon: <Bot size={16} />, title: 'Run by AI, 24/7', body: 'Conduct neutral, asynchronous interviews without requiring a researcher to coordinate every conversation.' },
    { icon: <Plug size={16} />, title: 'Connected to revenue', body: 'Write findings back to Salesforce and turn interview evidence into product and commercial priorities.' },
  ]
  return (
    <EditorialModal labelledBy="closing-title">
      <div className="px-8 pb-2 pt-7">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-brand-600">
            Step {TOTAL} of {TOTAL}
          </span>
          <button aria-label="Close tour" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700" onClick={() => setTour((t) => ({ ...t, open: false, resumable: false }))}>
            <X size={16} />
          </button>
        </div>
        <h1 id="closing-title" className="mt-2 font-serif text-[30px] leading-[1.15] tracking-[-0.01em] text-gray-900">
          Every lost deal becomes a learning opportunity.
        </h1>
        <div className="mt-4 flex items-center gap-2 text-[13px]">
          <span className="rounded bg-crm-soft px-2 py-1 font-medium text-[#7a5310]">CRM: Price</span>
          <ArrowRight size={14} className="text-gray-400" />
          <span className="rounded bg-brand-50 px-2 py-1 font-medium text-brand-700">Buyers: Missing NetSuite integration</span>
          <ArrowRight size={14} className="text-gray-400" />
          <span className="rounded bg-gray-900 px-2 py-1 font-medium text-white">Ship NetSuite sync</span>
        </div>
      </div>
      <ul className="space-y-3 px-8 py-5">
        {points.map((p) => (
          <li key={p.title} className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ctl bg-brand-50 text-brand-600">{p.icon}</span>
            <div>
              <div className="text-[13px] font-semibold text-gray-900">{p.title}</div>
              <div className="text-[13px] text-gray-600">{p.body}</div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2 border-t border-line px-8 py-4">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={onBack}>
          Back
        </Button>
        <div className="ml-auto flex gap-2">
          <Button className="h-9 px-4" onClick={() => setTour({ open: true, step: 0, resumable: false })}>
            Restart tour
          </Button>
          <Button
            data-autofocus
            variant="primary"
            className="h-9 px-4"
            onClick={() => {
              setTour({ open: false, step: 0, resumable: false })
              navigate('win-loss')
            }}
          >
            Explore freely
          </Button>
        </div>
      </div>
      <div className="border-t border-line bg-gray-50 px-8 py-2.5 text-[11px] text-gray-500">Concept prototype. Not a Great Question product.</div>
    </EditorialModal>
  )
}

export function TourButton() {
  const { tour, welcomeOpen, setWelcomeOpen, askOpen } = useApp()
  if (tour.open || welcomeOpen) return null
  return (
    <button
      onClick={() => setWelcomeOpen(true)}
      className="no-print fixed bottom-5 z-[50] flex h-9 items-center gap-1.5 rounded-full border border-line bg-white pl-3 pr-3.5 text-[13px] font-medium text-gray-800 shadow-[0_6px_20px_-6px_rgba(16,24,40,0.25)] transition-[right,background-color] duration-200 hover:bg-gray-50"
      style={{ right: askOpen ? 440 : 20 }}
    >
      <Compass size={15} className="text-brand-500" />
      Tour
    </button>
  )
}
