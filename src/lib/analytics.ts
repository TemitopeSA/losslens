import { track as vercelTrack } from '@vercel/analytics/react'

/** Custom product events sent to Vercel Web Analytics. Values must be strings, numbers, booleans or null. */
export type EventName =
  | 'tour_started'
  | 'tour_step_viewed'
  | 'tour_skipped'
  | 'tour_completed'
  | 'tour_restarted'
  | 'welcome_explore'
  | 'simulation_started'
  | 'simulation_completed'
  | 'owner_decision'
  | 'ask_ai_opened'
  | 'ask_ai_question'
  | 'citation_opened'
  | 'dashboard_filter_changed'
  | 'share_slack_confirmed'
  | 'reel_created'
  | 'report_exported'
  | 'trigger_saved'
  | 'trigger_paused'
  | 'highlight_created'

export function track(name: EventName, props?: Record<string, string | number | boolean | null>) {
  try {
    vercelTrack(name, props)
  } catch {
    /* analytics must never break the prototype */
  }
}
