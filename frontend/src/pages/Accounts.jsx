import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { Field, TextInput, SelectInput, SearchInput, SpotlightCard, PrimaryButton } from '../components/ui'
import { getAccounts, createAccount, updateAccount, archiveAccount } from '../api/accounts'

const TYPES = ['ASSET', 'LIABILITY', 'EXPENSE', 'INCOME', 'CAPITAL']
const EMPTY = { name: '', type: 'ASSET' }

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
  const [searchParams, setSearchParams] = useSearchParams()

  const fetch = async () => {
    try {
      const res = await getAccounts()
      setAccounts(res.data)
    } catch { toast.error('Failed to load accounts') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  // Support ?new=1 (command palette / dashboard CTAs) by auto-opening the create drawer
  useEffect(() => {
    if (searchParams.get('new')) {
      setForm(EMPTY)
      setEditItem(null)
      setDrawerOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

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
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search accounts…" />
        <PrimaryButton onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Account
        </PrimaryButton>
      </div>

      {/* Table */}
      <SpotlightCard className="glass glow-hover rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/70 dark:border-white/[0.07] bg-white/40 dark:bg-white/[0.03]">
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em]">ID</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em]">Name</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em]">Type</th>
                <th className="px-6 py-3.5 text-left text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em]">Status</th>
                <th className="px-6 py-3.5 text-right text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/[0.05]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 shimmer rounded bg-gray-200/60 dark:bg-white/[0.05]" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-gray-400 text-sm">
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
                    className="group hover:bg-cyan-400/[0.05] transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{a.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                      {a.name}
                    </td>
                    <td className="px-6 py-4"><Badge type={a.type} /></td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${a.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${a.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-400'}`} />
                        {a.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(a)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-400/10 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setArchiveTarget(a)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-400/10 transition-colors">
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
          <div className="px-6 py-3 border-t border-gray-200/60 dark:border-white/[0.06] text-xs text-gray-400">
            {filtered.length} account{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </SpotlightCard>

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
