import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Users, Package, ShoppingCart, Truck, CreditCard, Landmark, BookOpen, FileText, Scale, WalletCards, PieChart, UserCog, ChevronLeft, ChevronRight, Sofa, Calculator } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const groups = [
  { title: '', items: [{ label:'Dashboard', to:'/', icon:LayoutDashboard, end:true, roles:['ALL'] }] },
  { title:'OPERATIONS', items:[
    {label:'Contacts',to:'/contacts',icon:Users,roles:['ALL']},{label:'Products',to:'/products',icon:Package,roles:['ALL']},{label:'Sales',to:'/sales',icon:ShoppingCart,roles:['ADMIN','SALES']},{label:'Purchase',to:'/purchase',icon:Truck,roles:['ADMIN','PURCHASE']},{label:'Payments',to:'/payments',icon:CreditCard,roles:['ADMIN','ACCOUNTANT','SALES','PURCHASE']},
  ]},
  { title:'ACCOUNTING', items:[
    {label:'Accounting',to:'/accounting',icon:Calculator,roles:['ADMIN','ACCOUNTANT']},{label:'Accounts',to:'/accounts',icon:Landmark,roles:['ADMIN','ACCOUNTANT']},{label:'Journals',to:'/journals',icon:BookOpen,roles:['ADMIN','ACCOUNTANT']},{label:'Journal Entries',to:'/journal-entries',icon:FileText,roles:['ADMIN','ACCOUNTANT']},{label:'Ledger',to:'/ledger',icon:BookOpen,roles:['ADMIN','ACCOUNTANT']},
  ]},
  { title:'REPORTS', items:[
    {label:'Profit & Loss',to:'/profit-loss',icon:PieChart,roles:['ADMIN','ACCOUNTANT']},{label:'Balance Sheet',to:'/balance-sheet',icon:Scale,roles:['ADMIN','ACCOUNTANT']},{label:'Budget',to:'/budget',icon:WalletCards,roles:['ADMIN','ACCOUNTANT']},{label:'Budget Report',to:'/budget-report',icon:FileText,roles:['ADMIN','ACCOUNTANT']},
  ]},
  { title:'ADMIN', items:[{label:'Users & Roles',to:'/users',icon:UserCog,roles:['ADMIN']}] },
]

export default function Sidebar(){
  const [collapsed,setCollapsed]=useState(false); const {user}=useAuth(); const role=String(user?.role||'ADMIN').toUpperCase()
  const allowed = r => r.includes('ALL') || r.includes(role)
  return <motion.aside animate={{width:collapsed?76:255}} transition={{type:'spring',damping:28,stiffness:280}} className="glass flex-shrink-0 h-screen flex flex-col border-y-0 border-l-0 overflow-hidden">
    <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200/60 dark:border-white/[0.06]">
      <div className="relative flex-shrink-0"><div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 blur-md opacity-50"/><div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg"><Sofa size={20} className="text-white"/></div></div>
      <AnimatePresence>{!collapsed&&<motion.div initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} exit={{opacity:0}}><div className="font-display font-black text-sm whitespace-nowrap text-slate-900 dark:text-white">Urban Furniture</div><div className="text-[10px] tracking-[.17em] font-bold text-cyan-500 whitespace-nowrap">ACCOUNTING 2026</div></motion.div>}</AnimatePresence>
    </div>
    <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
      {groups.map(g=><div key={g.title||'main'}><AnimatePresence>{!collapsed&&g.title&&<motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-3 pb-2 text-[10px] font-black tracking-[.18em] text-slate-400">{g.title}</motion.div>}</AnimatePresence>{g.items.filter(x=>allowed(x.roles)).map(({label,to,icon:Icon,end})=><NavLink key={to} to={to} end={end} className={({isActive})=>`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition ${isActive?'text-slate-900 dark:text-white bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-violet-500/10 ring-1 ring-cyan-400/20':'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.04] dark:hover:bg-white/[0.04]'}`}><Icon size={18} className="flex-shrink-0"/><AnimatePresence>{!collapsed&&<motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="text-sm font-semibold whitespace-nowrap">{label}</motion.span>}</AnimatePresence></NavLink>)}</div>)}
    </nav>
    <div className="px-3 py-4 border-t border-slate-200/60 dark:border-white/[0.06]"><div className="flex items-center gap-2 px-2 pb-3 text-[10px] uppercase tracking-wider text-slate-400"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/>{!collapsed&&'All systems online'}</div><button onClick={()=>setCollapsed(!collapsed)} className="w-full p-2.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 flex justify-center">{collapsed?<ChevronRight size={17}/>:<ChevronLeft size={17}/>}</button></div>
  </motion.aside>
}
