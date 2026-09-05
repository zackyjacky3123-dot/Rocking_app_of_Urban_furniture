import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { getJournals, createJournal, updateJournal, archiveJournal } from '../api/journals'
import { getAccounts } from '../api/accounts'

const TYPES = ['SALES', 'PURCHASE', 'BANK', 'CASH']
const EMPTY = { name: '', type: 'SALES', default_debit_account_id: '', default_credit_account_id: '' }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}
function TI({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    />
  )
}
function SI({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
      ))}
    </select>
  )
}

export default function Journals() {
  const [journals, setJournals] = useState([])
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [archiving, setArchiving] = useState(false)

  const fetchAll = async () => {
    try {
      const [j, a] = await Promise.all([getJournals(), getAccounts()])
      setJournals(j.data)
      setAccounts(a.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setDrawerOpen(true) }
  const openEdit = (j) => {
    setForm({ name: j.name, type: j.type, default_debit_account_id: String(j.default_debit_account_id), default_credit_account_id: String(j.default_credit_account_id) })
    setEditItem(j); setDrawerOpen(true)
  }
  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null) }
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.default_debit_account_id) return toast.error('Debit account is required')
    if (!form.default_credit_account_id) return toast.error('Credit account is required')
    setSubmitting(true)
    try {
      const payload = { ...form, default_debit_account_id: parseInt(form.default_debit_account_id), default_credit_account_id: parseInt(form.default_credit_account_id) }
      if (editItem) { await updateJournal(editItem.id, payload); toast.success('Journal updated!') }
      else { await createJournal(payload); toast.success('Journal created!') }
      closeDrawer(); fetchAll()
    } catch (err) { toast.error(err.response?.data?.detail || 'Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try { await archiveJournal(archiveTarget.id); toast.success('Journal archived'); setArchiveTarget(null); fetchAll() }
    catch { toast.error('Failed to archive') }
    finally { setArchiving(false) }
  }

  const accountName = (id) => accounts.find(a => a.id === id)?.name || `#${id}`

  const filtered = journals.filter(j =>
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search journals…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
          />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-violet-500/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> New Journal
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                {['ID', 'Journal Name', 'Type', 'Default Debit', 'Default Credit', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No journals match your search.' : 'No journals yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((j, i) => (
                  <motion.tr key={j.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{j.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{j.name}</td>
                    <td className="px-6 py-4"><Badge type={j.type} /></td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-medium">
                        {accountName(j.default_debit_account_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 font-medium">
                        {accountName(j.default_credit_account_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${j.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${j.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {j.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(j)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setArchiveTarget(j)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><Archive className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > 0 && (
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
            {filtered.length} journal{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={editItem ? 'Edit Journal' : 'New Journal'} onSubmit={handleSubmit} submitting={submitting}>
        <Field label="Journal Name"><TI value={form.name} onChange={set('name')} placeholder="e.g. Sales Journal, Petty Cash" /></Field>
        <Field label="Journal Type"><SI value={form.type} onChange={set('type')} options={TYPES} /></Field>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Default Accounts</p>
          {accounts.length === 0 ? (
            <p className="text-xs text-amber-500 bg-amber-500/10 rounded-xl px-4 py-3">
              ⚠️ No active accounts found. Please create accounts first.
            </p>
          ) : (
            <div className="space-y-4">
              <Field label="Default Debit Account">
                <SI value={form.default_debit_account_id} onChange={set('default_debit_account_id')} options={accounts} placeholder="Select account…" />
              </Field>
              <Field label="Default Credit Account">
                <SI value={form.default_credit_account_id} onChange={set('default_credit_account_id')} options={accounts} placeholder="Select account…" />
              </Field>
            </div>
          )}
        </div>
      </Drawer>

      {/* Archive Modal */}
      <Modal isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive} loading={archiving}
        title="Archive Journal" message={`Are you sure you want to archive "${archiveTarget?.name}"?`} confirmLabel="Archive"
      />
    </div>
  )
}
