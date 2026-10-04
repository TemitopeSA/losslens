import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  acmeDeal,
  alwaysOnStudy,
  citations,
  defaultConditions,
  fallbackAnswer,
  scriptedAnswers,
  type ScriptedAnswer,
  type TriggerCondition,
} from '../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Routing                                                             */
/* ------------------------------------------------------------------ */

export type Route =
  | 'win-loss'
  | 'win-loss/deals'
  | 'deal'
  | 'studies'
  | 'study'
  | 'repository'
  | 'interview'
  | 'candidates'
  | 'incentives'
  | 'analytics'
  | 'settings'
  | 'salesforce'

const routeToHash: Record<Route, string> = {
  'win-loss': '#/win-loss',
  'win-loss/deals': '#/win-loss/deals',
  deal: '#/win-loss/deals/acme-freight',
  studies: '#/studies',
  study: '#/studies/win-loss-always-on',
  repository: '#/repository',
  interview: '#/repository/acme-freight',
  candidates: '#/candidates',
  incentives: '#/incentives',
  analytics: '#/analytics',
  settings: '#/settings/integrations',
  salesforce: '#/settings/integrations/salesforce',
}

function hashToRoute(hash: string): Route {
  const found = (Object.entries(routeToHash) as [Route, string][]).find(([, h]) => h === hash)
  return found ? found[0] : 'win-loss'
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SfTab = 'overview' | 'mapping' | 'triggers'
export type SimStatus = 'idle' | 'playing' | 'paused' | 'held' | 'complete'
export type Decision = null | 'approved' | 'auto' | 'held'
export type ModalKind = 'share' | 'reel' | 'export' | 'clip'

export interface Toast {
  id: number
  text: string
  tone?: 'success' | 'info'
}

export interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  question: string
  answer?: ScriptedAnswer
  revealed: number // words revealed so far (assistant only)
  total: number
}

export interface TriggerConfig {
  conditions: TriggerCondition[]
  invitee: string
  waitDays: number
  study: string
  incentive: number
  guardrails: { slackVeto: boolean; frequency: boolean; unsubscribes: boolean; cap: boolean }
  monthlyCap: number
  writeback: boolean
  active: boolean
}

export interface StudyConfig {
  goal: string
  guide: string[]
  flexibility: number
  concealed: boolean
  screenShare: boolean
  length: number
  language: string
}

export interface Filters {
  segment: string
  size: string
  competitor: string
  owner: string
  range: string
}

export const defaultFilters: Filters = {
  segment: 'All segments',
  size: 'Any deal size',
  competitor: 'All competitors',
  owner: 'All owners',
  range: 'Last 90 days',
}

/* Timeline frames: 0 empty · 1 closed · 2 slack · 3 email · 4 booked · 5 completed · 6 write-back */
export const SIM_LAST_FRAME = 6
const FRAME_MS = 1500
const VETO_WINDOW_MS = 3200

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export const countWords = (a: ScriptedAnswer) =>
  a.blocks.reduce((n, b) => n + b.runs.reduce((m, r) => m + ('cite' in r ? 1 : r.text.split(/(\s+)/).filter(Boolean).length), 0), 0)

function pickAnswer(q: string): ScriptedAnswer {
  const lower = q.toLowerCase()
  const exact = scriptedAnswers.find((a) => a.question.toLowerCase() === lower)
  if (exact) return exact
  const hit = scriptedAnswers.find((a) => a.match.some((m) => lower.includes(m)))
  return hit ?? fallbackAnswer(q)
}

const safeStorage = {
  get(key: string) {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, v: string) {
    try {
      window.localStorage.setItem(key, v)
    } catch {
      /* storage unavailable */
    }
  },
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

function useAppStateValue() {
  /* routing */
  const [route, setRoute] = useState<Route>(() => hashToRoute(window.location.hash))
  const navigate = useCallback((r: Route) => {
    setRoute(r)
    if (window.location.hash !== routeToHash[r]) window.history.pushState(null, '', routeToHash[r])
    document.getElementById('main-scroll')?.scrollTo({ top: 0 })
  }, [])
  useEffect(() => {
    const onPop = () => setRoute(hashToRoute(window.location.hash))
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [])

  const [sfTab, setSfTab] = useState<SfTab>('triggers')

  /* toasts */
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)
  const toast = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  /* trigger configuration */
  const [trigger, setTrigger] = useState<TriggerConfig>({
    conditions: defaultConditions,
    invitee: 'Primary Contact on the Opportunity',
    waitDays: 3,
    study: alwaysOnStudy.title,
    incentive: 75,
    guardrails: { slackVeto: true, frequency: true, unsubscribes: true, cap: true },
    monthlyCap: 2000,
    writeback: true,
    active: true,
  })
  const [triggerSaved, setTriggerSaved] = useState<TriggerConfig>(trigger)

  /* study */
  const [study, setStudy] = useState<StudyConfig>({
    goal: alwaysOnStudy.goal,
    guide: alwaysOnStudy.guide,
    flexibility: 2,
    concealed: true,
    screenShare: false,
    length: alwaysOnStudy.lengthMinutes,
    language: alwaysOnStudy.language,
  })

  /* dashboard filters */
  const [filters, setFilters] = useState<Filters>(defaultFilters)

  /* ------------------ deal simulation ------------------ */
  const [sim, setSim] = useState<{ frame: number; status: SimStatus; decision: Decision }>({
    frame: SIM_LAST_FRAME,
    status: 'complete',
    decision: 'auto',
  })

  useEffect(() => {
    if (sim.status !== 'playing') return
    if (sim.frame >= SIM_LAST_FRAME) {
      setSim((s) => ({ ...s, status: 'complete' }))
      return
    }
    // Event 2 waits for the deal owner (or the veto window) before continuing.
    const waiting = sim.frame === 2 && sim.decision === null
    const delay = sim.frame === 0 ? 350 : waiting ? VETO_WINDOW_MS : FRAME_MS
    const id = window.setTimeout(() => {
      setSim((s) => {
        if (s.status !== 'playing') return s
        const decision = s.frame === 2 && s.decision === null ? 'auto' : s.decision
        const frame = s.frame + 1
        return { frame, decision, status: frame >= SIM_LAST_FRAME ? 'complete' : 'playing' }
      })
    }, delay)
    return () => window.clearTimeout(id)
  }, [sim.status, sim.frame, sim.decision])

  const simStart = useCallback(() => setSim({ frame: 0, status: 'playing', decision: null }), [])
  const simReset = useCallback(() => setSim({ frame: 0, status: 'idle', decision: null }), [])
  const simComplete = useCallback(() => setSim({ frame: SIM_LAST_FRAME, status: 'complete', decision: 'auto' }), [])
  const simPause = useCallback(() => setSim((s) => (s.status === 'playing' ? { ...s, status: 'paused' } : s)), [])
  const simResume = useCallback(() => setSim((s) => (s.status === 'paused' ? { ...s, status: 'playing' } : s)), [])
  const simDecide = useCallback(
    (d: 'approved' | 'held') => {
      setSim((s) => {
        if (d === 'held') return { ...s, decision: 'held', status: 'held' }
        // Approve: skip the remaining veto window and continue.
        const frame = s.frame <= 2 ? 3 : s.frame
        return { frame, decision: 'approved', status: frame >= SIM_LAST_FRAME ? 'complete' : 'playing' }
      })
      toast(d === 'held' ? 'Invitation held — Dana Okafor will not be contacted (simulated)' : 'Approved — invitation will send on schedule (simulated)', 'info')
    },
    [toast],
  )

  /* ------------------ Ask AI ------------------ */
  const [askOpen, setAskOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const msgId = useRef(0)
  const streaming = messages.some((m) => m.role === 'assistant' && m.revealed < m.total)

  const ask = useCallback((q: string) => {
    const question = q.trim()
    if (!question) return
    const answer = pickAnswer(question)
    const total = countWords(answer)
    setMessages((m) => [
      ...m,
      { id: ++msgId.current, role: 'user', question, revealed: 0, total: 0 },
      { id: ++msgId.current, role: 'assistant', question, answer, revealed: 0, total },
    ])
  }, [])

  useEffect(() => {
    if (!streaming) return
    const id = window.setInterval(() => {
      setMessages((ms) => ms.map((m) => (m.role === 'assistant' && m.revealed < m.total ? { ...m, revealed: Math.min(m.total, m.revealed + 3) } : m)))
    }, 45)
    return () => window.clearInterval(id)
  }, [streaming])

  /* ------------------ modals & repository ------------------ */
  const [modal, setModal] = useState<{ kind: ModalKind; payload?: string } | null>(null)
  const [reels, setReels] = useState<{ id: number; title: string; clips: number }[]>([])
  const [userHighlights, setUserHighlights] = useState<{ id: number; t: number; text: string }[]>([])

  /* ------------------ tour ------------------ */
  const [welcomeOpen, setWelcomeOpen] = useState(() => safeStorage.get('losslens.welcomed') !== '1')
  const [tour, setTour] = useState<{ open: boolean; step: number; resumable: boolean }>({ open: false, step: 0, resumable: false })
  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false)
    safeStorage.set('losslens.welcomed', '1')
  }, [])

  return {
    route,
    navigate,
    sfTab,
    setSfTab,
    toasts,
    toast,
    trigger,
    setTrigger,
    triggerSaved,
    setTriggerSaved,
    study,
    setStudy,
    filters,
    setFilters,
    sim,
    simStart,
    simReset,
    simComplete,
    simPause,
    simResume,
    simDecide,
    askOpen,
    setAskOpen,
    messages,
    ask,
    streaming,
    modal,
    setModal,
    reels,
    setReels,
    userHighlights,
    setUserHighlights,
    welcomeOpen,
    setWelcomeOpen,
    dismissWelcome,
    tour,
    setTour,
  }
}

export type AppState = ReturnType<typeof useAppStateValue>
const AppCtx = createContext<AppState | null>(null)

/* ------------------------------------------------------------------ */
/* Interview playback (separate context so ticks don't re-render all)  */
/* ------------------------------------------------------------------ */

interface PlaybackState {
  time: number
  playing: boolean
  setPlaying: (p: boolean) => void
  seek: (t: number) => void
}
const PlaybackCtx = createContext<PlaybackState | null>(null)

function PlaybackProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      setTime((t) => {
        if (t + 0.25 >= acmeDeal.duration) {
          setPlaying(false)
          return acmeDeal.duration
        }
        return t + 0.25
      })
    }, 250)
    return () => window.clearInterval(id)
  }, [playing])
  const seek = useCallback((t: number) => setTime(Math.max(0, Math.min(acmeDeal.duration, t))), [])
  const value = useMemo(() => ({ time, playing, setPlaying, seek }), [time, playing, seek])
  return <PlaybackCtx.Provider value={value}>{children}</PlaybackCtx.Provider>
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const value = useAppStateValue()
  return (
    <AppCtx.Provider value={value}>
      <PlaybackProvider>{children}</PlaybackProvider>
    </AppCtx.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp outside provider')
  return ctx
}

export function usePlayback() {
  const ctx = useContext(PlaybackCtx)
  if (!ctx) throw new Error('usePlayback outside provider')
  return ctx
}

/** Open a piece of evidence: Acme Freight jumps into the interview; others open a clip preview. */
export function useOpenCitation() {
  const { navigate, setModal, setAskOpen, tour } = useApp()
  const { seek, setPlaying } = usePlayback()
  return useCallback(
    (citationId: string, opts?: { keepPanel?: boolean }) => {
      const c = citations[citationId]
      if (!c) return
      if (c.interviewId === acmeDeal.id) {
        navigate('interview')
        seek(c.t)
        setPlaying(false)
        if (!opts?.keepPanel && !tour.open) setAskOpen(false)
      } else {
        setModal({ kind: 'clip', payload: citationId })
      }
    },
    [navigate, seek, setPlaying, setModal, setAskOpen, tour.open],
  )
}
