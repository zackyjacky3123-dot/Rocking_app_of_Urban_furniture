import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Archive, ShoppingBag } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Badge from '../components/Badge'
import Drawer from '../components/Drawer'
import Modal from '../components/Modal'
import { Field, TextInput, SelectInput, SearchInput, SpotlightCard, PrimaryButton } from '../components/ui'
import { getProducts, createProduct, updateProduct, archiveProduct } from '../api/products'

const TYPES = ['GOODS', 'SERVICE', 'COMBO']
const EMPTY = { name: '', type: 'GOODS', category: '', sales_price: '0', purchase_price: '0' }

const TYPE_ICON_COLOR = {
  GOODS:   'text-teal-500 dark:text-teal-300 bg-teal-400/10 ring-1 ring-teal-400/25',
  SERVICE: 'text-indigo-500 dark:text-indigo-300 bg-indigo-400/10 ring-1 ring-indigo-400/25',
  COMBO:   'text-purple-500 dark:text-purple-300 bg-purple-400/10 ring-1 ring-purple-400/25',
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
  const [searchParams, setSearchParams] = useSearchParams()

  const fetch = async () => {
    try { const res = await getProducts(); setProducts(res.data) }
    catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetch() }, [])

  // Support ?new=1 (command palette / dashboard CTAs)
  useEffect(() => {
    if (searchParams.get('new')) {
      setForm(EMPTY)
      setEditItem(null)
      setDrawerOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

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

  const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products…" />
        <PrimaryButton onClick={openCreate}>
          <Plus className="w-4 h-4" /> New Product
        </PrimaryButton>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 shimmer rounded-2xl bg-gray-200/60 dark:bg-white/[0.04]" />
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
              whileHover={{ y: -5 }}
            >
              <SpotlightCard className="glass glow-hover rounded-2xl p-5 group h-full">
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2.5 rounded-xl ${TYPE_ICON_COLOR[p.type] || 'bg-gray-500/10 text-gray-500'}`}>
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-400/10 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setArchiveTarget(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-400/10 transition-colors"><Archive className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <p className="font-display font-bold text-gray-900 dark:text-white text-sm mb-1.5">{p.name}</p>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge type={p.type} />
                    {p.category && (
                      <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full ring-1 ring-gray-200/60 dark:ring-white/[0.06]">
                        {p.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-gray-200/60 dark:border-white/[0.06]">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Sale</p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-300 tnum">₹{fmt(p.sales_price)}</p>
                    </div>
                    <div className="w-px h-8 bg-gradient-to-b from-transparent via-gray-300 dark:via-white/15 to-transparent" />
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Purchase</p>
                      <p className="text-sm font-bold text-rose-600 dark:text-rose-300 tnum">₹{fmt(p.purchase_price)}</p>
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      )}

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={closeDrawer} title={editItem ? 'Edit Product' : 'New Product'} onSubmit={handleSubmit} submitting={submitting}>
        <Field label="Product Name"><TextInput value={form.name} onChange={set('name')} placeholder="e.g. Park Bench, Consultation" /></Field>
        <Field label="Product Type"><SelectInput value={form.type} onChange={set('type')} options={TYPES} /></Field>
        <Field label="Category"><TextInput value={form.category} onChange={set('category')} placeholder="e.g. Outdoor, Indoor" /></Field>
        <div className="border-t border-gray-200/60 dark:border-white/[0.07] pt-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Pricing</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sales Price (₹)"><TextInput value={form.sales_price} onChange={set('sales_price')} type="number" placeholder="0.00" /></Field>
            <Field label="Purchase Price (₹)"><TextInput value={form.purchase_price} onChange={set('purchase_price')} type="number" placeholder="0.00" /></Field>
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
