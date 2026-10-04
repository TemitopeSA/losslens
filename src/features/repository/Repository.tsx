import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronRight, EyeOff, Film, Highlighter, Pause, Play, Quote, SkipBack, SkipForward, Sparkles, Tag } from 'lucide-react'
import { useApp, useOpenCitation, usePlayback } from '../../state/AppState'
import { Avatar, Badge, Button, Card, CardHeader, IconButton, PageHeader, Tabs, cx } from '../../components/ui'
import { acmeDeal, acmeHighlights, acmeSummary, citations, fmtTime, insights, repositoryInterviews, transcript } from '../../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Repository index                                                    */
/* ------------------------------------------------------------------ */

export function RepositoryPage() {
  const { navigate, reels, setModal, userHighlights } = useApp()
  const { seek } = usePlayback()
  const [tab, setTab] = useState<'interviews' | 'highlights' | 'reels' | 'insights'>('interviews')
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <>
      <PageHeader title="Repository">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'interviews', label: 'Interviews', count: repositoryInterviews.length },
            { id: 'highlights', label: 'Highlights', count: acmeHighlights.length + userHighlights.length },
            { id: 'reels', label: 'Reels', count: 2 + reels.length },
            { id: 'insights', label: 'Insights', count: insights.length },
          ]}
        />
      </PageHeader>
      <div className="px-8 py-6">
        {tab === 'interviews' && (
          <Card>
            <ul className="divide-y divide-line">
              {repositoryInterviews.map((r) => {
                const isAcme = r.id === acmeDeal.id
                const open = expanded === r.id
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => (isAcme ? navigate('interview') : setExpanded(open ? null : r.id))}
                      aria-expanded={isAcme ? undefined : open}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded bg-gray-900 text-white/80" aria-hidden>
                        <Play size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] font-medium text-gray-900">{r.title}</span>
                        <span className="block text-[12px] text-gray-500">
                          {r.participant} · {r.study} · {r.date} · {r.duration}
                        </span>
                      </span>
                      <span className="hidden gap-1.5 xl:flex">
                        {r.tags.map((t) => (
                          <Badge key={t} tone={t.startsWith('Integration') ? 'blue' : 'gray'}>
                            {t}
                          </Badge>
                        ))}
                      </span>
                      <span className="w-[86px] text-right text-[12px] text-gray-500">{r.highlights} highlights</span>
                      {isAcme ? <ChevronRight size={15} className="text-gray-400" /> : <ChevronDown size={15} className={cx('text-gray-400 transition-transform', open && 'rotate-180')} />}
                    </button>
                    {open && (
                      <div className="anim-fade border-t border-line bg-gray-50/60 px-4 py-3 pl-[88px]">
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                          <Sparkles size={12} className="text-brand-500" /> AI summary
                        </div>
                        <p className="mt-1 max-w-[720px] text-[13px] text-gray-700">{r.summary}</p>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        )}
        {tab === 'highlights' && (
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
            {[...acmeHighlights.map((h) => ({ id: h.id, label: h.label, t: h.t, quote: h.quote })), ...userHighlights.map((h) => ({ id: `u${h.id}`, label: 'Your highlight', t: h.t, quote: h.text }))].map((h) => (
              <Card key={h.id} className="p-4">
                <Badge tone={h.label.startsWith('Price') ? 'amber' : 'blue'}>{h.label}</Badge>
                <p className="mt-2 text-[13px] text-gray-800">“{h.quote}”</p>
                <button
                  className="mt-2 text-[12px] font-medium text-brand-600 hover:underline"
                  onClick={() => {
                    seek(h.t)
                    navigate('interview')
                  }}
                >
                  Acme Freight · {fmtTime(h.t)} →
                </button>
              </Card>
            ))}
          </div>
        )}
        {tab === 'reels' && (
          <Card>
            <ul className="divide-y divide-line">
              {[
                ...reels.map((r) => ({ title: r.title, meta: `${r.clips} clips · created just now`, isNew: true })),
                { title: 'Why finance teams choose Spendwise', meta: '5 clips · 2m 14s · Sep 18', isNew: false },
                { title: 'Approvals usability — top friction moments', meta: '7 clips · 3m 40s · Sep 9', isNew: false },
              ].map((r) => (
                <li key={r.title} className="flex items-center gap-3 px-4 py-3">
                  <Film size={16} className="text-gray-400" />
                  <div className="flex-1">
                    <div className="text-[13px] font-medium text-gray-900">{r.title}</div>
                    <div className="text-[12px] text-gray-500">{r.meta}</div>
                  </div>
                  {r.isNew && <Badge tone="green">New</Badge>}
                  <Button size="sm" onClick={() => setModal({ kind: 'clip', payload: 'acme-0624' })}>
                    Play
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {tab === 'insights' && (
          <div className="grid grid-cols-2 gap-4">
            {insights.map((i) => (
              <Card key={i.id} className="p-4">
                <div className="text-[13px] font-semibold text-gray-900">{i.headline}</div>
                <p className="mt-2 text-[13px] text-gray-700">“{i.quote}”</p>
                <div className="mt-2 text-[12px] text-gray-500">
                  {i.role}, {i.account} · cited in {i.dealsCited} deals
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Interview playback                                                  */
/* ------------------------------------------------------------------ */

const BARS = Array.from({ length: 120 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 0.37) * 0.6 + Math.sin(i * 1.7) * 0.3 + Math.cos(i * 0.11) * 0.25)
  return 0.18 + Math.min(1, v) * 0.82
})

export function InterviewPage() {
  const { navigate, toast, setUserHighlights, setModal } = useApp()
  const { time, playing, setPlaying, seek } = usePlayback()
  const openCitation = useOpenCitation()
  const transcriptRef = useRef<HTMLDivElement>(null)
  const [selection, setSelection] = useState<{ text: string; t: number; x: number; y: number } | null>(null)

  const activeIndex = useMemo(() => {
    let idx = 0
    transcript.forEach((l, i) => {
      if (l.t <= time) idx = i
    })
    return idx
  }, [time])

  // Keep the active transcript row in view within the transcript panel only.
  useEffect(() => {
    const box = transcriptRef.current
    const row = box?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`)
    if (!box || !row) return
    const target = row.offsetTop - box.clientHeight / 2 + row.clientHeight / 2
    box.scrollTo({ top: Math.max(0, target), behavior: 'smooth' })
  }, [activeIndex])

  const onMouseUp = () => {
    const sel = window.getSelection()
    const text = sel?.toString().trim() ?? ''
    if (!sel || !text || !transcriptRef.current?.contains(sel.anchorNode)) {
      setSelection(null)
      return
    }
    const rowEl = (sel.anchorNode?.parentElement as HTMLElement | null)?.closest<HTMLElement>('[data-t]')
    const rect = sel.getRangeAt(0).getBoundingClientRect()
    setSelection({ text, t: Number(rowEl?.dataset.t ?? time), x: rect.left + rect.width / 2, y: rect.top })
  }

  const pct = (time / acmeDeal.duration) * 100

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Repository', onClick: () => navigate('repository') }, { label: 'Acme Freight interview' }]}
        title="Acme Freight · Win/loss interview"
        meta={
          <span className="flex items-center gap-2">
            <Badge tone="blue">AI moderated interview</Badge>
            <Badge tone="gray">
              <EyeOff size={11} /> Concealed identity
            </Badge>
          </span>
        }
        actions={
          <>
            <Button onClick={() => navigate('deal')}>Deal activity</Button>
            <Button icon={<Film size={14} />} onClick={() => setModal({ kind: 'reel' })}>
              Add to reel
            </Button>
            <Button variant="primary" onClick={() => navigate('win-loss')}>
              Open Win/Loss
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-[minmax(0,1fr)_400px] gap-5 px-8 py-6">
        <div className="min-w-0 space-y-5">
          {/* Player */}
          <Card className="overflow-hidden">
            <div className="relative flex h-[220px] flex-col justify-between bg-[#0f172a] px-5 py-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar initials="DO" tone="violet" size={32} />
                  <div>
                    <div className="text-[13px] font-medium">Dana Okafor · {acmeDeal.participantRole}</div>
                    <div className="text-[11px] text-white/60">Acme Freight · interviewed {acmeDeal.interviewedOn} · audio only</div>
                  </div>
                </div>
                <span className="rounded bg-white/10 px-2 py-0.5 text-[11px] text-white/70">{acmeDeal.durationLabel}</span>
              </div>
              <button
                className="group relative flex h-[96px] items-center gap-[3px]"
                aria-label="Seek in recording"
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  seek(((e.clientX - r.left) / r.width) * acmeDeal.duration)
                }}
              >
                {BARS.map((h, i) => {
                  const played = (i / BARS.length) * 100 <= pct
                  return (
                    <span
                      key={i}
                      className={cx('flex-1 rounded-full transition-colors', played ? 'bg-brand-200' : 'bg-white/20 group-hover:bg-white/30')}
                      style={{ height: `${h * 100}%`, animation: playing && Math.abs((i / BARS.length) * 100 - pct) < 3 ? 'wave 0.6s ease-in-out infinite' : undefined }}
                    />
                  )
                })}
                {acmeHighlights.map((h) => (
                  <span key={h.id} className="pointer-events-none absolute -bottom-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-300" style={{ left: `${(h.t / acmeDeal.duration) * 100}%` }} aria-hidden />
                ))}
              </button>
              <div className="truncate text-[12px] text-white/70">
                <span className="font-medium text-white/90">{transcript[activeIndex].speaker}:</span> {transcript[activeIndex].text}
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5">
              <IconButton label="Back 10 seconds" onClick={() => seek(time - 10)}>
                <SkipBack size={15} />
              </IconButton>
              <button
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? 'Pause' : 'Play'}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600"
              >
                {playing ? <Pause size={15} /> : <Play size={15} className="translate-x-px" />}
              </button>
              <IconButton label="Forward 10 seconds" onClick={() => seek(time + 10)}>
                <SkipForward size={15} />
              </IconButton>
              <span className="w-[92px] text-[12px] text-gray-600 tabular">
                {fmtTime(time)} / {fmtTime(acmeDeal.duration)}
              </span>
              <input
                type="range"
                aria-label="Playback position"
                min={0}
                max={acmeDeal.duration}
                step={1}
                value={Math.round(time)}
                onChange={(e) => seek(Number(e.target.value))}
                className="gq-range flex-1"
                style={{ ['--fill' as string]: `${pct}%` }}
              />
            </div>
          </Card>

          {/* Highlights */}
          <Card>
            <CardHeader icon={<Tag size={15} />} title="Highlights" subtitle="Generated automatically from the transcript. Click to jump." />
            <div className="flex flex-wrap gap-2 px-4 py-3">
              {acmeHighlights.map((h) => (
                <button
                  key={h.id}
                  onClick={() => seek(h.t)}
                  className={cx(
                    'inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-medium transition-colors',
                    h.kind === 'surface' && 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
                    h.kind === 'primary' && 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100',
                    h.kind === 'competitor' && 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
                    h.kind === 'theme' && 'border-line-strong bg-white text-gray-700 hover:bg-gray-50',
                  )}
                >
                  {h.label}
                  <span className="text-[11px] opacity-70 tabular">{fmtTime(h.t)}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-line px-4 py-3">
              <div className="rounded-ctl border border-amber-200 bg-amber-50/60 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">Surface reason</div>
                <div className="text-[13px] font-medium text-gray-900">Price</div>
                <div className="text-[12px] text-gray-600">First answer given · matches CRM</div>
              </div>
              <div className="rounded-ctl border border-brand-200 bg-brand-50 px-3 py-2">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-brand-700">Primary reason</div>
                <div className="text-[13px] font-medium text-gray-900">Missing NetSuite integration</div>
                <div className="text-[12px] text-gray-600">Emerged after the moderator probed</div>
              </div>
            </div>
          </Card>

          {/* AI summary */}
          <Card data-tour="ai-summary">
            <CardHeader icon={<Sparkles size={15} className="text-brand-500" />} title="AI summary" subtitle="Research finding · supported by participant evidence" />
            <div className="px-4 py-3">
              <p className="text-[14px] leading-relaxed text-gray-800">{acmeSummary.text}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[12px] text-gray-500">Evidence</span>
                {acmeSummary.citations.map((id) => (
                  <button key={id} onClick={() => openCitation(id)} className="inline-flex h-6 items-center gap-1 rounded border border-line bg-gray-50 px-2 text-[12px] font-medium text-brand-700 hover:border-brand-200 hover:bg-brand-50">
                    <Quote size={11} /> {fmtTime(citations[id].t)}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Transcript */}
        <Card className="flex h-[calc(100vh-210px)] min-h-[520px] flex-col">
          <CardHeader title="Transcript" subtitle="Select text to create a highlight" />
          <div ref={transcriptRef} onMouseUp={onMouseUp} className="thin-scroll relative flex-1 overflow-y-auto px-2 py-2">
            {transcript.map((l, i) => {
              const active = i === activeIndex
              const isP = l.speaker === 'Participant'
              return (
                <div
                  key={l.t}
                  data-idx={i}
                  data-t={l.t}
                  data-tour={l.key ? 'key-exchange' : undefined}
                  onClick={() => !window.getSelection()?.toString() && seek(l.t)}
                  className={cx(
                    'group relative cursor-pointer rounded-ctl px-3 py-2 transition-colors duration-200',
                    active ? 'bg-brand-50' : 'hover:bg-gray-50',
                    l.key && !active && 'bg-amber-50/40',
                  )}
                >
                  {active && <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-full bg-brand-500" aria-hidden />}
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={cx('font-semibold', isP ? 'text-violet-700' : 'text-gray-700')}>{isP ? 'Participant' : 'Moderator'}</span>
                    <span className="text-gray-400 tabular">{fmtTime(l.t)}</span>
                    {l.key && l.t === 348 && <Badge tone="amber">Price (surface)</Badge>}
                    {l.key && l.t === 372 && <Badge tone="gray">AI probe</Badge>}
                    {l.key && l.t === 384 && <Badge tone="blue">Integration gap</Badge>}
                  </div>
                  <p className={cx('mt-0.5 text-[13px] leading-relaxed', active ? 'text-gray-900' : 'text-gray-700')}>{l.text}</p>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {selection && (
        <div className="anim-pop fixed z-[90] -translate-x-1/2 -translate-y-full" style={{ left: selection.x, top: selection.y - 8 }}>
          <Button
            variant="primary"
            size="sm"
            icon={<Highlighter size={13} />}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setUserHighlights((h) => [...h, { id: Date.now(), t: selection.t, text: selection.text }])
              toast(`Highlight created at ${fmtTime(selection.t)} · saved to Repository`)
              window.getSelection()?.removeAllRanges()
              setSelection(null)
            }}
          >
            Create highlight
          </Button>
        </div>
      )}
    </>
  )
}
