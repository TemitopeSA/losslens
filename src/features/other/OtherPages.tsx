import { useState } from 'react'
import { ArrowRight, Plus, Search, Target, Upload, Wallet } from 'lucide-react'
import { useApp } from '../../state/AppState'
import { Avatar, Badge, Button, Card, CardHeader, PageHeader, Tabs, cx, initialsOf, inputClass } from '../../components/ui'
import { candidates, incentiveWallet } from '../../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Candidates                                                          */
/* ------------------------------------------------------------------ */

export function CandidatesPage() {
  const { toast, navigate } = useApp()
  const [q, setQ] = useState('')
  const [source, setSource] = useState<'all' | 'salesforce' | 'other'>('all')
  const rows = candidates.filter(
    (c) =>
      (source === 'all' || (source === 'salesforce' ? c.source === 'Salesforce' : c.source !== 'Salesforce')) &&
      `${c.name} ${c.company} ${c.title}`.toLowerCase().includes(q.toLowerCase()),
  )
  return (
    <>
      <PageHeader
        title="Candidates"
        meta={<span className="text-[12px] text-gray-500">2,184 people · synced with Salesforce</span>}
        actions={
          <>
            <Button icon={<Upload size={14} />} onClick={() => toast('CSV import is outside this prototype’s scope', 'info')}>
              Import
            </Button>
            <Button variant="primary" icon={<Plus size={14} />} onClick={() => toast('Adding candidates is outside this prototype’s scope', 'info')}>
              Add candidate
            </Button>
          </>
        }
      >
        <Tabs
          value={source}
          onChange={setSource}
          tabs={[
            { id: 'all', label: 'All candidates' },
            { id: 'salesforce', label: 'From Salesforce' },
            { id: 'other', label: 'Panel & product' },
          ]}
        />
      </PageHeader>
      <div className="space-y-4 px-8 py-6">
        <div className="relative w-[320px]">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input aria-label="Filter candidates" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name, company, title" className={cx(inputClass, 'w-full pl-8')} />
        </div>
        <Card>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-gray-500">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Company</th>
                <th className="px-4 py-2 font-medium">Source</th>
                <th className="px-4 py-2 font-medium">Last study</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Last contacted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.name} className={cx('border-b border-line last:border-0', c.name === 'Dana Okafor' && 'cursor-pointer hover:bg-gray-50')} onClick={() => c.name === 'Dana Okafor' && navigate('interview')}>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2.5">
                      <Avatar initials={initialsOf(c.name)} tone={c.source === 'Salesforce' ? 'blue' : 'gray'} size={26} />
                      <span>
                        <span className="block font-medium text-gray-900">{c.name}</span>
                        <span className="block text-[12px] text-gray-500">{c.title}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700">{c.company}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.source}</td>
                  <td className="px-4 py-2.5 text-gray-600">{c.lastStudy}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={c.status === 'Completed' ? 'green' : c.status === 'Do not contact' ? 'red' : 'blue'} dot>
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{c.lastContact}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No candidates match “{q}”
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="border-t border-line px-4 py-2 text-[12px] text-gray-500">Contact frequency limits apply across all studies: max 1 invite per 90 days.</div>
        </Card>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Incentives                                                          */
/* ------------------------------------------------------------------ */

export function IncentivesPage() {
  const { toast, trigger, navigate } = useApp()
  const capPct = Math.min(100, (incentiveWallet.spentThisMonth / Math.max(1, trigger.monthlyCap)) * 100)
  return (
    <>
      <PageHeader
        title="Incentives"
        actions={
          <Button variant="primary" icon={<Wallet size={14} />} onClick={() => toast('Adding funds is disabled in this prototype', 'info')}>
            Add funds
          </Button>
        }
      />
      <div className="space-y-5 px-8 py-6">
        <div className="grid grid-cols-3 gap-4">
          <Card className="px-4 py-3">
            <div className="text-[12px] text-gray-500">Wallet balance</div>
            <div className="mt-1 text-[24px] font-semibold tracking-tight text-gray-900 tabular">${incentiveWallet.balance.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500">Gift cards · 200+ brands, delivered by email</div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[12px] text-gray-500">Win/Loss spend this month</div>
            <div className="mt-1 text-[24px] font-semibold tracking-tight text-gray-900 tabular">${incentiveWallet.spentThisMonth}</div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${capPct}%` }} />
            </div>
            <div className="mt-1 text-[11px] text-gray-500">of ${trigger.monthlyCap.toLocaleString()} monthly cap</div>
          </Card>
          <Card className="px-4 py-3">
            <div className="text-[12px] text-gray-500">Default win/loss incentive</div>
            <div className="mt-1 text-[24px] font-semibold tracking-tight text-gray-900 tabular">${trigger.incentive}</div>
            <button className="text-[12px] font-medium text-brand-600 hover:underline" onClick={() => navigate('salesforce')}>
              Edit in Salesforce trigger →
            </button>
          </Card>
        </div>
        <Card>
          <CardHeader title="Recent incentives" />
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-gray-500">
                <th className="px-4 py-2 font-medium">Recipient</th>
                <th className="px-4 py-2 font-medium">Study</th>
                <th className="px-4 py-2 text-right font-medium">Amount</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {incentiveWallet.recent.map((r) => (
                <tr key={r.name + r.date} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900">{r.name}</div>
                    <div className="text-[12px] text-gray-500">{r.company}</div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{r.study}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900 tabular">${r.amount}</td>
                  <td className="px-4 py-2.5 text-gray-500">{r.date}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={r.status === 'Delivered' ? 'green' : 'amber'} dot>
                      {r.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Analytics                                                           */
/* ------------------------------------------------------------------ */

const weekly = [
  { w: 'Aug 3', sessions: 14 },
  { w: 'Aug 10', sessions: 18 },
  { w: 'Aug 17', sessions: 16 },
  { w: 'Aug 24', sessions: 21 },
  { w: 'Aug 31', sessions: 19 },
  { w: 'Sep 7', sessions: 26 },
  { w: 'Sep 14', sessions: 24 },
  { w: 'Sep 21', sessions: 29 },
  { w: 'Sep 28', sessions: 31 },
]

export function AnalyticsPage() {
  const { navigate } = useApp()
  const max = Math.max(...weekly.map((w) => w.sessions))
  return (
    <>
      <PageHeader title="Analytics" meta={<span className="text-[12px] text-gray-500">Research operations · last 60 days</span>} />
      <div className="space-y-5 px-8 py-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            ['Sessions completed', '198'],
            ['Active studies', '2'],
            ['Avg. participation rate', '38%'],
            ['Incentives paid', '$6,420'],
          ].map(([k, v]) => (
            <Card key={k} className="px-4 py-3">
              <div className="text-[12px] text-gray-500">{k}</div>
              <div className="mt-1 text-[24px] font-semibold tracking-tight text-gray-900 tabular">{v}</div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5">
          <Card>
            <CardHeader title="Sessions per week" subtitle="All studies · completed sessions" />
            <div className="flex h-[200px] items-end gap-3 px-5 pb-3 pt-5">
              {weekly.map((w) => (
                <div key={w.w} className="group flex flex-1 flex-col items-center gap-1.5" title={`${w.w}: ${w.sessions} sessions`}>
                  <span className="text-[11px] text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 tabular">{w.sessions}</span>
                  <div className="w-full rounded-t-[4px] bg-brand-500/80 transition-colors group-hover:bg-brand-500" style={{ height: `${(w.sessions / max) * 130}px` }} />
                  <span className="text-[10px] text-gray-500">{w.w}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="flex flex-col p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-ctl bg-brand-50 text-brand-500">
              <Target size={16} />
            </span>
            <div className="mt-3 text-[14px] font-semibold text-gray-900">Win/Loss analytics moved</div>
            <p className="mt-1 flex-1 text-[13px] text-gray-600">Loss reasons, revenue impact and competitor trends now live in the Win/Loss workspace, powered by always-on buyer interviews.</p>
            <Button className="mt-4 self-start" variant="primary" icon={<ArrowRight size={14} />} onClick={() => navigate('win-loss')}>
              Open Win/Loss
            </Button>
          </Card>
        </div>
      </div>
    </>
  )
}
