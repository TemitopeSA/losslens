import { useMemo, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  Bell,
  Cloud,
  Database,
  Gift,
  Hash,
  History,
  Link2,
  Pause,
  Play,
  Plus,
  Send,
  ShieldCheck,
  Timer,
  Trash2,
  UserX,
  Wallet,
  Zap,
} from 'lucide-react'
import { useApp } from '../../state/AppState'
import { track } from '../../lib/analytics'
import { Badge, Button, Card, CardHeader, IconButton, Modal, PageHeader, Select, Tabs, Toggle, cx, inputClass } from '../../components/ui'
import { incentiveWallet, salesforce, triggerFieldOptions, type TriggerCondition } from '../../data/lossLensData'

/* ------------------------------------------------------------------ */
/* Integrations index                                                  */
/* ------------------------------------------------------------------ */

export function IntegrationsPage() {
  const { navigate, toast, setAskOpen } = useApp()
  const items = [
    { name: 'Salesforce', desc: 'Sync candidates from Contacts and trigger studies from Opportunity events.', status: 'Connected', action: () => navigate('salesforce'), color: '#00A1E0' },
    { name: 'Slack', desc: 'Notify channels about new insights and request deal-owner approvals.', status: 'Connected', action: () => toast('Slack settings are simulated in this prototype', 'info'), color: '#4A154B' },
    { name: 'Zoom', desc: 'Record and transcribe moderated sessions automatically.', status: 'Connected', action: () => toast('Zoom settings are simulated in this prototype', 'info'), color: '#2D8CFF' },
    { name: 'Great Question MCP', desc: 'Let compatible AI tools query cited Repository evidence.', status: 'Available', action: () => setAskOpen(true), color: '#266BD8' },
    { name: 'HubSpot', desc: 'Sync contacts and companies as candidates.', status: 'Not connected', action: () => toast('Connecting HubSpot is not available in this prototype', 'info'), color: '#FF7A59' },
    { name: 'Gmail', desc: 'Send invitations from your team’s domain.', status: 'Not connected', action: () => toast('Connecting Gmail is not available in this prototype', 'info'), color: '#EA4335' },
  ]
  return (
    <>
      <PageHeader title="Integrations" breadcrumbs={[{ label: 'Settings' }, { label: 'Integrations' }]} />
      <div className="grid grid-cols-2 gap-4 px-8 py-6 xl:grid-cols-3">
        {items.map((i) => (
          <Card key={i.name} className="flex flex-col p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-ctl text-[13px] font-bold text-white" style={{ background: i.color }} aria-hidden>
                {i.name[0]}
              </span>
              <span className="text-[14px] font-semibold text-gray-900">{i.name}</span>
              <span className="ml-auto">
                <Badge tone={i.status === 'Connected' ? 'green' : i.status === 'Available' ? 'blue' : 'gray'} dot={i.status === 'Connected'}>
                  {i.status}
                </Badge>
              </span>
            </div>
            <p className="mt-2.5 flex-1 text-[12px] text-gray-600">{i.desc}</p>
            <div className="mt-4">
              <Button size="sm" onClick={i.action} variant={i.name === 'Salesforce' ? 'primary' : 'secondary'}>
                {i.status === 'Not connected' ? 'Connect' : 'Manage'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Salesforce integration                                              */
/* ------------------------------------------------------------------ */

export function SalesforcePage() {
  const { navigate, sfTab, setSfTab, trigger, setTrigger, triggerSaved, setTriggerSaved, toast } = useApp()
  const [activityOpen, setActivityOpen] = useState(false)
  const dirty = JSON.stringify(trigger) !== JSON.stringify(triggerSaved)

  return (
    <>
      <PageHeader
        breadcrumbs={[{ label: 'Settings', onClick: () => navigate('settings') }, { label: 'Integrations', onClick: () => navigate('settings') }, { label: 'Salesforce' }]}
        title={
          <span className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-ctl bg-[#00A1E0] text-white" aria-hidden>
              <Cloud size={15} />
            </span>
            Salesforce
          </span>
        }
        meta={
          <span className="flex items-center gap-2">
            <Badge tone="green" dot>
              Connected
            </Badge>
            <span className="text-[12px] text-gray-500">{salesforce.org} · synced {salesforce.lastSync}</span>
          </span>
        }
        actions={
          sfTab === 'triggers' && (
            <>
              {dirty && <span className="text-[12px] text-amber-700">Unsaved changes</span>}
              <Button icon={<History size={14} />} onClick={() => setActivityOpen(true)}>
                View activity
              </Button>
              <Button
                icon={trigger.active ? <Pause size={14} /> : <Play size={14} />}
                onClick={() => {
                  const next = { ...trigger, active: !trigger.active }
                  setTrigger(next)
                  setTriggerSaved(next)
                  track('trigger_paused', { paused: trigger.active })
                  toast(trigger.active ? 'Trigger paused — no new invitations will be sent' : 'Trigger resumed')
                }}
              >
                {trigger.active ? 'Pause trigger' : 'Resume trigger'}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setTriggerSaved(trigger)
                  track('trigger_saved', { conditions: trigger.conditions.length, slackVeto: trigger.guardrails.slackVeto })
                  toast('Trigger saved · applies to new Closed Lost opportunities')
                }}
              >
                Save trigger
              </Button>
            </>
          )
        }
      >
        <Tabs
          value={sfTab}
          onChange={setSfTab}
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'mapping', label: 'Field mapping' },
            { id: 'triggers', label: 'Triggers', count: 1 },
          ]}
        />
      </PageHeader>

      <div className="px-8 py-6">
        {sfTab === 'overview' && <SalesforceOverview />}
        {sfTab === 'mapping' && <FieldMapping />}
        {sfTab === 'triggers' && <TriggerBuilder />}
      </div>

      <Modal open={activityOpen} onClose={() => setActivityOpen(false)} title="Trigger activity" width={560} footer={<Button onClick={() => setActivityOpen(false)}>Close</Button>}>
        <ol className="divide-y divide-line">
          {salesforce.activity.map((a) => (
            <li key={a.when} className="flex gap-4 px-5 py-3">
              <span className="w-[120px] shrink-0 text-[12px] text-gray-500 tabular">{a.when}</span>
              <span className="text-[13px] text-gray-800">{a.text}</span>
            </li>
          ))}
        </ol>
        <p className="border-t border-line px-5 py-3 text-[12px] text-gray-500">Activity is sample data. This prototype does not read from or write to Salesforce.</p>
      </Modal>
    </>
  )
}

function SalesforceOverview() {
  const { toast, setSfTab } = useApp()
  return (
    <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5">
      <Card>
        <CardHeader title="Connection" subtitle="Great Question reads Contacts, Accounts and Opportunities and writes interview results back." />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 px-4 py-4 text-[13px]">
          {[
            ['Instance', salesforce.org],
            ['Connected by', salesforce.connectedBy],
            ['Connected on', salesforce.connectedOn],
            ['Last sync', salesforce.lastSync],
            ['Objects', salesforce.objects.join(', ')],
            ['Sync direction', 'Read + write-back'],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[12px] text-gray-500">{k}</dt>
              <dd className="mt-0.5 text-gray-900">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex gap-2 border-t border-line px-4 py-3">
          <Button size="sm" onClick={() => toast('Sync requested · 2,184 contacts up to date (simulated)')}>
            Sync now
          </Button>
          <Button size="sm" variant="danger" onClick={() => toast('Disconnect is disabled in this prototype', 'info')}>
            Disconnect
          </Button>
        </div>
      </Card>
      <Card>
        <CardHeader title="Automations" />
        <div className="space-y-3 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-ctl bg-brand-50 text-brand-500">
              <Zap size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-gray-900">Closed Lost → Win/Loss interview</div>
              <div className="text-[12px] text-gray-500">38 invitations · 17 interviews in the last 90 days</div>
            </div>
            <Button size="sm" onClick={() => setSfTab('triggers')}>
              Edit
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

function FieldMapping() {
  return (
    <Card>
      <CardHeader title="Field mapping" subtitle="How Salesforce fields map to Great Question candidates and deals." />
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-line text-left text-[12px] text-gray-500">
            <th className="px-4 py-2 font-medium">Great Question</th>
            <th className="px-4 py-2 font-medium">Salesforce field</th>
            <th className="px-4 py-2 font-medium">Direction</th>
          </tr>
        </thead>
        <tbody>
          {salesforce.fieldMappings.map((m) => (
            <tr key={m.sf} className="border-b border-line last:border-0">
              <td className="px-4 py-2.5 text-gray-900">{m.gq}</td>
              <td className="px-4 py-2.5 font-mono text-[12px] text-gray-700">{m.sf}</td>
              <td className="px-4 py-2.5">
                <Badge tone={m.direction === 'Write' ? 'blue' : 'gray'}>{m.direction === 'Write' ? 'Write-back' : 'Read'}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/* Trigger builder                                                     */
/* ------------------------------------------------------------------ */

function ConditionRow({ c, onChange, onRemove, canRemove }: { c: TriggerCondition; onChange: (c: TriggerCondition) => void; onRemove: () => void; canRemove: boolean }) {
  const opts = triggerFieldOptions[c.field]
  const isAmount = c.field === 'Amount'
  return (
    <div className="flex items-center gap-2">
      <Select
        label="Field"
        className="w-[170px]"
        value={c.field}
        options={Object.keys(triggerFieldOptions)}
        onChange={(field) => {
          const o = triggerFieldOptions[field]
          onChange({ ...c, field, operator: o.operators[0], value: o.values?.[0] ?? '10000' })
        }}
      />
      <Select label="Operator" className="w-[64px]" value={c.operator} options={opts.operators} onChange={(operator) => onChange({ ...c, operator })} />
      {opts.values ? (
        <Select label="Value" className="min-w-0 flex-1" value={c.value} options={opts.values} onChange={(value) => onChange({ ...c, value })} />
      ) : (
        <span className="relative min-w-0 flex-1">
          {isAmount && <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-gray-500">$</span>}
          <input
            aria-label="Amount value"
            inputMode="numeric"
            className={cx(inputClass, 'w-full tabular', isAmount && 'pl-5')}
            value={Number(c.value || 0).toLocaleString('en-US')}
            onChange={(e) => onChange({ ...c, value: e.target.value.replace(/[^0-9]/g, '') })}
          />
        </span>
      )}
      <IconButton label="Remove condition" onClick={onRemove} disabled={!canRemove} className="disabled:opacity-30">
        <Trash2 size={14} />
      </IconButton>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-gray-500">{children}</div>
}

function ThenRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3 py-2">
      <div className="flex items-center gap-2 text-[13px] font-medium text-gray-700">
        <span className="text-gray-400">{icon}</span>
        {label}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function TriggerBuilder() {
  const { trigger, setTrigger, toast } = useApp()
  const set = (patch: Partial<typeof trigger>) => setTrigger((t) => ({ ...t, ...patch }))
  const setGuard = (k: keyof typeof trigger.guardrails, v: boolean) => {
    setTrigger((t) => ({ ...t, guardrails: { ...t.guardrails, [k]: v } }))
  }

  const estimate = useMemo(() => {
    const amountRule = trigger.conditions.find((c) => c.field === 'Amount')
    const threshold = amountRule ? Number(amountRule.value || 0) : 0
    const perMonth = Math.max(1, Math.round(13 * Math.exp(-(Math.max(threshold, 10000) - 10000) / 90000)))
    const completes = Math.round(perMonth * 0.45)
    return { perMonth, spend: completes * trigger.incentive }
  }, [trigger.conditions, trigger.incentive])

  const guardrails: { key: keyof typeof trigger.guardrails; icon: ReactNode; title: string; desc: string }[] = [
    { key: 'slackVeto', icon: <Bell size={15} />, title: 'Notify deal owner in Slack, allow veto for 24h', desc: 'Owners get a message in #deal-desk with Hold / Let it run.' },
    { key: 'frequency', icon: <Timer size={15} />, title: 'Max 1 invite per contact per 90 days', desc: 'Prevents repeat outreach across all Great Question studies.' },
    { key: 'unsubscribes', icon: <UserX size={15} />, title: 'Respect unsubscribes & do-not-contact', desc: 'Honors Salesforce HasOptedOutOfEmail and DoNotCall.' },
  ]

  return (
    <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-start gap-5">
      {/* WHEN / THEN */}
      <Card data-tour="sf-triggers">
        <CardHeader
          icon={<Zap size={15} />}
          title="Closed Lost → Win/Loss interview"
          subtitle="Invite buyers from qualifying lost opportunities to an AI moderated interview."
          actions={
            <Badge tone={trigger.active ? 'green' : 'amber'} dot>
              {trigger.active ? 'Active' : 'Paused'}
            </Badge>
          }
        />
        <div className="px-4 py-4">
          <SectionLabel>When an opportunity matches all</SectionLabel>
          <div className="space-y-2">
            {trigger.conditions.map((c, i) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className="w-9 shrink-0 text-right text-[12px] font-medium text-gray-400">{i === 0 ? 'If' : 'and'}</span>
                <div className="min-w-0 flex-1">
                  <ConditionRow
                    c={c}
                    canRemove={trigger.conditions.length > 1}
                    onChange={(nc) => set({ conditions: trigger.conditions.map((x) => (x.id === c.id ? nc : x)) })}
                    onRemove={() => set({ conditions: trigger.conditions.filter((x) => x.id !== c.id) })}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => set({ conditions: [...trigger.conditions, { id: `c${Date.now()}`, field: 'Region', operator: '=', value: 'North America' }] })}
            className="ml-11 mt-2 inline-flex items-center gap-1 rounded px-1 text-[12px] font-medium text-brand-600 hover:underline"
          >
            <Plus size={13} /> Add condition
          </button>

          <div className="my-4 border-t border-dashed border-line" />

          <SectionLabel>Then</SectionLabel>
          <div className="divide-y divide-line/70">
            <ThenRow icon={<Send size={14} />} label="Invite">
              <Select
                label="Invitee"
                className="w-[300px]"
                value={trigger.invitee}
                options={['Primary Contact on the Opportunity', 'Economic buyer (Contact Role)', 'All Opportunity Contact Roles']}
                onChange={(invitee) => set({ invitee })}
              />
            </ThenRow>
            <ThenRow icon={<Timer size={14} />} label="Wait">
              <input
                aria-label="Days to wait after close"
                type="number"
                min={0}
                max={30}
                value={trigger.waitDays}
                onChange={(e) => set({ waitDays: Math.max(0, Math.min(30, Number(e.target.value))) })}
                className={cx(inputClass, 'w-16 tabular')}
              />
              <span className="text-[13px] text-gray-600">days after close</span>
            </ThenRow>
            <ThenRow icon={<Link2 size={14} />} label="Link to study">
              <Select label="Study" className="w-[300px]" value={trigger.study} options={['Win/Loss — Always-on', 'Card controls concept interviews']} onChange={(study) => set({ study })} />
            </ThenRow>
            <ThenRow icon={<Gift size={14} />} label="Incentive">
              <Select label="Incentive amount" className="w-[92px]" value={`$${trigger.incentive}`} options={['$50', '$75', '$100']} onChange={(v) => set({ incentive: Number(v.slice(1)) })} />
              <span className="text-[13px] text-gray-600">gift card · paid from</span>
              <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-medium text-gray-700">
                <Wallet size={12} /> Incentives wallet
              </span>
              <span className="text-[12px] text-gray-500 tabular">Balance ${incentiveWallet.balance.toLocaleString()}</span>
            </ThenRow>
          </div>
        </div>
        <div className="flex items-center gap-2 border-t border-line bg-gray-50/70 px-4 py-2.5 text-[12px] text-gray-600">
          <Database size={13} className="text-gray-400" />
          <span>
            ≈<strong className="font-semibold text-gray-900 tabular">{estimate.perMonth}</strong> qualifying deals / month · ≈<strong className="font-semibold text-gray-900 tabular">${estimate.spend}</strong> incentives / month at 45% response
          </span>
        </div>
      </Card>

      <div className="space-y-5">
        {/* Guardrails */}
        <Card data-tour="sf-guardrails" className="border-emerald-200/80">
          <CardHeader icon={<ShieldCheck size={15} className="text-emerald-600" />} title="Guardrails" subtitle="Protect buyer relationships and keep sales in control." />
          <ul className="divide-y divide-line">
            {guardrails.map((g) => (
              <li key={g.key} className="flex items-start gap-3 px-4 py-3">
                <span className={cx('mt-0.5', trigger.guardrails[g.key] ? 'text-emerald-600' : 'text-gray-400')}>{g.icon}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-gray-900">{g.title}</div>
                  <div className="text-[12px] text-gray-500">{g.desc}</div>
                  {!trigger.guardrails[g.key] && <div className="mt-1 text-[12px] font-medium text-amber-700">Off — not recommended</div>}
                </div>
                <Toggle label={g.title} checked={trigger.guardrails[g.key]} onChange={(v) => setGuard(g.key, v)} />
              </li>
            ))}
            <li className="flex items-start gap-3 px-4 py-3">
              <span className={cx('mt-0.5', trigger.guardrails.cap ? 'text-emerald-600' : 'text-gray-400')}>
                <Wallet size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-gray-900">Monthly incentive cap</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[13px] text-gray-500">$</span>
                    <input
                      aria-label="Monthly incentive cap"
                      disabled={!trigger.guardrails.cap}
                      className={cx(inputClass, 'h-7 w-24 pl-5 tabular disabled:bg-gray-50 disabled:text-gray-400')}
                      value={trigger.monthlyCap.toLocaleString('en-US')}
                      onChange={(e) => set({ monthlyCap: Number(e.target.value.replace(/[^0-9]/g, '')) })}
                    />
                  </span>
                  <span className="text-[12px] text-gray-500 tabular">
                    ${incentiveWallet.spentThisMonth} used this month
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100" aria-hidden>
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(100, (incentiveWallet.spentThisMonth / Math.max(1, trigger.monthlyCap)) * 100)}%` }} />
                </div>
              </div>
              <Toggle label="Monthly incentive cap" checked={trigger.guardrails.cap} onChange={(v) => setGuard('cap', v)} />
            </li>
          </ul>
        </Card>

        {/* Write-back */}
        <Card data-tour="sf-writeback">
          <CardHeader
            icon={<ArrowRight size={15} />}
            title="Salesforce write-back"
            subtitle="Write interview results to the Opportunity."
            actions={<Toggle label="Salesforce write-back" checked={trigger.writeback} onChange={(writeback) => setTrigger((t) => ({ ...t, writeback }))} />}
          />
          <div className={cx('space-y-2 px-4 py-3 transition-opacity', !trigger.writeback && 'opacity-50')}>
            {[
              { gq: 'Interview status', sf: 'Interview_Status__c', sample: 'Completed' },
              { gq: 'Primary loss reason', sf: 'GQ_Primary_Loss_Reason__c', sample: 'Missing NetSuite integration' },
            ].map((f) => (
              <div key={f.sf} className="grid grid-cols-[minmax(0,1fr)_16px_minmax(0,1.3fr)] items-center gap-2">
                <span className="truncate rounded-ctl border border-line bg-gray-50 px-2.5 py-1.5 text-[12px] text-gray-700">{f.gq}</span>
                <ArrowRight size={13} className="text-gray-400" aria-hidden />
                <span className="truncate rounded-ctl border border-line bg-white px-2.5 py-1.5 font-mono text-[12px] text-gray-900" title={`Example: ${f.sample}`}>
                  {f.sf}
                </span>
              </div>
            ))}
            <p className="pt-1 text-[12px] text-gray-500">
              Example from Acme Freight: <span className="font-mono text-gray-700">GQ_Primary_Loss_Reason__c</span> = Missing NetSuite integration
            </p>
          </div>
          {!trigger.writeback && (
            <div className="border-t border-line px-4 py-2 text-[12px] text-amber-700">Write-back is off. Findings will stay in Great Question only.</div>
          )}
          <div className="flex items-center gap-1.5 border-t border-line px-4 py-2 text-[11px] text-gray-500">
            <Hash size={12} /> Simulated — this prototype never writes to Salesforce.
            <button className="ml-auto font-medium text-brand-600 hover:underline" onClick={() => toast('Test write-back previewed for Acme Freight (no data sent)', 'info')}>
              Preview test
            </button>
          </div>
        </Card>
      </div>
    </div>
  )
}
