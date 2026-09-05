import { motion } from 'framer-motion'

const ACCENT = {
  cyan:    { icon: 'bg-cyan-500/20 text-cyan-400',    glow: 'shadow-cyan-500/20',   bar: 'from-cyan-400 to-cyan-600' },
  violet:  { icon: 'bg-violet-500/20 text-violet-400', glow: 'shadow-violet-500/20', bar: 'from-violet-400 to-violet-600' },
  emerald: { icon: 'bg-emerald-500/20 text-emerald-400', glow: 'shadow-emerald-500/20', bar: 'from-emerald-400 to-emerald-600' },
  amber:   { icon: 'bg-amber-500/20 text-amber-400',  glow: 'shadow-amber-500/20',  bar: 'from-amber-400 to-amber-600' },
}

export default function StatCard({ title, value, icon: Icon, color = 'cyan', subtitle }) {
  const a = ACCENT[color]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`
        relative overflow-hidden rounded-2xl p-6 cursor-default
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        shadow-lg dark:shadow-2xl ${a.glow}
        transition-shadow duration-300
      `}
    >
      {/* Subtle top gradient line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.bar}`} />

      {/* Background orb */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${a.icon} blur-2xl opacity-40`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <motion.p
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-2 text-4xl font-bold text-gray-900 dark:text-white"
          >
            {value ?? '—'}
          </motion.p>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${a.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  )
}
