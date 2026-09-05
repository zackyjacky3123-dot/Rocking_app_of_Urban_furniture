import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive, Search, ShoppingBag } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { getProducts, createProduct, updateProduct, archiveProduct } from '../api/products'

const TYPES = ['GOODS', 'SERVICE', 'COMBO']
const EMPTY = { name: '', type: 'GOODS', category: '', sales_price: '0', purchase_price: '0' }

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

const TYPE_ICON_COLOR = {
  GOODS:   'bg-teal-500/10 text-teal-500',
  SERVICE: 'bg-indigo-500/10 text-indigo-500',
  COMBO:   'bg-purple-500/10 text-purple-500',
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState(null)
  const [archiving, setArchiving] = useState(false)

  const fetch = async () => {
    try { const res = await getProducts(); setProducts(res.data) }
    catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  const openCreate = () => { setForm(EMPTY); setEditItem(null); setDrawerOpen(true) }
  const openEdit = (p) => {
    setForm({ name: p.name, type: p.type, category: p.category || '', sales_price: String(p.sales_price), purchase_price: String(p.purchase_price) })
    setEditItem(p); setDrawerOpen(true)
  }
  const closeDrawer = () => { setDrawerOpen(false); setEditItem(null) }
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required')
    setSubmitting(true)
    try {
      const payload = { ...form, category: form.category || null, sales_price: parseFloat(form.sales_price) || 0, purchase_price: parseFloat(form.purchase_price) || 0 }
      if (editItem) { await updateProduct(editItem.id, payload); toast.success('Product updated!') }
      else { await createProduct(payload); toast.success('Product created!') }
      closeDrawer(); fetch()
    } catch (err) { toast.error(err.response?.data?.detail || 'Something went wrong') }
    finally { setSubmitting(false) }
  }

  const handleArchive = async () => {
    setArchiving(true)
    try { await archiveProduct(archiveTarget.id); toast.success('Product archived'); setArchiveTarget(null); fetch() }
    catch { toast.error('Failed to archive') }
    finally { setArchiving(false) }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.type.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-colors"
          />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openCreate}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 shadow-lg shadow-violet-500/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> New Product
        </motion.button>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          {search ? 'No products match your search.' : 'No products yet. Create your first one!'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, i) => (
            <motion.div key={p.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:border-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/10 transition-all duration-200 cursor-default relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${TYPE_ICON_COLOR[p.type] || 'bg-gray-500/10 text-gray-500'}`}>
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setArchiveTarget(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{p.name}</p>
              <div className="flex items-center gap-2 mb-3">
                <Badge type={p.type} />
                {p.category && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">{p.category}</span>}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="text-center">
                  <p className="text-xs text-gray-400">Sale</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">₹{Number(p.sales_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
                <div className="text-center">
                  <p className="text-xs text-gray-400">Purchase</p>
                  <p className="text-sm font-bold text-rose-600 dark:text-rose-400">₹{Number(p.purchase_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={editItem ? 'Edit Product' : 'New Product'} onSubmit={handleSubmit} submitting={submitting}>
        <Field label="Product Name"><TI value={form.name} onChange={set('name')} placeholder="e.g. Park Bench, Consultation" /></Field>
        <Field label="Product Type"><SI value={form.type} onChange={set('type')} options={TYPES} /></Field>
        <Field label="Category"><TI value={form.category} onChange={set('category')} placeholder="e.g. Outdoor, Indoor" /></Field>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sales Price (₹)"><TI value={form.sales_price} onChange={set('sales_price')} type="number" placeholder="0.00" /></Field>
            <Field label="Purchase Price (₹)"><TI value={form.purchase_price} onChange={set('purchase_price')} type="number" placeholder="0.00" /></Field>
          </div>
        </div>
      </Drawer>

      {/* Archive Modal */}
      <Modal isOpen={!!archiveTarget} onClose={() => setArchiveTarget(null)} onConfirm={handleArchive} loading={archiving}
        title="Archive Product" message={`Are you sure you want to archive "${archiveTarget?.name}"?`} confirmLabel="Archive"
      />
    </div>
  )
}
