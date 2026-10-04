import { useMemo, useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ChevronRight, FileDown, Film, Play, Quote, RotateCcw, Share2, Sparkles } from 'lucide-react'
import { defaultFilters, useApp, useOpenCitation, type Filters } from '../../state/AppState'
import { track } from '../../lib/analytics'
import { Badge, Button, Card, CardHeader, PageHeader, Select, Tabs, cx } from '../../components/ui'
import {
  citations,
  dashboardBaseline,
  filterOptions,
  fmtK,
  fmtMoney,
  insights,
  lostDeals,
  pendingDeals,
  reasonLabels,
  reasonOrder,
  type Competitor,
  type LostDeal,
  type ReasonKey,
} from '../../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Derived data                                                        */
/* ------------------------------------------------------------------ */

const TODAY = new Date(2026, 9, 4)
const parseClosed = (s: string) => new Date(`${s}, 2026`)

export function applyFilters(f: Filters): LostDeal[] {
  return lostDeals.filter((d) => {
    if (f.segment !== defaultFilters.segment && d.segment !== f.segment) return false
    if (f.competitor !== defaultFilters.competitor && d.competitor !== f.competitor) return false
    if (f.owner !== defaultFilters.owner && d.owner !== f.owner) return false
    if (f.size === '$10k–$50k' && !(d.amount >= 10000 && d.amount < 50000)) return false
    if (f.size === '$50k–$100k' && !(d.amount >= 50000 && d.amount < 100000)) return false
    if (f.size === '$100k+' && d.amount < 100000) return false
    const days = (TODAY.getTime() - parseClosed(d.closedOn).getTime()) / 86400000
    if (f.range === 'Last 30 days' && days > 30) return false
    if (f.range === 'Last 60 days' && days > 60) return false
    return true
  })
}

const isDefault = (f: Filters) => (Object.keys(defaultFilters) as (keyof Filters)[]).every((k) => f[k] === defaultFilters[k])

function useDashboardData() {
  const { filters } = useApp()
  return useMemo(() => {
    const deals = applyFilters(filters)
    const n = deals.length
    const baseline = isDefault(filters)
    const pct = (k: ReasonKey, field: 'crmReason' | 'interviewReason') => (n ? Math.round((deals.filter((d) => d[field] === k).length / n) * 100) : 0)
    const comparison = baseline
      ? dashboardBaseline.reasonComparison
      : reasonOrder.map((key) => ({ key, crm: pct(key, 'crmReason'), interview: pct(key, 'interviewReason') }))
    const sorted = [...deals.map((d) => d.daysToInsight)].sort((a, b) => a - b)
    const median = n ? sorted[Math.floor((n - 1) / 2)] : 0
    const revenue = reasonOrder
      .map((key) => {
        const ds = deals.filter((d) => d.interviewReason === key)
        return { key, amount: ds.reduce((s, d) => s + d.amount, 0), count: ds.length }
      })
      .sort((a, b) => b.amount - a.amount)
    const competitors = (['Spendwise', 'Paystack Pro', 'Built in-house'] as Competitor[]).map((c) => ({
      name: c,
      count: deals.filter((d) => d.competitor === c).length,
      netsuite: deals.filter((d) => d.competitor === c && d.citesNetSuite).length,
    }))
    return {
      deals,
      n,
      baseline,
      pipeline: deals.reduce((s, d) => s + d.amount, 0),
      median: baseline ? dashboardBaseline.medianDaysToInsight : median,
      comparison,
      revenue,
      competitors,
    }
  }, [filters])
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function WinLossPage() {
  const { route, navigate, setAskOpen, setModal } = useApp()
  const tab = route === 'win-loss/deals' ? 'deals' : 'overview'
  return (
    <>
      <PageHeader
        title="Win/Loss"
        meta={
          <span className="flex items-center gap-2">
            <Badge tone="blue">LossLens</Badge>
            <span className="hidden truncate text-[12px] text-gray-500 min-[1400px]:inline">Powered by Win/Loss — Always-on · Salesforce</span>
          </span>
        }
        actions={
          <>
            <Button icon={<Sparkles size={14} className="text-brand-500" />} onClick={() => setAskOpen(true)}>
              Ask AI
            </Button>
            <Button icon={<Share2 size={14} />} onClick={() => setModal({ kind: 'share' })}>
              Share to #revenue
            </Button>
            <Button icon={<Film size={14} />} onClick={() => setModal({ kind: 'reel' })}>
              Create highlight reel
            </Button>
            <Button variant="primary" icon={<FileDown size={14} />} onClick={() => setModal({ kind: 'export' })}>
              Export PDF
            </Button>
          </>
        }
      >
        <Tabs
          value={tab}
          onChange={(t) => navigate(t === 'deals' ? 'win-loss/deals' : 'win-loss')}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'deals', label: 'Lost deals', count: lostDeals.length + pendingDeals.length },
          ]}
        />
      </PageHeader>
      {tab === 'overview' ? <Dashboard /> : <DealsList />}
    </>
  )
}

function FilterBar() {
  const { filters, setFilters } = useApp()
  const set = (k: keyof Filters) => (v: string) => {
    track('dashboard_filter_changed', { filter: k, value: v })
    setFilters((f) => ({ ...f, [k]: v }))
  }
  const changed = !isDefault(filters)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select label="Date range" className="w-[136px]" value={filters.range} options={['Last 90 days', 'Last 60 days', 'Last 30 days']} onChange={set('range')} active={filters.range !== defaultFilters.range} />
      <span className="mx-1 h-5 w-px bg-line" aria-hidden />
      <Select label="Segment" className="w-[140px]" value={filters.segment} options={filterOptions.segment} onChange={set('segment')} active={filters.segment !== defaultFilters.segment} />
      <Select label="Deal size" className="w-[140px]" value={filters.size} options={filterOptions.size} onChange={set('size')} active={filters.size !== defaultFilters.size} />
      <Select label="Competitor" className="w-[150px]" value={filters.competitor} options={filterOptions.competitor} onChange={set('competitor')} active={filters.competitor !== defaultFilters.competitor} />
      <Select label="Owner" className="w-[130px]" value={filters.owner} options={filterOptions.owner} onChange={set('owner')} active={filters.owner !== defaultFilters.owner} />
      {changed && (
        <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} onClick={() => setFilters(defaultFilters)}>
          Reset filters
        </Button>
      )}
    </div>
  )
}

function Dashboard() {
  const data = useDashboardData()
  const { setFilters } = useApp()
  const { filters } = useApp()

  return (
    <div className="print-root space-y-5 px-8 py-5">
      <div className="no-print flex items-center justify-between gap-4">
        <FilterBar />
      </div>
      <div className="flex items-baseline gap-2">
        <h2 className="text-[15px] font-semibold text-gray-900">{filters.range}</h2>
        <span className="text-[12px] text-gray-500">
          {data.baseline ? 'All interviewed lost opportunities' : `Filtered · ${data.n} of ${lostDeals.length} interviewed losses`}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Lost deals reviewed', value: String(data.n), sub: `of 38 invited buyers · ${pendingDeals.length} in progress` },
          { label: 'Pipeline lost represented', value: fmtK(data.pipeline), sub: 'Sum of opportunity amounts' },
          { label: 'Response rate', value: `${dashboardBaseline.responseRate}%`, sub: '17 of 38 invited buyers · study-wide' },
          { label: 'Median time to insight', value: `${data.median} days`, sub: 'Closed Lost → interview summary' },
        ].map((k) => (
          <Card key={k.label} className="print-avoid px-4 py-3">
            <div className="text-[12px] text-gray-500">{k.label}</div>
            <div className="mt-1 text-[24px] font-semibold tracking-[-0.02em] text-gray-900 tabular">{k.value}</div>
            <div className="mt-0.5 text-[11px] text-gray-500">{k.sub}</div>
          </Card>
        ))}
      </div>

      {data.n === 0 ? (
        <Card className="flex flex-col items-center px-6 py-14 text-center">
          <div className="text-[14px] font-medium text-gray-900">No interviewed losses match these filters</div>
          <p className="mt-1 text-[13px] text-gray-500">Try a broader segment, deal size or date range.</p>
          <Button className="mt-3" size="sm" onClick={() => setFilters(defaultFilters)}>
            Reset filters
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] gap-5">
            <ReasonComparisonChart data={data.comparison} n={data.n} baseline={data.baseline} />
            <RevenueByReason revenue={data.revenue} total={data.pipeline} n={data.n} />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.75fr)] gap-5">
            <CompetitorMentions competitors={data.competitors} />
            <TopInsights />
          </div>
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Hero chart: Sales says vs. buyers say                               */
/* ------------------------------------------------------------------ */

function ReasonComparisonChart({ data, n, baseline }: { data: { key: ReasonKey; crm: number; interview: number }[]; n: number; baseline: boolean }) {
  const [hover, setHover] = useState<ReasonKey | null>(null)
  const [showTable, setShowTable] = useState(false)
  const maxVal = Math.max(50, Math.ceil(Math.max(...data.flatMap((d) => [d.crm, d.interview])) / 10) * 10)
  const ticks = Array.from({ length: maxVal / 10 + 1 }, (_, i) => i * 10)
  const price = data.find((d) => d.key === 'price')!
  const integ = data.find((d) => d.key === 'integration')!

  return (
    <Card data-tour="chart-gap" className="print-avoid">
      <CardHeader
        title="Sales says vs. buyers say"
        subtitle="Compare CRM-recorded loss reasons with the primary reasons identified in buyer interviews."
        actions={
          <button className="no-print text-[12px] font-medium text-gray-500 hover:text-gray-900" onClick={() => setShowTable((s) => !s)} aria-pressed={showTable}>
            {showTable ? 'Show chart' : 'View as table'}
          </button>
        }
      />
      <div className="px-4 pb-4 pt-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-gray-700">
            Sales logged <strong className="font-semibold text-gray-900">Price on {price.crm}%</strong> of losses; buyers named it in{' '}
            <strong className="font-semibold text-gray-900">{price.interview}%</strong>. Missing integration rises from {integ.crm}% to{' '}
            <strong className="font-semibold text-gray-900">{integ.interview}%</strong>.
          </p>
          <div className="flex items-center gap-4 text-[12px] text-gray-600" aria-label="Legend">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-crm" /> CRM-logged reason
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-buyer" /> Interview primary reason
            </span>
          </div>
        </div>

        {showTable ? (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-gray-500">
                <th className="py-1.5 font-medium">Reason</th>
                <th className="py-1.5 text-right font-medium">CRM-logged</th>
                <th className="py-1.5 text-right font-medium">Interview primary</th>
                <th className="py-1.5 text-right font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.key} className="border-b border-line last:border-0">
                  <td className="py-2 text-gray-900">{reasonLabels[d.key]}</td>
                  <td className="py-2 text-right tabular">{d.crm}%</td>
                  <td className="py-2 text-right tabular">{d.interview}%</td>
                  <td className="py-2 text-right tabular">
                    {d.interview - d.crm > 0 ? '+' : ''}
                    {d.interview - d.crm} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="relative" onMouseLeave={() => setHover(null)}>
            <div className="relative">
              <div className="pointer-events-none absolute bottom-6 left-[160px] right-[84px] top-0" aria-hidden>
                {ticks.map((t) => (
                  <span key={t} className={cx('absolute bottom-0 top-0 w-px', t === 0 ? 'bg-gray-300' : 'bg-gray-100')} style={{ left: `${(t / maxVal) * 86}%` }} />
                ))}
              </div>
              <ul className="relative">
                {data.map((d) => {
                  const delta = d.interview - d.crm
                  const emphasis = d.key === 'price' || d.key === 'integration'
                  return (
                    <li
                      key={d.key}
                      onMouseEnter={() => setHover(d.key)}
                      className={cx('grid grid-cols-[148px_minmax(0,1fr)_72px] items-center gap-x-3 rounded py-2 transition-colors', hover === d.key && 'bg-gray-50')}
                    >
                      <span className={cx('pl-1 text-[13px]', emphasis ? 'font-semibold text-gray-900' : 'text-gray-700')}>{reasonLabels[d.key]}</span>
                      <span className="space-y-[3px]">
                        {(['crm', 'interview'] as const).map((s) => (
                          <span key={s} className="flex items-center gap-2">
                            <span
                              className={cx('h-[11px] rounded-r-[4px] transition-[width] duration-500 ease-out', s === 'crm' ? 'bg-crm' : 'bg-buyer')}
                              style={{ width: `${(d[s] / maxVal) * 86}%`, minWidth: d[s] ? 2 : 0 }}
                            />
                            <span className="text-[12px] text-gray-700 tabular">{d[s]}%</span>
                          </span>
                        ))}
                      </span>
                      <span className={cx('flex items-center justify-end gap-0.5 text-[12px] font-medium tabular', emphasis ? 'text-gray-900' : 'text-gray-500')}>
                        {delta > 0 ? <ArrowUpRight size={13} /> : delta < 0 ? <ArrowDownRight size={13} /> : null}
                        {delta > 0 ? '+' : ''}
                        {delta} pts
                      </span>
                    </li>
                  )
                })}
              </ul>
              <div className="relative ml-[160px] mr-[84px] h-6 text-[11px] text-gray-400" aria-hidden>
                {ticks.map((t) => (
                  <span key={t} className="absolute top-1.5 -translate-x-1/2 tabular" style={{ left: `${(t / maxVal) * 86}%` }}>
                    {t}%
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        <p className="mt-1 h-4 text-[11px] text-gray-500" aria-live="polite">
          {hover && !showTable ? (
            (() => {
              const d = data.find((x) => x.key === hover)!
              return (
                <span className="text-gray-700">
                  <strong className="font-semibold text-gray-900">{reasonLabels[d.key]}</strong> · CRM-logged {d.crm}% (~{Math.round((d.crm / 100) * n)} deals) · buyers said {d.interview}% (~
                  {Math.round((d.interview / 100) * n)} deals)
                </span>
              )
            })()
          ) : (
            <>Share of {n} interviewed lost deals · {baseline ? 'last 90 days' : 'current filters'} · each series sums to 100% · hover a reason for detail</>
          )}
        </p>
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Revenue by real reason                                              */
/* ------------------------------------------------------------------ */

function RevenueByReason({ revenue, total, n }: { revenue: { key: ReasonKey; amount: number; count: number }[]; total: number; n: number }) {
  const max = Math.max(...revenue.map((r) => r.amount), 1)
  return (
    <Card className="print-avoid">
      <CardHeader title="$ lost by real reason" subtitle={`Opportunity amount by interview primary reason · ${n} deals · ${fmtK(total)}`} />
      <ul className="space-y-3 px-4 py-4">
        {revenue.map((r, i) => (
          <li key={r.key}>
            <div className="mb-1 flex items-baseline justify-between text-[13px]">
              <span className={cx(i === 0 ? 'font-semibold text-gray-900' : 'text-gray-700')}>{reasonLabels[r.key]}</span>
              <span className="tabular text-gray-900">
                <strong className="font-semibold">{fmtK(r.amount)}</strong>
                <span className="ml-1.5 text-[11px] text-gray-500">
                  {r.count} {r.count === 1 ? 'deal' : 'deals'}
                </span>
              </span>
            </div>
            <div className="h-2 rounded-r-[4px] bg-gray-100" aria-hidden>
              <div className={cx('h-full rounded-r-[4px] transition-[width] duration-500 ease-out', i === 0 ? 'bg-brand-500' : 'bg-brand-200')} style={{ width: `${(r.amount / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Competitor mentions                                                 */
/* ------------------------------------------------------------------ */

function CompetitorMentions({ competitors }: { competitors: { name: string; count: number; netsuite: number }[] }) {
  const max = Math.max(...competitors.map((c) => c.count), 1)
  return (
    <Card className="print-avoid">
      <CardHeader title="Competitor mentions" subtitle="Chosen alternative named in interviews" />
      <ul className="space-y-3.5 px-4 py-4">
        {competitors.map((c) => (
          <li key={c.name}>
            <div className="mb-1 flex items-baseline justify-between text-[13px]">
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="text-gray-900 tabular">
                {c.count} <span className="text-[11px] text-gray-500">{c.count === 1 ? 'mention' : 'mentions'}</span>
              </span>
            </div>
            <div className="h-2 rounded-r-[4px] bg-gray-100" aria-hidden>
              <div className="h-full rounded-r-[4px] bg-gray-500 transition-[width] duration-500" style={{ width: `${(c.count / max) * 100}%` }} />
            </div>
            {c.netsuite > 0 && <div className="mt-1 text-[11px] text-gray-500">NetSuite sync cited in {c.netsuite} of {c.count}</div>}
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Top insights                                                        */
/* ------------------------------------------------------------------ */

function TopInsights() {
  const openCitation = useOpenCitation()
  return (
    <Card className="print-avoid">
      <CardHeader title="Top insights" subtitle="Synthesized from buyer interviews · every insight links to evidence" />
      <div className="grid grid-cols-2 gap-px bg-line">
        {insights.map((i) => (
          <article key={i.id} className="flex flex-col bg-white px-4 py-3.5">
            <h4 className="text-[13px] font-semibold leading-snug text-gray-900">{i.headline}</h4>
            <blockquote className="mt-2 flex-1 border-l-2 border-brand-200 pl-2.5 text-[13px] leading-relaxed text-gray-700">“{i.quote}”</blockquote>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500">
              <span>{i.role}</span>
              <span aria-hidden>·</span>
              <span className="tabular">{fmtMoney(i.amount)}</span>
              {i.competitor && <Badge tone="gray">{i.competitor}</Badge>}
              <span aria-hidden>·</span>
              <span>{i.dealsCited} deals</span>
            </div>
            <button onClick={() => openCitation(i.citationId)} className="no-print mt-2 inline-flex items-center gap-1 self-start text-[12px] font-medium text-brand-600 hover:underline">
              <Play size={12} /> Watch clip
            </button>
          </article>
        ))}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Lost deals list                                                     */
/* ------------------------------------------------------------------ */

const dealCitation: Record<string, string> = {
  'acme-freight': 'acme-0624',
  northwind: 'northwind-0840',
  'harbor-health': 'harbor-0415',
  crestline: 'crestline-0532',
  'orbit-retail': 'orbit-0310',
  ferro: 'ferro-0702',
  pinecrest: 'pinecrest-0605',
  sable: 'sable-0455',
}

function DealsList() {
  const { navigate, filters } = useApp()
  const openCitation = useOpenCitation()
  const deals = applyFilters(filters)
  return (
    <div className="space-y-5 px-8 py-5">
      <FilterBar />
      <Card>
        <CardHeader title="In progress" subtitle="Qualified by the Salesforce trigger, awaiting interview" />
        <table className="w-full text-[13px]">
          <tbody>
            {pendingDeals.map((p) => (
              <tr key={p.account} className="border-b border-line last:border-0">
                <td className="px-4 py-2.5 font-medium text-gray-900">{p.account}</td>
                <td className="px-4 py-2.5 text-gray-700 tabular">{fmtMoney(p.amount)}</td>
                <td className="px-4 py-2.5 text-gray-600">
                  {p.contact} · {p.role}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{p.owner}</td>
                <td className="px-4 py-2.5 text-right">
                  <Badge tone={p.status === 'Owner hold' ? 'amber' : 'blue'} dot>
                    {p.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <CardHeader title="Interviewed" subtitle={`${deals.length} lost deals with completed buyer interviews`} />
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-line text-left text-[12px] text-gray-500">
              <th className="px-4 py-2 font-medium">Account</th>
              <th className="px-4 py-2 text-right font-medium">Amount</th>
              <th className="px-4 py-2 font-medium">CRM reason</th>
              <th className="px-4 py-2 font-medium">Buyer’s primary reason</th>
              <th className="px-4 py-2 font-medium">Chose</th>
              <th className="px-4 py-2 font-medium">Owner</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {deals.map((d) => {
              const mismatch = d.crmReason !== d.interviewReason
              const cite = dealCitation[d.id]
              return (
                <tr
                  key={d.id}
                  className={cx('border-b border-line last:border-0', d.id === 'acme-freight' && 'cursor-pointer hover:bg-gray-50')}
                  onClick={() => d.id === 'acme-freight' && navigate('deal')}
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-900">{d.account}</div>
                    <div className="text-[12px] text-gray-500">
                      {d.contact} · {d.contactRole}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-900 tabular">{fmtMoney(d.amount)}</td>
                  <td className="px-4 py-2.5">
                    <span className={cx('text-gray-700', mismatch && 'text-gray-500 line-through decoration-gray-300')}>{reasonLabels[d.crmReason]}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={cx(mismatch ? 'font-medium text-gray-900' : 'text-gray-700')}>{reasonLabels[d.interviewReason]}</span>
                      {mismatch && <Badge tone="blue">Differs</Badge>}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{d.competitor}</td>
                  <td className="px-4 py-2.5 text-gray-600">{d.owner}</td>
                  <td className="px-4 py-2.5 text-right">
                    {d.id === 'acme-freight' ? (
                      <span className="inline-flex items-center gap-0.5 text-[12px] font-medium text-brand-600">
                        Activity <ChevronRight size={13} />
                      </span>
                    ) : cite ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Quote size={12} />}
                        onClick={(e) => {
                          e.stopPropagation()
                          openCitation(cite)
                        }}
                      >
                        {citations[cite].label.split(', ')[1]}
                      </Button>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
