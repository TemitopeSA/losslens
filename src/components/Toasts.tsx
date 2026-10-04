import { CircleCheck, Info } from 'lucide-react'
import { useApp } from '../state/AppState'

export function Toasts() {
  const { toasts } = useApp()
  return (
    <div className="no-print pointer-events-none fixed bottom-5 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="anim-rise flex items-center gap-2 rounded-ctl bg-gray-900 px-3.5 py-2 text-[13px] text-white shadow-lg">
          {t.tone === 'info' ? <Info size={15} className="text-gray-300" /> : <CircleCheck size={15} className="text-emerald-400" />}
          {t.text}
        </div>
      ))}
    </div>
  )
}
