import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Archive, Search, LayoutGrid, List } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { getContacts, createContact, updateContact, archiveContact } from '../api/contacts'

const TYPES = ['CUSTOMER', 'VENDOR', 'BOTH']
const EMPTY = { name: '', type: 'CUSTOMER', email: '', mobile: '', city: '', state: '', pincode: '', profile_image: '' }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function TI({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    />
  )
}

function SI({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Avatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
  const colors = ['from-cyan-400 to-blue-500', 'from-violet-400 to-purple-600', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {initials || '?'}
    </div>
  )
}

export default function Contacts() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [archiving, setArchiving] = useState(false)

  const fetch = async () => {
    try { const res = await getContacts(); setContacts(res.data) }
    catch { toast.error('Failed to load contacts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setDrawerOpen(true) }
  const openEdit = (c) => { setForm({ name: c.name, type: c.type, email: c.email || '', mobile: c.mobile || '', city: c.city || '', state: c.state || '', pincode: c.pincode || '', profile_image: c.profile_image || '' }); setEditItem(c); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null) }
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    setSubmitting(true)
    try {
      const payload = { ...form, email: form.email || null, mobile: form.mobile || null, city: form.city || null, state: form.state || null, pincode: form.pincode || null, profile_image: form.profile_image || null }
      if (editItem) { await updateContact(editItem.id, payload); toast.success('Contact updated!') }
      else { await createContact(payload); toast.success('Contact created!') }
      closeDrawer(); fetch()
    } catch (err) { toast.error(err.response?.data?.detail || 'Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try { await archiveContact(archiveTarget.id); toast.success('Contact archived'); setArchiveTarget(null); fetch() }
    catch { toast.error('Failed to archive') }
    finally { setArchiving(false) }
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.type.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.city || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('table')} className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-violet-500/20 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> New Contact
          </motion.button>
        </div>
      </div>

      {/* Grid View */}
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-36 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-gray-400 text-sm">
                {search ? 'No contacts match your search.' : 'No contacts yet. Create your first one!'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -3 }}
                    className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{c.name}</p>
                          <Badge type={c.type} />
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setArchiveTarget(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-400">
                      {c.email && <p>✉ {c.email}</p>}
                      {c.mobile && <p>📱 {c.mobile}</p>}
                      {(c.city || c.state) && <p>📍 {[c.city, c.state].filter(Boolean).join(', ')}</p>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Table View */
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {['ID', 'Name', 'Type', 'Email', 'Mobile', 'City', 'Actions'].map(h => (
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? [...Array(4)].map((_, i) => (
                    <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>)}</tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No contacts found.</td></tr>
                  ) : filtered.map((c, i) => (
                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{c.id}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={c.name} />
                          <span className="font-semibold text-gray-900 dark:text-white">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><Badge type={c.type} /></td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.email || '—'}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.mobile || '—'}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">{c.city || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(c)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => setArchiveTarget(c)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><Archive className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                {filtered.length} contact{filtered.length !== 1 ? 's' : ''}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={editItem ? 'Edit Contact' : 'New Contact'} onSubmit={handleSubmit} submitting={submitting}>
        <Field label="Full Name"><TI value={form.name} onChange={set('name')} placeholder="e.g. Rahul Sharma" /></Field>
        <Field label="Contact Type"><SI value={form.type} onChange={set('type')} options={TYPES} /></Field>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Contact Details</p>
          <div className="space-y-4">
            <Field label="Email"><TI value={form.email} onChange={set('email')} placeholder="email@example.com" type="email" /></Field>
            <Field label="Mobile"><TI value={form.mobile} onChange={set('mobile')} placeholder="+91 98765 43210" /></Field>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Address</p>
          <div className="space-y-4">
            <Field label="City"><TI value={form.city} onChange={set('city')} placeholder="Mumbai" /></Field>
            <Field label="State"><TI value={form.state} onChange={set('state')} placeholder="Maharashtra" /></Field>
            <Field label="Pincode"><TI value={form.pincode} onChange={set('pincode')} placeholder="400001" /></Field>
          </div>
        </div>
      </Drawer>

      {/* Archive Modal */}
      <Modal isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive} loading={archiving}
        title="Archive Contact" message={`Are you sure you want to archive "${archiveTarget?.name}"?`} confirmLabel="Archive"
      />
    </div>
  )
}
