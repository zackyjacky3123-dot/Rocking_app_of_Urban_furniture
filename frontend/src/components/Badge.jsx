const STYLES = {
  // Account types
  ASSET:     'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  LIABILITY: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30',
  EXPENSE:   'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30',
  INCOME:    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30',
  CAPITAL:   'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30',
  // Contact types
  CUSTOMER:  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30',
  VENDOR:    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  BOTH:      'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/30',
  // Product types
  GOODS:     'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30',
  SERVICE:   'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30',
  COMBO:     'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/30',
  // Journal types
  SALES:     'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30',
  PURCHASE:  'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  BANK:      'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-500/30',
  CASH:      'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-300 dark:border-yellow-500/30',
}

const DOTS = {
  ASSET: 'bg-emerald-500', LIABILITY: 'bg-red-500', EXPENSE: 'bg-orange-500',
  INCOME: 'bg-cyan-500', CAPITAL: 'bg-violet-500',
  CUSTOMER: 'bg-blue-500', VENDOR: 'bg-amber-500', BOTH: 'bg-pink-500',
  GOODS: 'bg-teal-500', SERVICE: 'bg-indigo-500', COMBO: 'bg-purple-500',
  SALES: 'bg-green-500', PURCHASE: 'bg-rose-500', BANK: 'bg-sky-500', CASH: 'bg-yellow-500',
}

export default function Badge({ type }) {
  const cls = STYLES[type] || 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/15 dark:text-gray-300 dark:border-gray-500/30'
  const dot = DOTS[type] || 'bg-gray-500'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${type ? 'shadow-[0_0_6px_currentColor]' : ''}`} />
      {type}
    </span>
  )
}
