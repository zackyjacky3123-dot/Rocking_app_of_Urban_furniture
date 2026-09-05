import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Landmark, Users, ShoppingBag, BookOpen, ArrowRight, Plus,
  TrendingUp, Wallet, Boxes, Sparkles,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
} from 'recharts'
import StatCard from '../components/StatCard'
import { SpotlightCard, PrimaryButton } from '../components/ui'
import Badge from '../components/Badge'
import { getAccounts } from '../api/accounts'
import { getContacts } from '../api/contacts'
import { getProducts } from '../api/products'
import { getJournals } from '../api/journals'

const ACC_COLORS = {
  ASSET: '#22d3ee', LIABILITY: '#fb7185', EXPENSE: '#fb923c',
  INCOME: '#34d399', CAPITAL: '#a78bfa',
}

const CONTAINER = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const fmtCompact = (n) =>
  '₹' + new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const fmtFull = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })

function Skeleton({ className }) {
  return <div className={`shimmer rounded-2xl bg-gray-200/60 dark:bg-white/[0.05] ${className}`} />
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [contacts, setContacts] = useState([])
  const [products, setProducts] = useState([])
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([getAccounts(), getContacts(), getProducts(), getJournals()])
      .then(([a, c, p, j]) => {
        setAccounts(a.data)
        setContacts(c.data)
        setProducts(p.data)
        setJournals(j.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  // Derived metrics (real data from the API)
  const countBy = (list, key) =>
    Object.entries(list.reduce((acc, x) => { acc[x[key]] = (acc[x[key]] || 0) + 1; return acc }, {}))

  const salesValue = products.reduce((s, p) => s + Number(p.sales_price), 0)
  const purchaseValue = products.reduce((s, p) => s + Number(p.purchase_price), 0)
  const margin = salesValue - purchaseValue
  const marginPct = salesValue > 0 ? Math.round((margin / salesValue) * 100) : 0

  const accountChartData = countBy(accounts, 'type')
    .map(([type, value]) => ({ name: type, value, fill: ACC_COLORS[type] || '#8b5cf6' }))

  const accountSegments = countBy(accounts, 'type').map(([name, value]) => ({
    name, value, color: ACC_COLORS[name] || '#8b5cf6',
  }))
  const contactSegments = countBy(contacts, 'type').map(([name, value], i) => ({
    name, value, color: ['#3b82f6', '#f59e0b', '#ec4899'][i % 3],
  }))
  const productSegments = countBy(products, 'type').map(([name, value], i) => ({
    name, value, color: ['#14b8a6', '#6366f1', '#a855f7'][i % 3],
  }))
  const journalSegments = countBy(journals, 'type').map(([name, value], i) => ({
    name, value, color: ['#22c55e', '#f43f5e', '#0ea5e9', '#eab308'][i % 4],
  }))

  const kpis = [
    { icon: Wallet, label: 'Sales Value', value: fmtCompact(salesValue) },
    { icon: Boxes, label: 'Purchase Value', value: fmtCompact(purchaseValue) },
    { icon: TrendingUp, label: 'Est. Margin', value: `${marginPct}%` },
    { icon: Sparkles, label: 'Active Records', value: accounts.length + contacts.length + products.length + journals.length },
  ]

  const quickLinks = [
    { label: 'Manage Accounts', to: '/accounts', icon: Landmark, tint: 'text-cyan-500 dark:text-cyan-300 bg-cyan-400/10 ring-cyan-400/25' },
    { label: 'Manage Contacts', to: '/contacts', icon: Users, tint: 'text-violet-500 dark:text-violet-300 bg-violet-400/10 ring-violet-400/25' },
    { label: 'Manage Products', to: '/products', icon: ShoppingBag, tint: 'text-emerald-500 dark:text-emerald-300 bg-emerald-400/10 ring-emerald-400/25' },
    { label: 'Manage Journals', to: '/journals', icon: BookOpen, tint: 'text-amber-500 dark:text-amber-300 bg-amber-400/10 ring-amber-400/25' },
  ]

  const latest = [
    ...accounts.slice(-2).reverse().map(a => ({ key: `a${a.id}`, name: a.name, type: a.type, to: '/accounts', icon: Landmark, entity: 'Account', tint: 'text-cyan-500 dark:text-cyan-300 bg-cyan-400/10' })),
    ...contacts.slice(-2).reverse().map(c => ({ key: `c${c.id}`, name: c.name, type: c.type, to: '/contacts', icon: Users, entity: 'Contact', tint: 'text-violet-500 dark:text-violet-300 bg-violet-400/10' })),
    ...products.slice(-2).reverse().map(p => ({ key: `p${p.id}`, name: p.name, type: p.type, to: '/products', icon: ShoppingBag, entity: 'Product', tint: 'text-emerald-500 dark:text-emerald-300 bg-emerald-400/10' })),
    ...journals.slice(-2).reverse().map(j => ({ key: `j${j.id}`, name: j.name, type: j.type, to: '/journals', icon: BookOpen, entity: 'Journal', tint: 'text-amber-500 dark:text-amber-300 bg-amber-400/10' })),
  ].slice(0, 7)

  return (
    <motion.div variants={CONTAINER} initial="hidden" animate="show" className="space-y-7 max-w-7xl mx-auto pb-4">
      {/* ---------- Hero ---------- */}
      <motion.div variants={ITEM}>
        <SpotlightCard className="glass glow-hover rounded-3xl p-8 relative overflow-hidden">
          {/* Decorative rings */}
          <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full border border-cyan-400/15 animate-float pointer-events-none" />
          <div className="absolute -right-10 -top-14 w-52 h-52 rounded-full border border-violet-400/20 pointer-events-none" />
          <div className="absolute -right-2 -top-6 w-36 h-36 rounded-full bg-gradient-to-br from-cyan-400/10 to-violet-600/10 blur-xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-cyan-500/80 dark:text-cyan-400/80 mb-3">
              {dateStr}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {greeting} — here's your <span className="gradient-text">business at a glance.</span>
            </h2>

            {/* KPI chips */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              {kpis.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 pl-3 pr-4 py-2 rounded-xl bg-white/50 dark:bg-white/[0.05] border border-gray-200/70 dark:border-white/[0.08]"
                >
                  <Icon className="w-4 h-4 text-cyan-500 dark:text-cyan-300" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
                  <span className="font-display text-sm font-bold text-gray-900 dark:text-white tnum">{loading ? '…' : value}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 mt-6">
              <PrimaryButton onClick={() => navigate('/contacts?new=1')}>
                <Plus className="w-4 h-4" /> Add Contact
              </PrimaryButton>
              <button
                onClick={() => navigate('/products?new=1')}
                className="shine flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 hover:border-cyan-400/40 hover:text-cyan-600 dark:hover:text-cyan-300 transition-all duration-200"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* ---------- Stat Cards ---------- */}
      <motion.div variants={ITEM} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {loading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)
        ) : (
          <>
            <StatCard title="Total Accounts" value={accounts.length} icon={Landmark} color="cyan" subtitle="Chart of Accounts" breakdown={accountSegments} />
            <StatCard title="Total Contacts" value={contacts.length} icon={Users} color="violet" subtitle="Customers & Vendors" breakdown={contactSegments} />
            <StatCard title="Total Products" value={products.length} icon={ShoppingBag} color="emerald" subtitle="Goods, Services, Combos" breakdown={productSegments} />
            <StatCard title="Total Journals" value={journals.length} icon={BookOpen} color="amber" subtitle="Sales, Purchase, Bank, Cash" breakdown={journalSegments} />
          </>
        )}
      </motion.div>

      {/* ---------- Charts ---------- */}
      <motion.div variants={ITEM} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account composition — radial */}
        <SpotlightCard className="glass glow-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">Account Composition</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Your chart of accounts by type</p>

            {accountChartData.length > 0 ? (
              <div className="relative">
                <ResponsiveContainer width="100%" height={230}>
                  <RadialBarChart
                    data={accountChartData}
                    innerRadius="28%"
                    outerRadius="96%"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <PolarAngleAxis type="number" domain={[0, Math.max(...accountChartData.map(d => d.value))]} tick={false} />
                    <RadialBar background={{ fill: 'rgba(148,163,184,0.12)' }} dataKey="value" cornerRadius={10} />
                  </RadialBarChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-display text-3xl font-bold text-gray-900 dark:text-white tnum">{accounts.length}</span>
                  <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-gray-400">accounts</span>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
                  {accountChartData.map(d => (
                    <span key={d.name} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.fill, boxShadow: `0 0 8px ${d.fill}66` }} />
                      {d.name} <span className="font-semibold text-gray-700 dark:text-gray-200 tnum">({d.value})</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[230px] text-gray-400 text-sm gap-2">
                <Landmark className="w-8 h-8 opacity-40" />
                {loading ? 'Loading…' : 'No accounts yet'}
              </div>
            )}
          </div>
        </SpotlightCard>

        {/* Inventory valuation */}
        <SpotlightCard className="glass glow-hover rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-gray-900 dark:text-white">Inventory Valuation</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Catalog pricing power at current list prices</p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${marginPct >= 25 ? 'bg-emerald-400/10 text-emerald-500 dark:text-emerald-300 ring-1 ring-emerald-400/30' : 'bg-amber-400/10 text-amber-500 dark:text-amber-300 ring-1 ring-amber-400/30'}`}>
                {marginPct}% margin
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-6 mt-4">
              {[
                { label: 'Sales Value', amount: salesValue, pct: 100, bar: 'from-cyan-400 to-sky-500', glow: 'shadow-glow-cyan' },
                { label: 'Purchase Value', amount: purchaseValue, pct: salesValue > 0 ? Math.round((purchaseValue / salesValue) * 100) : 0, bar: 'from-violet-500 to-fuchsia-500', glow: 'shadow-glow-violet' },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{row.label}</span>
                    <span className="font-display text-lg font-bold text-gray-900 dark:text-white tnum">
                      {loading ? '…' : fmtFull(row.amount)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-gray-200/70 dark:bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: loading ? 0 : `${row.pct}%` }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                      className={`h-full rounded-full bg-gradient-to-r ${row.bar} ${row.glow}`}
                    />
                  </div>
                </div>
              ))}

              {/* Margin strip */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 ring-1 ring-emerald-400/20">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Potential Margin</span>
                </div>
                <span className="font-display text-lg font-bold text-emerald-500 dark:text-emerald-300 tnum">
                  {loading ? '…' : fmtFull(margin)}
                </span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </motion.div>

      {/* ---------- Quick actions + Latest ---------- */}
      <motion.div variants={ITEM} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div>
          <h3 className="font-display text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickLinks.map(({ label, to, icon: Icon, tint }) => (
              <Link key={to} to={to}>
                <SpotlightCard className="glass glow-hover rounded-2xl px-5 py-4 flex items-center justify-between group cursor-pointer h-full">
                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`p-2.5 rounded-xl ring-1 ${tint}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                  </div>
                  <ArrowRight className="relative z-10 w-4 h-4 text-gray-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                </SpotlightCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Latest records */}
        <div>
          <h3 className="font-display text-base font-bold text-gray-900 dark:text-white mb-4">Latest Records</h3>
          <SpotlightCard className="glass glow-hover rounded-2xl overflow-hidden divide-y divide-gray-200/60 dark:divide-white/[0.06]">
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9 rounded-xl" />)}
              </div>
            ) : latest.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">Nothing recorded yet.</div>
            ) : (
              latest.map((item, i) => (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(item.to)}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-cyan-400/[0.05] transition-colors text-left group"
                >
                  <span className={`p-2 rounded-lg ${item.tint}`}>
                    <item.icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400">{item.entity}</p>
                  </div>
                  <Badge type={item.type} />
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                </motion.button>
              ))
            )}
          </SpotlightCard>
        </div>
      </motion.div>
    </motion.div>
  )
}
