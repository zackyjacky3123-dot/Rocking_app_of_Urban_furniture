import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Landmark, Users, ShoppingBag, BookOpen, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend,
} from 'recharts'
import StatCard from '../components/StatCard'
import { getAccounts } from '../api/accounts'
import { getContacts } from '../api/contacts'
import { getProducts } from '../api/products'
import { getJournals } from '../api/journals'

const PIE_COLORS = ['#06b6d4','#8b5cf6','#f97316','#10b981','#f59e0b']
const BAR_COLORS = { GOODS: '#14b8a6', SERVICE: '#6366f1', COMBO: '#a855f7' }

const CONTAINER = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const ITEM = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

function InputField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full px-4 py-2.5 rounded-xl text-sm
          bg-gray-50 dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          text-gray-900 dark:text-white
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
          transition-colors
        "
      />
    </div>
  )
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState([])
  const [contacts, setContacts] = useState([])
  const [products, setProducts] = useState([])
  const [journals, setJournals] = useState([])
  const [loading, setLoading] = useState(true)

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

  // Derived chart data
  const accountChartData = Object.entries(
    accounts.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const productChartData = Object.entries(
    products.reduce((acc, p) => { acc[p.type] = (acc[p.type] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const quickLinks = [
    { label: 'Manage Accounts', to: '/accounts', icon: Landmark, color: 'text-cyan-500' },
    { label: 'Manage Contacts', to: '/contacts', icon: Users, color: 'text-violet-500' },
    { label: 'Manage Products', to: '/products', icon: ShoppingBag, color: 'text-emerald-500' },
    { label: 'Manage Journals', to: '/journals', icon: BookOpen, color: 'text-amber-500' },
  ]

  return (
    <motion.div variants={CONTAINER} initial="hidden" animate="show" className="space-y-8 max-w-7xl mx-auto">
      {/* Greeting */}
      <motion.div variants={ITEM}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back 👋
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Here's what's happening in your accounting system today.
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={ITEM} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard title="Total Accounts" value={loading ? '…' : accounts.length} icon={Landmark} color="cyan" subtitle="Chart of Accounts" />
        <StatCard title="Total Contacts" value={loading ? '…' : contacts.length} icon={Users} color="violet" subtitle="Customers & Vendors" />
        <StatCard title="Total Products" value={loading ? '…' : products.length} icon={ShoppingBag} color="emerald" subtitle="Goods, Services, Combos" />
        <StatCard title="Total Journals" value={loading ? '…' : journals.length} icon={BookOpen} color="amber" subtitle="Sales, Purchase, Bank, Cash" />
      </motion.div>

      {/* Charts */}
      <motion.div variants={ITEM} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Type Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Account Type Distribution</h3>
          <p className="text-xs text-gray-400 mb-5">Breakdown of your chart of accounts</p>
          {accountChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={accountChartData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={{ stroke: '#6b7280' }}
                >
                  {accountChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#f9fafb', fontSize: '0.8rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              {loading ? 'Loading…' : 'No accounts yet'}
            </div>
          )}
        </div>

        {/* Product Type Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Product Type Breakdown</h3>
          <p className="text-xs text-gray-400 mb-5">Goods, Services, and Combos</p>
          {productChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productChartData} barCategoryGap="40%">
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '0.75rem', color: '#f9fafb', fontSize: '0.8rem' }}
                  cursor={{ fill: 'rgba(139,92,246,0.08)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {productChartData.map((entry, i) => (
                    <Cell key={i} fill={BAR_COLORS[entry.name] || '#8b5cf6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              {loading ? 'Loading…' : 'No products yet'}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div variants={ITEM}>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map(({ label, to, icon: Icon, color }) => (
            <Link key={to} to={to}>
              <motion.div
                whileHover={{ y: -3 }}
                className="
                  flex items-center justify-between px-5 py-4 rounded-2xl
                  bg-white dark:bg-gray-900
                  border border-gray-200 dark:border-gray-800
                  hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10
                  cursor-pointer group transition-all duration-200
                "
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}
