export default function Badge({ children, tone = 'neutral' }) {
  const map = {
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 ring-slate-400/20',
    cyan: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 ring-cyan-400/20',
    green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-400/20',
    red: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-400/20',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-400/20',
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-400/20',
  }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ring-1 ${map[tone] || map.neutral}`}>{children}</span>
}
