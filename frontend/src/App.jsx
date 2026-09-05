import { Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Layout from './components/Layout'
import CommandPalette from './components/CommandPalette'
import Dashboard from './pages/Dashboard'
import Accounts from './pages/Accounts'
import Contacts from './pages/Contacts'
import Products from './pages/Products'
import Journals from './pages/Journals'

function AuroraBackground() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora-blob aurora-1" />
      <div className="aurora-blob aurora-2" />
      <div className="aurora-blob aurora-3" />
      <div className="absolute inset-0 bg-grid mask-fade-b" />
      <div className="absolute inset-0 noise opacity-[0.035]" />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen">
      <AuroraBackground />

      <div className="relative z-10">
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <Routes location={location}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/products" element={<Products />} />
                <Route path="/journals" element={<Journals />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Layout>
      </div>

      <CommandPalette />
    </div>
  )
}
