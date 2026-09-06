import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

export default function Modal({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Archive', loading = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50"
          />

          {/* Dialog */}
          <motion.div
            key="modal-dialog"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-sm glass-deep rounded-2xl shadow-2xl shadow-black/40 p-6 relative overflow-hidden">
              {/* Top gradient hairline */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-rose-500 to-fuchsia-500 opacity-80" />

              {/* Icon + close */}
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-amber-500/30 blur-md" />
                  <div className="relative p-3 rounded-xl bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-900/5 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                    border border-gray-200 dark:border-white/10
                    text-gray-600 dark:text-gray-300
                    hover:bg-gray-900/5 dark:hover:bg-white/[0.07]
                    transition-colors
                  "
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="
                    shine flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-amber-500 to-rose-500
                    hover:from-amber-400 hover:to-rose-400
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40
                  "
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Working…
                    </span>
                  ) : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
