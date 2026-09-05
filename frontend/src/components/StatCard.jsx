import { motion } from 'framer-motion'
import { SpotlightCard, AnimatedCounter, MiniBars } from './ui'

const ACCENT = {
  cyan:    { chip: 'from-cyan-400/25 to-cyan-600/5 text-cyan-500 dark:text-cyan-300 ring-cyan-400/30',     bar: 'from-cyan-400 to-cyan-600' },
  violet:  { chip: 'from-violet-400/25 to-violet-600/5 text-violet-500 dark:text-violet-300 ring-violet-400/30', bar: 'from-violet-400 to-violet-600' },
  emerald: { chip: 'from-emerald-400/25 to-emerald-600/5 text-emerald-500 dark:text-emerald-300 ring-emerald-400/30', bar: 'from-emerald-400 to-emerald-600' },
  amber:   { chip: 'from-amber-400/25 to-amber-600/5 text-amber-500 dark:text-amber-300 ring-amber-400/30', bar: 'from-amber-400 to-amber-600' },
}

export default function StatCard({ title, value, icon: Icon, color = 'cyan', subtitle, breakdown }) {
  const a = ACCENT[color] || ACCENT.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <SpotlightCard className="glass glow-hover rounded-2xl p-6 cursor-default h-full">
        {/* Top gradient hairline */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.bar} opacity-70`} />

        {/* Background orb */}
        <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${a.chip.split(' ')[0]} to-transparent blur-2xl opacity-60`} />

        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ring-1 ${a.chip}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>

          <AnimatedCounter
            value={value ?? 0}
            className="block mt-3 font-display text-4xl font-bold text-gray-900 dark:text-white tracking-tight"
          />

          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
          )}

          {breakdown && breakdown.length > 0 && (
            <MiniBars segments={breakdown} />
          )}
        </div>
      </SpotlightCard>
    </motion.div>
  )
}
