import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Landmark, Users, ShoppingBag, BookOpen,
  ChevronLeft, ChevronRight, Sofa,
} from 'lucide-react'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',  to: '/',         end: true },
  { icon: Landmark,        label: 'Accounts',   to: '/accounts'  },
  { icon: Users,           label: 'Contacts',   to: '/contacts'  },
  { icon: ShoppingBag,     label: 'Products',   to: '/products'  },
  { icon: BookOpen,        label: 'Journals',   to: '/journals'  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: 'spring', damping: 28, stiffness: 280 }}
      className="
        relative flex-shrink-0 flex flex-col
        glass border-y-0 border-l-0
        overflow-hidden h-screen sticky top-0
      "
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-200/60 dark:border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 blur-md opacity-50" />
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Sofa className="w-5 h-5 text-white" />
          </div>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <p className="font-display text-sm font-bold text-gray-900 dark:text-white leading-tight whitespace-nowrap">
                Urban Furniture
              </p>
              <p className="text-[10px] font-semibold tracking-[0.16em] text-cyan-500/80 dark:text-cyan-400/80 whitespace-nowrap">
                ACCOUNTING 2026
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {NAV.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-900/[0.04] dark:hover:bg-white/[0.05]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/[0.14] via-indigo-500/[0.10] to-violet-500/[0.14] ring-1 ring-cyan-400/25 dark:ring-cyan-400/30"
                  />
                )}
                <Icon
                  className={`relative w-5 h-5 flex-shrink-0 transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-500 dark:text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                      : 'group-hover:scale-110'
                  }`}
                />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative text-sm font-semibold whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <motion.span
                    layoutId="activeBar"
                    className="relative ml-auto w-1 h-5 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500 shadow-glow-cyan flex-shrink-0"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Status + collapse */}
      <div className="px-2.5 py-4 border-t border-gray-200/60 dark:border-white/[0.06] space-y-3">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
                All systems online
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center p-2.5 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-900/[0.04] dark:hover:bg-white/[0.06] transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
