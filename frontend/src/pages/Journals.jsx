import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive, ArrowRight } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { Field, TextInput, SelectInput, SearchInput, SpotlightCard, PrimaryButton } from '../components/ui'
import { getJournals, createJournal, updateJournal, archiveJournal } from '../api/journals'
import { getAccounts } from '../api/accounts'

const TYPES = ['SALES', 'PURCHASE', 'BANK', 'CASH']
const EMPTY = { name: '', type: 'SALES', default_debit_account_id: '', default_credit_account_id: '' }

function AccountChip({ label, accountName, tone }) {
  const tones = {
    debit:  'bg-cyan-400/10 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-400/25',
    credit: 'bg-violet-400/10 text-violet-700 dark:text-violet-300 ring-1 ring-violet-400/25',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg font-medium ${tones[tone]}`}>
      <span className="text-[9px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      {accountName}
    </span>
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
  const [searchParams, setSearchParams] = useSearchParams()

  const fetchAll = async () => {
    try {
      const [j, a] = await Promise.all([getJournals(), getAccounts()])
      setJournals(j.data)
      setAccounts(a.data)
    } catch { toast.error('Failed to load data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  // Support ?new=1 (command palette)
  useEffect(() => {
    if (searchParams.get('new')) {
      setForm(EMPTY)
      setEditItem(null)
      setDrawerOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setDrawerOpen(true) }
  const openEdit = (j) => {
    setForm({
      name: j.name, type: j.type,
      default_debit_account_id: String(j.default_debit_account_id),
      default_credit_account_id: String(j.default_credit_account_id),
    })
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
        <SearchInput value={search} onChange={setSearch} placeholder="Search journals…" />
        <PrimaryButton onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Journal
        </PrimaryButton>
      </div>

      {/* Table */}
      <SpotlightCard className="glass glow-hover rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200/70 dark:border-white/[0.07] bg-white/40 dark:bg-white/[0.03]">
                {['ID', 'Journal Name', 'Type', 'Dr → Cr', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`px-6 py-3.5 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.14em] ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-white/[0.05]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>{[...Array(6)].map((_, j) => <td key={j} className="px-6 py-4"><div className="h-4 shimmer rounded bg-gray-200/60 dark:bg-white/[0.05]" /></td>)}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-400 text-sm">
                    {search ? 'No journals match your search.' : 'No journals yet. Create your first one!'}
                  </td>
                </tr>
              ) : (
                filtered.map((j, i) => (
                  <motion.tr key={j.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="group hover:bg-cyan-400/[0.05] transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-400 font-mono text-xs">#{j.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">{j.name}</td>
                    <td className="px-6 py-4"><Badge type={j.type} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <AccountChip label="Dr" accountName={accountName(j.default_debit_account_id)} tone="debit" />
                        <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
                        <AccountChip label="Cr" accountName={accountName(j.default_credit_account_id)} tone="credit" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${j.is_active ? 'text-emerald-500' : 'text-gray-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${j.is_active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-400'}`} />
                        {j.is_active ? 'Active' : 'Archived'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(j)} className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-400/10 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setArchiveTarget(j)} className="p-2 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-400/10 transition-colors"><Archive className="w-4 h-4" /></button>
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
            {filtered.length} journal{filtered.length !== 1 ? 's' : ''}
          </div>
        )}
      </SpotlightCard>

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={editItem ? 'Edit Journal' : 'New Journal'} onSubmit={handleSubmit} submitting={submitting}>
        <Field label="Journal Name"><TextInput value={form.name} onChange={set('name')} placeholder="e.g. Sales Journal, Petty Cash" /></Field>
        <Field label="Journal Type"><SelectInput value={form.type} onChange={set('type')} options={TYPES} /></Field>
        <div className="border-t border-gray-200/60 dark:border-white/[0.07] pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Default Accounts</p>
          {accounts.length === 0 ? (
            <p className="text-xs text-amber-500 bg-amber-400/10 rounded-xl px-4 py-3 ring-1 ring-amber-400/20">
              ⚠️ No active accounts found. Please create accounts first.
            </p>
          ) : (
            <div className="space-y-4">
              <Field label="Default Debit Account">
                <SelectInput value={form.default_debit_account_id} onChange={set('default_debit_account_id')} options={accounts} placeholder="Select account…" />
              </Field>
              <Field label="Default Credit Account">
                <SelectInput value={form.default_credit_account_id} onChange={set('default_credit_account_id')} options={accounts} placeholder="Select account…" />
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
