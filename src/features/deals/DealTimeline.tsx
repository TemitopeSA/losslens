import { useEffect, useRef, type ReactNode } from 'react'
import { ArrowRight, CalendarCheck, CircleCheck, Cloud, ExternalLink, Hand, Mail, MessageSquare, Pause, Play, RotateCcw, Undo2 } from 'lucide-react'
import { useApp, SIM_LAST_FRAME } from '../../state/AppState'
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, cx } from '../../components/ui'
import { acmeDeal, fmtMoney } from '../../data/lossLensData'

type EventKey = 'closed' | 'slack' | 'email' | 'interview' | 'writeback'
const EVENTS: { key: EventKey; frame: number }[] = [
  { key: 'closed', frame: 1 },
  { key: 'slack', frame: 2 },
  { key: 'email', frame: 3 },
  { key: 'interview', frame: 4 },
  { key: 'writeback', frame: 6 },
]

export function dealStatus(frame: number, status: string) {
  if (status === 'held') return { label: 'Held by owner', tone: 'amber' as const }
  if (status === 'idle' || frame === 0) return { label: 'Awaiting trigger', tone: 'gray' as const }
  if (frame === 1) return { label: 'Qualified', tone: 'blue' as const }
  if (frame === 2) return { label: 'Awaiting owner', tone: 'amber' as const }
  if (frame === 3) return { label: 'Invited', tone: 'blue' as const }
  if (frame === 4) return { label: 'Interview booked', tone: 'blue' as const }
  return { label: 'Interview completed', tone: 'green' as const }
}

export function DealTimelinePage() {
  const { navigate, sim, simStart, simPause, simResume, simReset, simDecide, toast } = useApp()
  const { frame, status, decision } = sim
  const listRef = useRef<HTMLOListElement>(null)
  const st = dealStatus(frame, status)
  const visible = EVENTS.filter((e) => frame >= e.frame && !(status === 'held' && e.frame > 2))
  const shownCount = visible.length
  const complete = status === 'complete'
  const running = status === 'playing' || status === 'paused'

  // Keep the newest event in view while playing.
  useEffect(() => {
    if (status !== 'playing') return
    const el = listRef.current?.querySelector('[data-latest="true"]')
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [frame, status])

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Win/Loss', onClick: () => navigate('win-loss') }, { label: 'Lost deals', onClick: () => navigate('win-loss/deals') }, { label: acmeDeal.account }]}
        title={acmeDeal.account}
        meta={
          <span className="flex items-center gap-2">
            <span className="text-[15px] font-semibold text-gray-700 tabular">{fmtMoney(acmeDeal.amount)}</span>
            <Badge tone="red">Closed Lost</Badge>
            <Badge tone={st.tone} dot>
              {st.label}
            </Badge>
          </span>
        }
        actions={
          <>
            <Button icon={<ExternalLink size={14} />} onClick={() => toast('Opening Salesforce is simulated in this prototype', 'info')}>
              Open in Salesforce
            </Button>
            <Button variant="primary" onClick={() => navigate('interview')} disabled={!complete}>
              View interview
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,680px)_minmax(260px,1fr)] items-start gap-5 px-8 py-6">
        <Card data-tour="timeline">
          <CardHeader
            title="Automation activity"
            subtitle={
              status === 'idle'
                ? 'Replay what LossLens does when this opportunity closes lost.'
                : status === 'held'
                  ? 'Stopped — the deal owner held the invitation.'
                  : complete
                    ? 'All 5 events complete.'
                    : `Event ${shownCount} of 5${status === 'paused' ? ' · paused' : ''}`
            }
            actions={
              <>
                {running && (
                  <Button size="sm" icon={status === 'playing' ? <Pause size={13} /> : <Play size={13} />} onClick={status === 'playing' ? simPause : simResume}>
                    {status === 'playing' ? 'Pause' : 'Resume'}
                  </Button>
                )}
                {(running || status === 'held') && (
                  <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={simReset}>
                    Reset
                  </Button>
                )}
                <Button
                  data-tour="simulate-btn"
                  variant="primary"
                  size="sm"
                  icon={complete ? <RotateCcw size={13} /> : <Play size={13} />}
                  onClick={simStart}
                  className={cx(status === 'idle' && 'anim-pulse')}
                  disabled={status === 'playing'}
                >
                  {complete ? 'Replay simulation' : 'Simulate a lost deal'}
                </Button>
              </>
            }
          />
          <div className="h-1 bg-gray-100" aria-hidden>
            <div className="h-full bg-brand-500 transition-all duration-500 ease-out" style={{ width: `${(frame / SIM_LAST_FRAME) * 100}%` }} />
          </div>

          {status === 'idle' && frame === 0 && (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-500">
                <Cloud size={18} />
              </span>
              <div className="mt-3 text-[14px] font-medium text-gray-900">Waiting for Salesforce</div>
              <p className="mt-1 max-w-[380px] text-[13px] text-gray-500">
                Click <strong className="font-medium text-gray-800">Simulate a lost deal</strong> to watch Acme Freight move from Closed Lost to an evidence-backed loss reason. Nothing is sent.
              </p>
            </div>
          )}

          <ol ref={listRef} className="relative px-5 py-4" aria-live="polite">
            {visible.map((e, i) => {
              const latest = i === visible.length - 1 && !complete
              return (
                <li
                  key={e.key}
                  data-latest={latest}
                  data-tour={e.key === 'writeback' ? 'writeback-event' : latest ? 'timeline-active' : undefined}
                  className="anim-rise relative flex gap-3.5 pb-5 last:pb-1"
                >
                  {i < visible.length - 1 && <span className="absolute left-[13px] top-8 bottom-0 w-px bg-line" aria-hidden />}
                  <EventBody k={e.key} frame={frame} decision={decision} status={status} latest={latest} onDecide={simDecide} />
                </li>
              )
            })}
            {status === 'held' && (
              <li className="anim-rise ml-[42px] rounded-ctl border border-amber-200 bg-amber-50 px-4 py-3">
                <div className="flex items-center gap-2 text-[13px] font-medium text-amber-900">
                  <Hand size={14} /> Invitation held by Jordan Lee
                </div>
                <p className="mt-1 text-[12px] text-amber-800">Dana Okafor will not be contacted. The opportunity stays in Salesforce with its CRM loss reason only.</p>
                <Button size="sm" className="mt-2.5" icon={<Undo2 size={13} />} onClick={() => simDecide('approved')}>
                  Undo hold — let it run
                </Button>
              </li>
            )}
          </ol>
        </Card>

        <div className="space-y-5">
          <DealSummary />
          <Card className={cx('transition-opacity duration-300', !complete && 'opacity-60')}>
            <CardHeader title="What the CRM says vs. what the buyer said" />
            <div className="space-y-3 p-4">
              <div className="rounded-ctl border border-line bg-crm-soft/50 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-crm">Sales recorded</div>
                <div className="mt-0.5 text-[15px] font-semibold text-gray-900">Price</div>
                <div className="text-[12px] text-gray-500">Loss_Reason__c · entered by Jordan Lee</div>
              </div>
              <div className="flex justify-center text-gray-400" aria-hidden>
                <ArrowRight size={14} className="rotate-90" />
              </div>
              <div className={cx('rounded-ctl border px-3 py-2.5', complete ? 'border-brand-200 bg-brand-50' : 'border-dashed border-line')}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Buyer evidence</div>
                <div className="mt-0.5 text-[15px] font-semibold text-gray-900">{complete ? acmeDeal.actualReason : 'Awaiting interview…'}</div>
                {complete && (
                  <button className="text-[12px] font-medium text-brand-600 hover:underline" onClick={() => navigate('interview')}>
                    Dana Okafor, VP Finance · 06:24 →
                  </button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  )
}

function DealSummary() {
  const { sim } = useApp()
  const st = dealStatus(sim.frame, sim.status)
  const done = sim.status === 'complete'
  const rows: [string, ReactNode][] = [
    ['Opportunity', <span key="v" className="font-mono text-[12px]">{acmeDeal.opportunityId}</span>],
    ['Amount', fmtMoney(acmeDeal.amount)],
    ['Stage', 'Closed Lost'],
    ['CRM loss reason', <Badge key="v" tone="amber">Price</Badge>],
    ['Owner', acmeDeal.owner],
    ['Primary contact', `${acmeDeal.participant} · ${acmeDeal.participantRole}`],
    ['Source', 'Salesforce'],
    ['Competitor', done ? acmeDeal.competitor : '—'],
    ['Status', <Badge key="v" tone={st.tone} dot>{st.label}</Badge>],
  ]
  return (
    <Card>
      <CardHeader title="Deal summary" />
      <dl className="divide-y divide-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-4 py-2 text-[13px]">
            <dt className="text-gray-500">{k}</dt>
            <dd className="text-right text-gray-900 tabular">{v}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

function EventShell({ icon, iconClass, title, time, children, latest }: { icon: ReactNode; iconClass: string; title: ReactNode; time: string; children?: ReactNode; latest?: boolean }) {
  return (
    <>
      <span className={cx('relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-4 ring-white', iconClass, latest && 'anim-pulse')}>{icon}</span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[13px] font-medium text-gray-900">{title}</div>
          <time className="shrink-0 text-[11px] text-gray-500 tabular">{time}</time>
        </div>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </>
  )
}

function EventBody({
  k,
  frame,
  decision,
  status,
  latest,
  onDecide,
}: {
  k: EventKey
  frame: number
  decision: string | null
  status: string
  latest: boolean
  onDecide: (d: 'approved' | 'held') => void
}) {
  const { navigate } = useApp()
  switch (k) {
    case 'closed':
      return (
        <EventShell latest={latest} icon={<Cloud size={14} />} iconClass="bg-[#e5f6fd] text-[#0b7cb0]" title="Salesforce opportunity closed" time="Sep 12 · 5:41 PM">
          <div className="rounded-ctl border border-line bg-gray-50/60 px-3 py-2 text-[13px] text-gray-800">
            Acme Freight · $84,000 · Closed Lost · Loss reason: <span className="font-medium">Price</span>
            <div className="mt-0.5 text-[12px] text-gray-500">Owner: Jordan Lee · Matches 3 trigger conditions</div>
          </div>
        </EventShell>
      )
    case 'slack': {
      const waiting = frame === 2 && decision === null && status === 'playing'
      return (
        <EventShell latest={latest} icon={<MessageSquare size={14} />} iconClass="bg-[#f4ecf7] text-[#611f69]" title="Deal owner notified in Slack" time="Sep 12 · 5:42 PM">
          <div className="overflow-hidden rounded-ctl border border-line bg-white">
            <div className="flex items-center gap-1.5 border-b border-line bg-gray-50 px-3 py-1.5 text-[12px] font-semibold text-gray-700">
              # deal-desk <span className="ml-auto font-normal text-gray-400">Slack preview · simulated</span>
            </div>
            <div className="flex gap-2.5 px-3 py-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-500 text-[11px] font-bold text-white">GQ</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px]">
                  <span className="font-bold text-gray-900">Great Question</span> <span className="rounded bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">APP</span>
                </div>
                <p className="mt-0.5 text-[13px] text-gray-800">
                  <span className="rounded bg-brand-50 px-0.5 text-brand-700">@Jordan</span> Great Question will invite Dana Okafor (VP Finance) to a win/loss interview in 3 days.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    disabled={!waiting && status !== 'held'}
                    onClick={() => onDecide('held')}
                    className={cx(
                      'h-7 rounded border px-3 text-[12px] font-semibold transition-colors',
                      decision === 'held' ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50 disabled:opacity-50',
                    )}
                  >
                    Hold
                  </button>
                  <button
                    disabled={!waiting && status !== 'held'}
                    onClick={() => onDecide('approved')}
                    className={cx(
                      'h-7 rounded border px-3 text-[12px] font-semibold transition-colors',
                      decision === 'approved' ? 'border-[#007a5a] bg-[#007a5a] text-white' : 'border-[#007a5a] bg-[#007a5a] text-white hover:bg-[#006a4e] disabled:opacity-50',
                    )}
                  >
                    Let it run
                  </button>
                  <span className="text-[11px] text-gray-500">
                    {waiting && 'Veto window: 24h'}
                    {decision === 'approved' && '✓ Jordan chose Let it run'}
                    {decision === 'auto' && 'No hold within 24h — invite scheduled'}
                    {decision === 'held' && 'Jordan held this invitation'}
                  </span>
                </div>
                {waiting && (
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-100" aria-hidden>
                    <div className="h-full origin-left rounded-full bg-[#611f69]/60" style={{ animation: 'veto 3.2s linear forwards' }} />
                    <style>{'@keyframes veto{from{width:100%}to{width:0%}}'}</style>
                  </div>
                )}
              </div>
            </div>
          </div>
        </EventShell>
      )
    }
    case 'email':
      return (
        <EventShell latest={latest} icon={<Mail size={14} />} iconClass="bg-brand-50 text-brand-600" title="Invitation sent to Dana Okafor" time="Sep 15 · 9:00 AM">
          <div className="overflow-hidden rounded-ctl border border-line bg-white">
            <div className="space-y-0.5 border-b border-line bg-gray-50/70 px-3 py-2 text-[12px]">
              <div>
                <span className="text-gray-500">From</span> <span className="text-gray-800">Research Team &lt;invites@research-interviews.io&gt;</span>
              </div>
              <div>
                <span className="text-gray-500">To</span> <span className="text-gray-800">Dana Okafor</span>
              </div>
              <div className="pt-0.5 text-[13px] font-semibold text-gray-900">Share 15 minutes of feedback on a recent software decision — $75 thank-you</div>
            </div>
            <div className="space-y-2 px-3 py-3 text-[13px] leading-relaxed text-gray-700">
              <p>Hi Dana,</p>
              <p>
                You recently evaluated spend-management software. We’re speaking with finance leaders about how those decisions get made. It’s a 15-minute conversation with an AI moderator that you can take any time, and we’ll send a <strong className="font-medium text-gray-900">$75 gift card</strong> as a thank-you.
              </p>
              <p className="text-[12px] text-gray-500">Responses are confidential. Participation has no effect on any vendor relationship.</p>
              <span className="inline-flex h-8 items-center rounded-ctl bg-gray-900 px-3 text-[12px] font-medium text-white">Start the interview</span>
            </div>
            <div className="border-t border-line px-3 py-1.5 text-[11px] text-gray-400">Email preview · not sent · no Ledgerly branding · Unsubscribe link included</div>
          </div>
        </EventShell>
      )
    case 'interview': {
      const done = frame >= 5
      return (
        <EventShell
          latest={latest}
          icon={done ? <CircleCheck size={14} /> : <CalendarCheck size={14} />}
          iconClass={done ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-600'}
          title={
            <span key={done ? 'done' : 'booked'} className="anim-fade inline-block">
              {done ? 'Interview completed · 14m 32s' : 'Dana booked: AI interview, any time'}
            </span>
          }
          time={done ? 'Sep 16 · 4:01 PM' : 'Sep 15 · 2:14 PM'}
        >
          <div className="flex items-center gap-2.5 rounded-ctl border border-line px-3 py-2">
            <Avatar initials="DO" tone="violet" size={26} />
            <div className="min-w-0 flex-1 text-[12px]">
              <div className="font-medium text-gray-900">Dana Okafor · VP Finance</div>
              <div className="text-gray-500">{done ? 'AI moderated interview · concealed identity · $75 incentive sent' : 'Self-scheduled · AI moderator available 24/7'}</div>
            </div>
            {done && (
              <Button size="sm" variant="ghost" onClick={() => navigate('interview')}>
                Watch
              </Button>
            )}
          </div>
        </EventShell>
      )
    }
    case 'writeback':
      return (
        <EventShell latest={latest} icon={<Cloud size={14} />} iconClass="bg-[#e5f6fd] text-[#0b7cb0]" title="Salesforce updated" time="Sep 16 · 4:12 PM">
          <div className="overflow-hidden rounded-ctl border border-line">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-500">
                  <th className="px-3 py-1.5 font-medium">Field</th>
                  <th className="px-3 py-1.5 font-medium">Before</th>
                  <th className="px-3 py-1.5 font-medium">After</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-700">Interview_Status__c</td>
                  <td className="px-3 py-2 text-gray-500">Invited</td>
                  <td className="px-3 py-2">
                    <Badge tone="green">Completed</Badge>
                  </td>
                </tr>
                <tr className="bg-brand-50/40">
                  <td className="px-3 py-2 font-mono text-gray-700">GQ_Primary_Loss_Reason__c</td>
                  <td className="px-3 py-2 text-gray-400">—</td>
                  <td className="px-3 py-2 font-semibold text-brand-700">Missing NetSuite integration</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-gray-500">Loss_Reason__c</td>
                  <td className="px-3 py-2 text-gray-500">Price</td>
                  <td className="px-3 py-2 text-gray-500">Price (unchanged, sales-entered)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-1.5 text-[11px] text-gray-500">Salesforce updated: GQ_Primary_Loss_Reason__c = Missing NetSuite integration · simulated write</div>
        </EventShell>
      )
  }
}
