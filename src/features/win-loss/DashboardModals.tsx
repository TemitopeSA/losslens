import { useEffect, useState } from 'react'
import { Check, Download, Film, Pause, Play, Printer } from 'lucide-react'
import { useApp, usePlayback } from '../../state/AppState'
import { Avatar, Button, Modal, Select, cx, initialsOf, inputClass } from '../../components/ui'
import { acmeDeal, citations, dashboardBaseline, fmtTime, lostDeals, reasonLabels, reelClips } from '../../data/lossLensData'

export function DashboardModals() {
  const { modal, setModal } = useApp()
  const close = () => setModal(null)
  return (
    <>
      <ShareModal open={modal?.kind === 'share'} onClose={close} />
      <ReelModal open={modal?.kind === 'reel'} onClose={close} />
      <ExportModal open={modal?.kind === 'export'} onClose={close} />
      <ClipModal open={modal?.kind === 'clip'} citationId={modal?.payload} onClose={close} />
    </>
  )
}

/* ------------------------------------------------------------------ */

function ShareModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp()
  const [channel, setChannel] = useState('#revenue')
  const [note, setNote] = useState('Buyers are telling us something different from the CRM. Missing NetSuite sync is our biggest hidden loss driver.')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (open) setDone(false)
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share to Slack"
      width={560}
      footer={
        done ? (
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setDone(true)
                toast(`Preview confirmed for ${channel} · nothing was posted (simulated)`, 'info')
              }}
            >
              Confirm share (simulated)
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4 px-5 py-4">
        {done ? (
          <div className="flex items-start gap-3 rounded-ctl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <Check size={16} className="mt-0.5 text-emerald-600" />
            <div className="text-[13px] text-emerald-900">
              <div className="font-medium">Share confirmed in the prototype</div>
              <div className="text-emerald-800">In production this would post to {channel}. No Slack message was sent.</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[100px_minmax(0,1fr)] items-center gap-3">
              <span className="text-[12px] font-medium text-gray-700">Channel</span>
              <Select label="Slack channel" value={channel} options={['#revenue', '#product-leadership', '#deal-desk']} onChange={setChannel} />
              <span className="self-start pt-1.5 text-[12px] font-medium text-gray-700">Message</span>
              <textarea aria-label="Message" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={cx(inputClass, 'h-auto py-1.5')} />
            </div>
          </>
        )}
        <div className="overflow-hidden rounded-ctl border border-line">
          <div className="border-b border-line bg-gray-50 px-3 py-1.5 text-[12px] font-semibold text-gray-700">{channel} · preview</div>
          <div className="flex gap-2.5 px-3 py-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-brand-500 text-[11px] font-bold text-white">GQ</span>
            <div className="min-w-0 flex-1 text-[13px]">
              <div>
                <span className="font-bold text-gray-900">Great Question</span> <span className="rounded bg-gray-100 px-1 text-[10px] font-semibold text-gray-500">APP</span>
              </div>
              <p className="mt-0.5 text-gray-800">{note}</p>
              <div className="mt-2 rounded border-l-4 border-brand-500 bg-gray-50 px-3 py-2">
                <div className="font-semibold text-gray-900">Win/Loss · Last 90 days</div>
                <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[12px] text-gray-700">
                  <span>Lost deals reviewed: {dashboardBaseline.dealsReviewed}</span>
                  <span>Pipeline represented: $1.42M</span>
                  <span>Price — CRM 46% vs buyers 12%</span>
                  <span>Missing integration — CRM 8% vs buyers 35%</span>
                </div>
                <div className="mt-1.5 text-[12px] font-medium text-brand-700">Top recommendation: Ship native NetSuite sync — 6 of 9 Spendwise losses ($388k)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

function ReelModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setReels, toast, navigate } = useApp()
  const [title, setTitle] = useState('Why we lose to Spendwise: the NetSuite gap')
  const [selected, setSelected] = useState<string[]>(['r1', 'r2', 'r3', 'r4'])
  const [created, setCreated] = useState(false)
  useEffect(() => {
    if (open) setCreated(false)
  }, [open])
  const total = reelClips.filter((c) => selected.includes(c.id)).reduce((s, c) => s + Number(c.length.split(':')[0]) * 60 + Number(c.length.split(':')[1]), 0)
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create highlight reel"
      width={560}
      footer={
        created ? (
          <>
            <Button
              onClick={() => {
                onClose()
                navigate('repository')
              }}
            >
              Open Repository
            </Button>
            <Button variant="primary" onClick={onClose}>
              Done
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!selected.length || !title.trim()}
              icon={<Film size={14} />}
              onClick={() => {
                setReels((r) => [{ id: Date.now(), title: title.trim(), clips: selected.length }, ...r])
                setCreated(true)
                toast(`Reel “${title.trim()}” created in Repository`)
              }}
            >
              Create reel
            </Button>
          </>
        )
      }
    >
      {created ? (
        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check size={18} />
          </span>
          <div className="mt-3 text-[14px] font-semibold text-gray-900">{title}</div>
          <div className="mt-1 text-[13px] text-gray-500">
            {selected.length} clips · {fmtTime(total)} · saved to Repository → Reels
          </div>
        </div>
      ) : (
        <div className="space-y-4 px-5 py-4">
          <label className="block space-y-1.5">
            <span className="text-[12px] font-medium text-gray-700">Reel title</span>
            <input className={cx(inputClass, 'w-full')} value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[12px]">
              <span className="font-medium text-gray-700">Clips from highlights</span>
              <span className="text-gray-500 tabular">
                {selected.length} selected · {fmtTime(total)}
              </span>
            </div>
            <ul className="divide-y divide-line rounded-ctl border border-line">
              {reelClips.map((c) => {
                const on = selected.includes(c.id)
                return (
                  <li key={c.id}>
                    <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setSelected((s) => (on ? s.filter((x) => x !== c.id) : [...s, c.id]))}
                        className="h-3.5 w-3.5 accent-[#266BD8]"
                      />
                      <span className="flex h-7 w-11 items-center justify-center rounded bg-gray-900 text-white/70" aria-hidden>
                        <Play size={11} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px] text-gray-900">{c.label}</span>
                        <span className="block text-[11px] text-gray-500">
                          {c.account} · {fmtTime(c.t)}
                        </span>
                      </span>
                      <span className="text-[12px] text-gray-500 tabular">{c.length}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

function ExportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useApp()
  const downloadCsv = () => {
    const header = ['Account', 'Amount', 'Segment', 'Owner', 'CRM loss reason', 'Interview primary reason', 'Competitor chosen']
    const rows = lostDeals.map((d) => [d.account, d.amount, d.segment, d.owner, reasonLabels[d.crmReason], reasonLabels[d.interviewReason], d.competitor])
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'ledgerly-win-loss-last-90-days.csv'
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV downloaded')
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Export Win/Loss report"
      width={520}
      footer={
        <>
          <Button icon={<Download size={14} />} onClick={downloadCsv}>
            Download CSV
          </Button>
          <Button
            variant="primary"
            icon={<Printer size={14} />}
            onClick={() => {
              onClose()
              window.setTimeout(() => window.print(), 250)
            }}
          >
            Save as PDF
          </Button>
        </>
      }
    >
      <div className="space-y-3 px-5 py-4 text-[13px]">
        <div className="rounded-ctl border border-line p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Report preview</div>
          <div className="mt-1 text-[15px] font-semibold text-gray-900">Ledgerly Win/Loss · Last 90 days</div>
          <ul className="mt-2 space-y-1 text-gray-700">
            <li>17 lost deals reviewed · $1.42M pipeline represented</li>
            <li>Sales says vs. buyers say comparison chart</li>
            <li>$ lost by real reason · competitor mentions</li>
            <li>4 top insights with participant quotes</li>
          </ul>
        </div>
        <p className="text-[12px] text-gray-500">“Save as PDF” opens your browser’s print dialog with a print-ready layout of the dashboard — choose “Save as PDF” as the destination.</p>
      </div>
    </Modal>
  )
}

/* ------------------------------------------------------------------ */

function ClipModal({ open, citationId, onClose }: { open: boolean; citationId?: string; onClose: () => void }) {
  const { navigate } = useApp()
  const { seek, setPlaying } = usePlayback()
  const c = citationId ? citations[citationId] : undefined
  const [progress, setProgress] = useState(0)
  const [playing, setLocalPlaying] = useState(false)
  useEffect(() => {
    if (open) {
      setProgress(0)
      setLocalPlaying(true)
    }
  }, [open, citationId])
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setProgress((p) => (p >= 100 ? (setLocalPlaying(false), 100) : p + 2)), 100)
    return () => window.clearInterval(id)
  }, [playing])
  if (!c) return null
  const isAcme = c.interviewId === acmeDeal.id
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Clip"
      width={520}
      footer={
        <>
          <Button onClick={onClose}>Close</Button>
          {isAcme && (
            <Button
              variant="primary"
              onClick={() => {
                onClose()
                navigate('interview')
                seek(c.t)
                setPlaying(false)
              }}
            >
              Open full interview
            </Button>
          )}
        </>
      }
    >
      <div className="px-5 py-4">
        <div className="rounded-ctl bg-[#0f172a] px-4 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <Avatar initials={initialsOf(c.account)} tone="violet" size={28} />
            <div className="text-[12px]">
              <div className="font-medium">
                {c.speakerRole} · {c.account}
              </div>
              <div className="text-white/60">Win/Loss — Always-on · {fmtTime(c.t)}</div>
            </div>
          </div>
          <p className="mt-3 font-serif text-[18px] leading-snug">“{c.quote}”</p>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => (progress >= 100 ? (setProgress(0), setLocalPlaying(true)) : setLocalPlaying(!playing))}
              aria-label={playing ? 'Pause clip' : 'Play clip'}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900"
            >
              {playing ? <Pause size={13} /> : <Play size={13} className="translate-x-px" />}
            </button>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-brand-200 transition-[width] duration-100" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] text-white/60 tabular">0:{String(Math.round((progress / 100) * 24)).padStart(2, '0')}</span>
          </div>
        </div>
        <p className="mt-3 text-[12px] text-gray-500">{isAcme ? 'Open the full interview to see this moment in the transcript.' : 'Clip preview from the Repository. Only the Acme Freight interview has a full transcript in this prototype.'}</p>
      </div>
    </Modal>
  )
}
