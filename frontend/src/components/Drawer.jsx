import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
              bg-white dark:bg-gray-900
              border-l border-gray-200 dark:border-gray-800
              shadow-2xl
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
              <div>
                <div className="h-0.5 w-8 bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full mb-2" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
              {children}
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-800 flex gap-3">
              <button
                onClick={onClose}
                className="
                  flex-1 px-4 py-2.5 rounded-xl font-medium text-sm
                  border border-gray-200 dark:border-gray-700
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="
                  flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm text-white
                  bg-gradient-to-r from-cyan-500 to-violet-600
                  hover:from-cyan-400 hover:to-violet-500
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200 shadow-lg shadow-violet-500/20
                "
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
