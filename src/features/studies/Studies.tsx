import { useState } from 'react'
import { ArrowDown, ArrowUp, Bot, Copy, Eye, EyeOff, FlaskConical, Languages, Monitor, Plus, Target, Timer, Trash2 } from 'lucide-react'
import { useApp } from '../../state/AppState'
import { Badge, Button, Card, CardHeader, IconButton, Modal, PageHeader, Select, Tabs, Toggle, cx } from '../../components/ui'
import { alwaysOnStudy, lostDeals, pendingDeals, studies } from '../../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Studies list                                                        */
/* ------------------------------------------------------------------ */

export function StudiesPage() {
  const { navigate, toast } = useApp()
  const [tab, setTab] = useState<'all' | 'live' | 'draft' | 'closed'>('all')
  const rows = studies.filter((s) => tab === 'all' || s.status.toLowerCase() === tab)
  return (
    <>
      <PageHeader
        title="Studies"
        actions={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => toast('New study creation is outside this prototype’s scope', 'info')}>
            New study
          </Button>
        }
      >
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'all', label: 'All', count: studies.length },
            { id: 'live', label: 'Live', count: studies.filter((s) => s.status === 'Live').length },
            { id: 'draft', label: 'Draft' },
            { id: 'closed', label: 'Closed' },
          ]}
        />
      </PageHeader>
      <div className="px-8 py-6">
        <Card>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line text-left text-[12px] text-gray-500">
                <th className="px-4 py-2 font-medium">Study</th>
                <th className="px-4 py-2 font-medium">Method</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Participants</th>
                <th className="px-4 py-2 font-medium">Owner</th>
                <th className="px-4 py-2 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr
                  key={s.id}
                  className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-gray-50"
                  onClick={() => (s.id === alwaysOnStudy.id ? navigate('study') : toast(`“${s.title}” is sample data — open Win/Loss — Always-on to explore Studio`, 'info'))}
                >
                  <td className="px-4 py-2.5">
                    <span className="flex items-center gap-2 font-medium text-gray-900">
                      <FlaskConical size={14} className="text-gray-400" />
                      {s.title}
                      {s.id === alwaysOnStudy.id && <Badge tone="blue">Win/Loss</Badge>}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">{s.method}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={s.status === 'Live' ? 'green' : s.status === 'Draft' ? 'gray' : 'violet'} dot>
                      {s.id === alwaysOnStudy.id ? 'Live · always-on' : s.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-gray-700 tabular">{s.participants}</td>
                  <td className="px-4 py-2.5 text-gray-600">{s.owner}</td>
                  <td className="px-4 py-2.5 text-gray-500">{s.updated}</td>
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
/* Study Studio                                                        */
/* ------------------------------------------------------------------ */

export function StudyStudio() {
  const { navigate, study, toast } = useApp()
  const [tab, setTab] = useState<'studio' | 'participants' | 'results'>('studio')
  const [previewOpen, setPreviewOpen] = useState(false)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Studies', onClick: () => navigate('studies') }, { label: alwaysOnStudy.title }]}
        title={alwaysOnStudy.title}
        meta={
          <span className="flex items-center gap-2">
            <Badge tone="blue">
              <Bot size={12} /> {alwaysOnStudy.method}
            </Badge>
            <span className="inline-flex h-5 items-center gap-1.5 rounded-full bg-emerald-50 px-2 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-100">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live · always-on
            </span>
          </span>
        }
        actions={
          <>
            <Button
              icon={<Copy size={14} />}
              onClick={() => {
                navigator.clipboard?.writeText('https://ledgerly.greatquestion.co/s/win-loss').catch(() => undefined)
                toast('Study link copied')
              }}
            >
              Copy link
            </Button>
            <Button icon={<Eye size={14} />} onClick={() => setPreviewOpen(true)}>
              Preview as participant
            </Button>
            <Button variant="primary" onClick={() => toast('Study changes published · applies to new invitations')}>
              Publish changes
            </Button>
          </>
        }
      >
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'studio', label: 'Studio' },
            { id: 'participants', label: 'Participants', count: alwaysOnStudy.invited },
            { id: 'results', label: 'Results', count: alwaysOnStudy.completed },
          ]}
        />
      </PageHeader>

      <div className="grid grid-cols-4 divide-x divide-line border-b border-line bg-white">
        {[
          ['Invited', alwaysOnStudy.invited.toString(), 'from Salesforce trigger'],
          ['Completed', alwaysOnStudy.completed.toString(), 'AI moderated interviews'],
          ['Response rate', `${alwaysOnStudy.responseRate}%`, 'last 90 days'],
          ['Avg. length', '13m 50s', `target ${study.length} min`],
        ].map(([k, v, s]) => (
          <div key={k} className="px-8 py-3">
            <div className="text-[12px] text-gray-500">{k}</div>
            <div className="flex items-baseline gap-2">
              <span className="text-[20px] font-semibold tracking-tight text-gray-900 tabular">{v}</span>
              <span className="text-[11px] text-gray-500">{s}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="px-8 py-6">
        {tab === 'studio' && <StudioEditor />}
        {tab === 'participants' && <ParticipantsTab />}
        {tab === 'results' && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="text-[13px] font-semibold text-gray-900">17 interviews in the Repository</div>
              <p className="mt-1 text-[12px] text-gray-600">Transcripts, highlights and AI summaries for every completed interview.</p>
              <Button className="mt-3" size="sm" onClick={() => navigate('repository')}>
                Open Repository
              </Button>
            </Card>
            <Card className="p-4">
              <div className="text-[13px] font-semibold text-gray-900">Win/Loss analysis</div>
              <p className="mt-1 text-[12px] text-gray-600">Compare CRM loss reasons with what buyers actually said.</p>
              <Button className="mt-3" size="sm" variant="primary" onClick={() => navigate('win-loss')}>
                Open Win/Loss
              </Button>
            </Card>
          </div>
        )}
      </div>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Participant preview" width={480} footer={<Button onClick={() => setPreviewOpen(false)}>Close preview</Button>}>
        <div className="bg-gray-50 p-5">
          <div className="rounded-lg border border-line bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white">
                <Bot size={17} />
              </span>
              <div>
                <div className="text-[13px] font-semibold text-gray-900">{study.concealed ? 'Moderator' : 'Ledgerly Research'}</div>
                <div className="text-[11px] text-gray-500">{study.concealed ? 'Independent research interview' : 'Ledgerly · AI moderated interview'}</div>
              </div>
            </div>
            <p className="mt-4 text-[13px] leading-relaxed text-gray-700">
              Hi Dana — thanks for joining. I’d like to hear about a recent software decision your team made. This takes about {study.length} minutes, and there are no right or wrong answers.
            </p>
            <p className="mt-3 text-[13px] font-medium text-gray-900">{study.guide[0]}</p>
            <div className="mt-4 flex items-center gap-2 text-[11px] text-gray-500">
              <Monitor size={12} /> Screen share {study.screenShare ? 'requested' : 'not required'} · {study.language}
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-gray-500">{study.concealed ? 'Concealed identity is on — no Ledgerly branding is shown.' : 'Concealed identity is off — participants see Ledgerly branding.'}</p>
        </div>
      </Modal>
    </>
  )
}

function StudioEditor() {
  const { study, setStudy } = useApp()
  const [selected, setSelected] = useState<number | null>(null)
  const flexLabel = alwaysOnStudy.flexibilityLabels[study.flexibility]

  const updateQ = (i: number, text: string) => setStudy((s) => ({ ...s, guide: s.guide.map((q, j) => (j === i ? text : q)) }))
  const move = (i: number, d: -1 | 1) =>
    setStudy((s) => {
      const g = [...s.guide]
      const j = i + d
      if (j < 0 || j >= g.length) return s
      ;[g[i], g[j]] = [g[j], g[i]]
      setSelected(j)
      return { ...s, guide: g }
    })

  return (
    <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)] items-start gap-5">
      <div className="space-y-5">
        <Card>
          <CardHeader icon={<Target size={15} />} title="Research goal" subtitle="The AI moderator uses this to decide when and how to probe." />
          <div className="p-4">
            <textarea
              aria-label="Research goal"
              rows={2}
              value={study.goal}
              onChange={(e) => setStudy((s) => ({ ...s, goal: e.target.value }))}
              className="w-full resize-none rounded-ctl border border-line-strong px-3 py-2 text-[14px] leading-relaxed text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Discussion guide"
            subtitle={`${study.guide.length} questions · the moderator asks follow-ups based on ${flexLabel.toLowerCase()} flexibility`}
            actions={
              <Button
                size="sm"
                icon={<Plus size={13} />}
                onClick={() => {
                  setStudy((s) => ({ ...s, guide: [...s.guide, 'New question'] }))
                  setSelected(study.guide.length)
                }}
              >
                Add question
              </Button>
            }
          />
          <ol className="divide-y divide-line">
            {study.guide.map((q, i) => {
              const isSel = selected === i
              return (
                <li
                  key={i}
                  className={cx('group flex items-start gap-3 px-4 py-2.5 transition-colors', isSel ? 'bg-brand-50/50' : 'hover:bg-gray-50')}
                  onClick={() => setSelected(i)}
                >
                  <span className={cx('mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', isSel ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-600')}>{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    {isSel ? (
                      <textarea
                        aria-label={`Question ${i + 1}`}
                        autoFocus
                        rows={2}
                        value={q}
                        onChange={(e) => updateQ(i, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            setSelected(null)
                          }
                        }}
                        className="w-full resize-none rounded-ctl border border-brand-500 bg-white px-2.5 py-1.5 text-[13px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    ) : (
                      <button className="w-full text-left text-[13px] leading-relaxed text-gray-900" aria-label={`Edit question ${i + 1}`}>
                        {q}
                      </button>
                    )}
                    {i === 3 && !isSel && <div className="mt-0.5 text-[11px] text-gray-500">Probe · repeats until the story is complete</div>}
                  </div>
                  <div className={cx('flex shrink-0 items-center transition-opacity', isSel ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100')}>
                    <IconButton label="Move up" onClick={(e) => (e.stopPropagation(), move(i, -1))} disabled={i === 0} className="disabled:opacity-30">
                      <ArrowUp size={14} />
                    </IconButton>
                    <IconButton label="Move down" onClick={(e) => (e.stopPropagation(), move(i, 1))} disabled={i === study.guide.length - 1} className="disabled:opacity-30">
                      <ArrowDown size={14} />
                    </IconButton>
                    <IconButton
                      label="Remove question"
                      onClick={(e) => {
                        e.stopPropagation()
                        setStudy((s) => ({ ...s, guide: s.guide.filter((_, j) => j !== i) }))
                        setSelected(null)
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </li>
              )
            })}
          </ol>
        </Card>
      </div>

      <Card data-tour="study-settings">
        <CardHeader icon={<Bot size={15} />} title="AI moderator" subtitle="Runs interviews 24/7 — no researcher needs to be available." />
        <div className="space-y-5 px-4 py-4">
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="flex" className="text-[13px] font-medium text-gray-900">
                Moderator flexibility
              </label>
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[12px] font-medium text-brand-700">{flexLabel}</span>
            </div>
            <input
              id="flex"
              type="range"
              min={0}
              max={4}
              step={1}
              value={study.flexibility}
              onChange={(e) => setStudy((s) => ({ ...s, flexibility: Number(e.target.value) }))}
              className="gq-range mt-3"
              style={{ ['--fill' as string]: `${(study.flexibility / 4) * 100}%` }}
              aria-valuetext={flexLabel}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-500">
              <span>Scripted</span>
              <span>Exploratory</span>
            </div>
          </div>

          <div data-tour="study-concealed" className={cx('-mx-2 rounded-ctl border px-3 py-3 transition-colors', study.concealed ? 'border-brand-100 bg-brand-50/50' : 'border-line')}>
            <div className="flex items-start gap-3">
              <span className={cx('mt-0.5', study.concealed ? 'text-brand-500' : 'text-gray-400')}>{study.concealed ? <EyeOff size={15} /> : <Eye size={15} />}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-gray-900">Concealed identity</div>
                <div className="mt-0.5 text-[12px] text-gray-600">
                  {study.concealed ? (
                    <>
                      The moderator appears as <strong className="font-medium text-gray-900">“Moderator”</strong> and Ledgerly branding is hidden from the participant.
                    </>
                  ) : (
                    'Participants will see Ledgerly’s name and branding. Buyers may be less candid.'
                  )}
                </div>
              </div>
              <Toggle label="Concealed identity" checked={study.concealed} onChange={(concealed) => setStudy((s) => ({ ...s, concealed }))} />
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Monitor size={15} className="mt-0.5 text-gray-400" />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-gray-900">Screen share</div>
              <div className="text-[12px] text-gray-500">{study.screenShare ? 'Participants are asked to share their screen.' : 'Not needed for win/loss conversations.'}</div>
            </div>
            <Toggle label="Screen share" checked={study.screenShare} onChange={(screenShare) => setStudy((s) => ({ ...s, screenShare }))} />
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-gray-700">
                <Timer size={13} className="text-gray-400" /> Interview length
              </div>
              <Select label="Interview length" className="w-full" value={`${study.length} minutes`} options={['10 minutes', '15 minutes', '20 minutes', '30 minutes']} onChange={(v) => setStudy((s) => ({ ...s, length: parseInt(v) }))} />
            </div>
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-gray-700">
                <Languages size={13} className="text-gray-400" /> Language
              </div>
              <Select label="Language" className="w-full" value={study.language} options={['English', 'Spanish', 'French', 'German']} onChange={(language) => setStudy((s) => ({ ...s, language }))} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function ParticipantsTab() {
  const { navigate } = useApp()
  const rows = [
    ...pendingDeals.map((p) => ({ name: p.contact, role: p.role, account: p.account, status: p.status as string, date: p.closedOn, link: false })),
    ...lostDeals.slice(0, 9).map((d) => ({ name: d.contact, role: d.contactRole, account: d.account, status: 'Completed', date: d.closedOn, link: d.id === 'acme-freight' })),
  ]
  return (
    <Card>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-[12px] text-gray-500">
            <th className="px-4 py-2 font-medium">Participant</th>
            <th className="px-4 py-2 font-medium">Account</th>
            <th className="px-4 py-2 font-medium">Status</th>
            <th className="px-4 py-2 font-medium">Opportunity closed</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5">
                <div className="font-medium text-gray-900">{r.name}</div>
                <div className="text-[12px] text-gray-500">{r.role}</div>
              </td>
              <td className="px-4 py-2.5 text-gray-700">{r.account}</td>
              <td className="px-4 py-2.5">
                <Badge tone={r.status === 'Completed' ? 'green' : r.status === 'Owner hold' ? 'amber' : 'blue'} dot>
                  {r.status}
                </Badge>
              </td>
              <td className="px-4 py-2.5 text-gray-500">{r.date}</td>
              <td className="px-4 py-2.5 text-right">
                {r.link && (
                  <Button size="sm" variant="ghost" onClick={() => navigate('interview')}>
                    View interview
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-line px-4 py-2 text-[12px] text-gray-500">Showing 12 of 38 participants</div>
    </Card>
  )
}
