import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'

export default function Drawer({ isOpen, onClose, title, children, onSubmit, submitting = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/55 backdrop-blur-md z-40"
          />

          {/* Panel */}
          <motion.div
            key="drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="
              fixed right-0 top-0 h-full w-full max-w-md z-50
              flex flex-col
              glass-deep
              border-l border-white/10
              shadow-2xl shadow-black/40
            "
          >
            {/* Gradient hairline on the leading edge */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-400/60 via-violet-500/40 to-transparent" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200/60 dark:border-white/[0.07]">
              <div>
                <div className="h-0.5 w-9 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full mb-2.5 shadow-glow-cyan" />
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-900/5 dark:hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-200/60 dark:border-white/[0.07] flex gap-3">
              <button
                onClick={onClose}
                className="
                  flex-1 px-4 py-2.5 rounded-xl font-medium text-sm
                  border border-gray-200 dark:border-white/10
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-900/5 dark:hover:bg-white/[0.07]
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="
                  shine flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 bg-[length:150%_100%] hover:bg-[position:100%_0]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-300 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40
                "
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                  </span>
                ) : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
