import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CornerDownLeft, LayoutDashboard, Landmark, Users,
  ShoppingBag, BookOpen, Plus, Command,
} from 'lucide-react'

const COMMANDS = [
  { group: 'Navigate', label: 'Dashboard', icon: LayoutDashboard, to: '/', keywords: 'home overview stats charts' },
  { group: 'Navigate', label: 'Accounts', icon: Landmark, to: '/accounts', keywords: 'ledger chart asset liability income expense capital' },
  { group: 'Navigate', label: 'Contacts', icon: Users, to: '/contacts', keywords: 'customers vendors people directory' },
  { group: 'Navigate', label: 'Products', icon: ShoppingBag, to: '/products', keywords: 'items goods services catalog pricing' },
  { group: 'Navigate', label: 'Journals', icon: BookOpen, to: '/journals', keywords: 'entries sales purchase bank cash debit credit' },
  { group: 'Create', label: 'New Account', icon: Plus, to: '/accounts?new=1', keywords: 'add create account' },
  { group: 'Create', label: 'New Contact', icon: Plus, to: '/contacts?new=1', keywords: 'add create customer vendor' },
  { group: 'Create', label: 'New Product', icon: Plus, to: '/products?new=1', keywords: 'add create item goods service' },
  { group: 'Create', label: 'New Journal', icon: Plus, to: '/journals?new=1', keywords: 'add create entry' },
]

const GROUPS = ['Navigate', 'Create']

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('uf:open-palette', onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('uf:open-palette', onOpen)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setIdx(0)
      const t = setTimeout(() => inputRef.current?.focus(), 80)
      return () => clearTimeout(t)
    }
  }, [open])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter(c =>
      `${c.label} ${c.group} ${c.keywords}`.toLowerCase().includes(q)
    )
  }, [query])

  useEffect(() => { setIdx(0) }, [results.length])

  const run = useCallback((to) => {
    setOpen(false)
    navigate(to)
  }, [navigate])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIdx(i => Math.min(i + 1, results.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIdx(i => Math.max(i - 1, 0))
    }
    if (e.key === 'Enter' && results[idx]) run(results[idx].to)
  }

  // keep the active row visible while arrowing through
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${idx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  let flat = -1

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="palette-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          <motion.div
            key="palette"
            initial={{ opacity: 0, scale: 0.96, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="fixed left-1/2 top-[16vh] -translate-x-1/2 w-full max-w-lg z-[70] px-4"
          >
            <div className="glass-deep rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200/60 dark:border-white/[0.07]">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
                />
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
                {results.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-gray-400">
                    No commands found for “{query}”
                  </div>
                ) : (
                  GROUPS.map(group => {
                    const items = results.filter(r => r.group === group)
                    if (items.length === 0) return null
                    return (
                      <div key={group} className="mb-1">
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                          {group}
                        </p>
                        {items.map(item => {
                          flat += 1
                          const active = flat === idx
                          const myIdx = flat
                          return (
                            <button
                              key={item.label}
                              data-idx={myIdx}
                              onClick={() => run(item.to)}
                              onMouseEnter={() => setIdx(myIdx)}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                                active
                                  ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-gray-900 dark:text-white ring-1 ring-cyan-400/30'
                                  : 'text-gray-600 dark:text-gray-300'
                              }`}
                            >
                              <span className={`p-1.5 rounded-lg ${active ? 'bg-cyan-400/20 text-cyan-500 dark:text-cyan-300' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400'}`}>
                                <item.icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-sm font-medium flex-1">{item.label}</span>
                              {active && <CornerDownLeft className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center gap-4 px-5 py-2.5 border-t border-gray-200/60 dark:border-white/[0.07] text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 font-semibold">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 font-semibold">↵</kbd>
                  select
                </span>
                <span className="ml-auto flex items-center gap-1 text-gray-400">
                  <Command className="w-3 h-3" /> K anywhere
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
