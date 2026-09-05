import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            key="modal-dialog"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="
              fixed inset-0 flex items-center justify-center z-50 p-4
              pointer-events-none
            "
          >
            <div className="
              pointer-events-auto
              w-full max-w-sm
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              rounded-2xl shadow-2xl p-6
            ">
              {/* Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                    border border-gray-200 dark:border-gray-700
                    text-gray-600 dark:text-gray-300
                    hover:bg-gray-50 dark:hover:bg-gray-800
                    transition-colors
                  "
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className="
                    flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white
                    bg-gradient-to-r from-amber-500 to-rose-500
                    hover:from-amber-400 hover:to-rose-400
                    disabled:opacity-60 disabled:cursor-not-allowed
                    transition-all duration-200 shadow-lg shadow-rose-500/20
                  "
                >
                  {loading ? 'Processing...' : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
