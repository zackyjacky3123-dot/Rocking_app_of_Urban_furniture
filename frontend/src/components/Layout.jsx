import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Search, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import Sidebar from './Sidebar'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/contacts': 'Contacts',
  '/products': 'Products',
  '/journals': 'Journals',
}

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[pathname] || 'Urban Furniture'

  const openPalette = () => window.dispatchEvent(new CustomEvent('uf:open-palette'))

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 glass border-x-0 border-t-0">
          <div>
            <AnimatePresence mode="wait">
              <motion.h1
                key={title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight"
              >
                {title}
              </motion.h1>
            </AnimatePresence>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Urban Furniture Accounting System
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Command palette trigger */}
            <button
              onClick={openPalette}
              className="hidden sm:flex items-center gap-2.5 pl-3.5 pr-2 py-2 rounded-xl text-xs font-medium text-gray-400 dark:text-gray-500 bg-white/60 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 hover:border-cyan-400/40 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 group"
            >
              <Search className="w-3.5 h-3.5" />
              Quick actions…
              <kbd className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-white/[0.07] border border-gray-200 dark:border-white/10 group-hover:border-cyan-400/30 transition-colors">
                Ctrl K
              </kbd>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-xl bg-white/60 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-violet-400/40 transition-all duration-200"
              title="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.25 }}
                  className="block"
                >
                  {theme === 'dark'
                    ? <Sun className="w-5 h-5 text-amber-400" />
                    : <Moon className="w-5 h-5 text-violet-500" />}
                </motion.span>
              </AnimatePresence>
            </button>

            {/* Avatar */}
            <button
              onClick={() => navigate('/')}
              className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-violet-500/25 hover:shadow-violet-500/50 hover:scale-105 transition-all duration-200"
            >
              UF
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white dark:border-[#0b0e1d]" />
            </button>
          </div>
        </header>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
