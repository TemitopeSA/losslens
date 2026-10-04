import { defaultFilters, type AppState, type Route } from '../state/AppState'
import { seedQuestion, type TourPlacement } from '../data/lossLensData'

export interface TourContext {
  app: AppState
  seek: (t: number) => void
  setPlaying: (p: boolean) => void
}

export interface TourStep {
  id: string
  title: string
  body: string
  kind?: 'spotlight' | 'modal'
  /** Destination view for this step. */
  route?: Route
  /** Prepare the destination (tabs, panels, playback). `dir` is how the step was entered. */
  setup?: (ctx: TourContext, dir: 'forward' | 'back') => void
  /** CSS selector for the spotlight target; may depend on live state. Multiple matches are unioned. */
  target?: (app: AppState) => string
  placement?: (app: AppState) => TourPlacement
  /** When provided, Next is disabled until it returns true. */
  requires?: (app: AppState) => boolean
  /** Contextual guidance shown inside the coach-mark. */
  hint?: (app: AppState) => string | null
}

export const tourSteps: TourStep[] = [
  {
    id: 'triggers',
    title: 'Start with the deals that matter',
    body: 'It starts in Salesforce. Choose which lost opportunities qualify for an interview, so research focuses on deals worth learning from.',
    route: 'salesforce',
    setup: ({ app }) => {
      app.setSfTab('triggers')
      app.setAskOpen(false)
    },
    target: () => '[data-tour="sf-triggers"]',
    placement: () => 'right',
  },
  {
    id: 'guardrails',
    title: 'Sales stays in control',
    body: 'Deal owners get a heads-up and can veto an invitation. Contact-frequency limits, opt-outs, and incentive caps protect buyer relationships.',
    route: 'salesforce',
    setup: ({ app }) => {
      app.setSfTab('triggers')
      app.setAskOpen(false)
    },
    target: () => '[data-tour="sf-guardrails"]',
    placement: () => 'left',
  },
  {
    id: 'concealed',
    title: 'Make honest feedback easier',
    body: "A neutral moderator helps buyers speak candidly. Concealed identity hides Ledgerly's branding from the participant.",
    route: 'study',
    setup: ({ app }) => app.setAskOpen(false),
    target: () => '[data-tour="study-settings"]',
    placement: () => 'left',
  },
  {
    id: 'simulate',
    title: 'Watch the workflow run',
    body: 'From CRM event to invitation, interview, and write-back, LossLens turns a closed-lost opportunity into a repeatable research workflow.',
    route: 'deal',
    setup: ({ app }, dir) => {
      app.setAskOpen(false)
      if (dir === 'forward') app.simReset()
    },
    target: (app) => (app.sim.status === 'idle' ? '[data-tour="simulate-btn"]' : '[data-tour="timeline"]'),
    placement: (app) => (app.sim.status === 'idle' ? 'bottom' : 'right'),
    requires: (app) => app.sim.status === 'complete',
    hint: (app) => {
      switch (app.sim.status) {
        case 'idle':
          return 'Click “Simulate a lost deal” to continue.'
        case 'playing':
          return app.sim.frame === 2 && app.sim.decision === null
            ? 'Jordan has 24 hours to veto. Try “Hold” or “Let it run” — or wait.'
            : `Running… event ${Math.min(5, [0, 1, 2, 3, 4, 4, 5][app.sim.frame])} of 5`
        case 'paused':
          return 'Paused — press Resume to finish the workflow.'
        case 'held':
          return 'Jordan held the invite, so no email is sent. Click “Undo hold — let it run” to continue.'
        case 'complete':
          return 'Workflow complete. Salesforce now holds the buyer’s real reason.'
      }
    },
  },
  {
    id: 'evidence',
    title: 'Go beyond “it was price”',
    body: 'The buyer says price, but the AI moderator probes what happened next. The real issue emerges: a missing native NetSuite integration and the implementation work it creates.',
    route: 'interview',
    setup: ({ app, seek, setPlaying }) => {
      app.setAskOpen(false)
      seek(348)
      setPlaying(false)
    },
    target: () => '[data-tour="key-exchange"]',
    placement: () => 'left',
    hint: () => 'Click any line to jump the recording to that moment.',
  },
  {
    id: 'writeback',
    title: 'Put the learning back where teams work',
    body: 'The evidence-backed loss reason is written back to Salesforce, turning interview research into structured revenue intelligence.',
    route: 'deal',
    setup: ({ app }) => {
      app.setAskOpen(false)
      if (app.sim.status !== 'complete') app.simComplete()
    },
    target: () => '[data-tour="writeback-event"]',
    placement: () => 'right',
  },
  {
    id: 'gap',
    title: 'See the gap between perception and reality',
    body: 'Sales logged Price on 46% of losses. Buyers named it as the primary reason in just 12%. Missing integration tells a very different story.',
    route: 'win-loss',
    setup: ({ app }) => {
      app.setAskOpen(false)
      app.setFilters(defaultFilters)
    },
    target: () => '[data-tour="chart-gap"]',
    placement: () => 'right',
  },
  {
    id: 'ask',
    title: 'Turn evidence into a decision',
    body: 'Ask AI connects research findings to the questions leaders need answered. Through Great Question MCP, compatible AI tools can access cited research instead of relying on guesswork.',
    route: 'win-loss',
    setup: ({ app }) => {
      app.setAskOpen(true)
      const last = [...app.messages].reverse().find((m) => m.role === 'assistant')
      if (!last || last.question !== seedQuestion) app.ask(seedQuestion)
    },
    target: () => '[data-tour="askai-answer"]',
    placement: () => 'left',
    hint: (app) => (app.streaming ? 'Searching 17 interviews…' : 'Citations are live — click one to open the evidence.'),
  },
  {
    id: 'closing',
    kind: 'modal',
    title: 'Every lost deal becomes a learning opportunity.',
    body: '',
    route: 'win-loss',
    setup: ({ app }) => app.setAskOpen(false),
  },
]
