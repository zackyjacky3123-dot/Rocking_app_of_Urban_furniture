import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { getAccounts, createAccount, updateAccount, archiveAccount } from '../api/accounts'

const TYPES = ['ASSET', 'LIABILITY', 'EXPENSE', 'INCOME', 'CAPITAL']

const EMPTY = { name: '', type: 'ASSET' }

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

export default function Accounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [archiving, setArchiving] = useState(false)

  const fetch = async () => {
    try {
      const res = await getAccounts()
      setAccounts(res.data)
    } catch { toast.error('Failed to load accounts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setDrawerOpen(true) }
  const openEdit = (a) => { setForm({ name: a.name, type: a.type }); setEditItem(a); setDrawerOpen(true) }
  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null) }

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    setSubmitting(true)
    try {
      if (editItem) {
        await updateAccount(editItem.id, form)
        toast.success('Account updated!')
      } else {
        await createAccount(form)
        toast.success('Account created!')
      }
      closeDrawer()
      fetch()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong')
    } finally { setSubmitting(false) }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try {
      await archiveAccount(archiveTarget.id)
      toast.success('Account archived')
      setArchiveTarget(null)
      fetch()
    } catch { toast.error('Failed to archive') }
    finally { setArchiving(false) }
  }

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search accounts…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-violet-500/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> New Account
        </motion.button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    {search ? 'No accounts match your search.' : 'No accounts yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((a, i) => (
                  <motion.tr
                    key={a.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{a.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{a.name}</td>
                    <td className="px-6 py-4"><Badge type={a.type} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {a.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(a)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setArchiveTarget(a)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors">
                          <Archive className="w-4 h-4" />
                        </button>
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
            {filtered.length} account{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Drawer */}
      <Drawer
        isOpen={drawerOpen} onClose={closeDrawer}
        title={editItem ? 'Edit Account' : 'New Account'}
        onSubmit={handleSubmit} submitting={submitting}
      >
        <Field label="Account Name">
          <TextInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Cash, Sales Revenue" />
        </Field>
        <Field label="Account Type">
          <SelectInput value={form.type} onChange={v => setForm(f => ({ ...f, type: v }))} options={TYPES} />
        </Field>
      </Drawer>

      {/* Archive Modal */}
      <Modal
        isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive} loading={archiving}
        title="Archive Account"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It will no longer appear in active lists.`}
        confirmLabel="Archive"
      />
    </div>
  )
}
