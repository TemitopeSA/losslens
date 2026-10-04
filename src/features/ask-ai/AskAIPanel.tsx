import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowUp, ChevronDown, Plug, Sparkles, X } from 'lucide-react'
import { useApp, useOpenCitation, type ChatMessage } from '../../state/AppState'
import { IconButton, cx } from '../../components/ui'
import { citations, seedQuestion, suggestedQuestions, type AnswerBlock } from '../../data/lossLensData'

export function CitationLink({ id }: { id: string }) {
  const openCitation = useOpenCitation()
  const c = citations[id]
  if (!c) return null
  return (
    <button
      onClick={() => openCitation(id)}
      title={`“${c.quote}”`}
      className="mx-0.5 inline-flex h-[18px] items-center rounded border border-brand-100 bg-brand-50 px-1 align-[1px] text-[11px] font-medium text-brand-700 transition-colors hover:border-brand-200 hover:bg-brand-100"
    >
      [{c.label}]
    </button>
  )
}

function renderBlocks(blocks: AnswerBlock[], budget: number, streaming: boolean) {
  let left = budget
  const out: ReactNode[] = []
  for (let bi = 0; bi < blocks.length && left > 0; bi++) {
    const b = blocks[bi]
    const parts: ReactNode[] = []
    b.runs.forEach((r, ri) => {
      if (left <= 0) return
      if ('cite' in r) {
        parts.push(<CitationLink key={ri} id={r.cite} />)
        left -= 1
        return
      }
      const tokens = r.text.split(/(\s+)/).filter(Boolean)
      const shown = tokens.slice(0, left).join('')
      left -= Math.min(tokens.length, left)
      parts.push(
        r.bold ? (
          <strong key={ri} className="font-semibold text-gray-900">
            {shown}
          </strong>
        ) : (
          <span key={ri}>{shown}</span>
        ),
      )
    })
    const isLast = left <= 0 || bi === blocks.length - 1
    const caret = streaming && isLast ? <span className="caret" /> : null
    if (b.kind === 'item')
      out.push(
        <li key={bi} className="flex gap-2">
          <span className="mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">{b.num}</span>
          <span>
            {parts}
            {caret}
          </span>
        </li>,
      )
    else if (b.kind === 'rec')
      out.push(
        <li key={bi} data-tour="askai-recommendation" className="anim-fade rounded-ctl border border-brand-200 bg-brand-50 px-3 py-2.5 text-brand-900">
          {parts}
          {caret}
        </li>,
      )
    else
      out.push(
        <li key={bi}>
          {parts}
          {caret}
        </li>,
      )
  }
  return out
}

function AssistantMessage({ m, isLatest }: { m: ChatMessage; isLatest: boolean }) {
  const streaming = m.revealed < m.total
  return (
    <div data-tour={isLatest ? 'askai-answer' : undefined} className="anim-rise">
      <div className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-gray-700">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-white">
          <Sparkles size={11} />
        </span>
        Great Question AI
        {streaming && <span className="text-[11px] font-normal text-gray-400">Searching Repository…</span>}
      </div>
      <ul className="space-y-2.5 text-[13px] leading-relaxed text-gray-700">{m.answer && renderBlocks(m.answer.blocks, m.revealed, streaming)}</ul>
      {!streaming && m.answer && <div className="mt-2.5 text-[11px] text-gray-500">Sources: {m.answer.sources}</div>}
    </div>
  )
}

export function AskAIPanel() {
  const { askOpen, setAskOpen, messages, ask, streaming, tour } = useApp()
  const [input, setInput] = useState('')
  const [mcpOpen, setMcpOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  useEffect(() => {
    const box = scrollRef.current
    if (box && !tour.open) box.scrollTop = box.scrollHeight
  }, [messages, tour.open])

  useEffect(() => {
    if (!askOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !tour.open && setAskOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [askOpen, tour.open, setAskOpen])

  const submit = (q: string) => {
    if (streaming || !q.trim()) return
    ask(q)
    setInput('')
  }

  return (
    <aside
      aria-label="Ask AI"
      aria-hidden={!askOpen}
      className={cx(
        'no-print fixed bottom-0 right-0 top-0 z-[45] flex w-[420px] flex-col border-l border-line bg-white shadow-[-12px_0_32px_-16px_rgba(16,24,40,0.18)] transition-transform duration-[250ms] ease-out',
        askOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full',
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-line px-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-500" />
          <h2 className="text-[14px] font-semibold text-gray-900">Ask AI</h2>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-600">Repository · Win/Loss</span>
        </div>
        <IconButton label="Close Ask AI" onClick={() => setAskOpen(false)} tabIndex={askOpen ? 0 : -1}>
          <X size={16} />
        </IconButton>
      </div>

      <div className="shrink-0 border-b border-line bg-gray-50/70">
        <button onClick={() => setMcpOpen((o) => !o)} aria-expanded={mcpOpen} tabIndex={askOpen ? 0 : -1} className="flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] text-gray-600 hover:text-gray-900">
          <Plug size={13} className="text-gray-400" />
          <span>
            <span className="font-medium text-gray-800">Great Question MCP</span> · simulated in this prototype
          </span>
          <ChevronDown size={13} className={cx('ml-auto transition-transform', mcpOpen && 'rotate-180')} />
        </button>
        {mcpOpen && (
          <div className="anim-fade space-y-2 px-4 pb-3 text-[12px] text-gray-600">
            <p>The same cited Repository evidence can be queried from compatible AI assistants through Great Question MCP — so answers about your customers come with sources, not guesses.</p>
            <pre className="overflow-x-auto rounded border border-line bg-white px-2.5 py-2 font-mono text-[11px] text-gray-700">{`search_repository("Spendwise losses")\nget_transcript("acme-freight", "06:24")`}</pre>
            <p className="text-gray-500">No external AI tool is connected. Answers here are scripted from the demo Repository.</p>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="thin-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-[13px] text-gray-600">Ask questions across 17 win/loss interviews, highlights and CRM data. Every answer cites the evidence.</p>
            <button
              data-tour="askai-seed"
              onClick={() => submit(seedQuestion)}
              tabIndex={askOpen ? 0 : -1}
              className="w-full rounded-ctl border border-brand-200 bg-brand-50/60 px-3 py-2.5 text-left text-[13px] font-medium text-brand-800 transition-colors hover:bg-brand-50"
            >
              {seedQuestion}
              <span className="mt-1 block text-[11px] font-normal text-brand-600">Run this question →</span>
            </button>
          </div>
        )}
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-br-sm bg-gray-100 px-3 py-2 text-[13px] text-gray-900">{m.question}</div>
            </div>
          ) : (
            <AssistantMessage key={m.id} m={m} isLatest={m.id === lastAssistant?.id} />
          ),
        )}
        {messages.length > 0 && !streaming && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Follow-ups</div>
            {suggestedQuestions
              .filter((q) => !messages.some((m) => m.question === q))
              .concat(messages.some((m) => m.question === seedQuestion) ? [] : [seedQuestion])
              .slice(0, 3)
              .map((q) => (
                <button key={q} onClick={() => submit(q)} tabIndex={askOpen ? 0 : -1} className="block w-full rounded-ctl border border-line px-3 py-1.5 text-left text-[12px] text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50/50">
                  {q}
                </button>
              ))}
          </div>
        )}
      </div>

      <form
        className="shrink-0 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit(input)
        }}
      >
        <div className="flex items-end gap-2 rounded-ctl border border-line-strong bg-white px-2.5 py-2 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
          <textarea
            aria-label="Ask a question"
            rows={1}
            value={input}
            tabIndex={askOpen ? 0 : -1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit(input)
              }
            }}
            placeholder="Ask about lost deals, competitors, themes…"
            className="max-h-24 min-h-[20px] flex-1 resize-none bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={!input.trim() || streaming}
            tabIndex={askOpen ? 0 : -1}
            className="flex h-6 w-6 items-center justify-center rounded bg-brand-500 text-white transition-colors hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <ArrowUp size={14} />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-gray-400">Scripted demo answers · cites Repository evidence</p>
      </form>
    </aside>
  )
}
