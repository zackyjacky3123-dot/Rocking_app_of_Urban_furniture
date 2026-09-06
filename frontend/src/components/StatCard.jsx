import { ArrowUpRight } from 'lucide-react'
export default function StatCard({ icon: Icon, label, value, hint, tone = 'cyan' }) {
  const accents = { cyan: 'from-cyan-500 to-sky-500', violet: 'from-violet-500 to-fuchsia-500', emerald: 'from-emerald-500 to-teal-500', amber: 'from-amber-500 to-orange-500', rose: 'from-rose-500 to-pink-500' }
  return <div className="glass gradient-border glow-hover rounded-2xl p-4 relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accents[tone] || accents.cyan} flex items-center justify-center text-white shadow-lg`}><Icon size={18}/></div>
      <ArrowUpRight size={16} className="text-slate-400" />
    </div>
    <div className="mt-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</div>
    <div className="mt-1 text-2xl font-black tnum text-slate-900 dark:text-white">{value}</div>
    {hint && <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</div>}
  </div>
}
