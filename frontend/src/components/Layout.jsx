import { useLocation, useNavigate } from 'react-router-dom'
import { Moon, Sun, LogOut, Search, Wifi, Bell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import { useEffect, useState } from 'react'
import api from '../api/axios'

const titles = {'/':'Dashboard','/contacts':'Contacts','/products':'Products','/sales':'Sales','/purchase':'Purchase','/payments':'Payments','/accounting':'Accounting','/ledger':'General Ledger','/profit-loss':'Profit & Loss','/balance-sheet':'Balance Sheet','/budget':'Budget','/budget-report':'Budget Report','/users':'Users & Roles'}
export default function Layout({children}){
  const {theme,toggleTheme}=useTheme(); const {user,logout}=useAuth(); const {pathname}=useLocation(); const navigate=useNavigate(); const [apiOk,setApiOk]=useState(null)
  useEffect(()=>{api.get('/').then(()=>setApiOk(true)).catch(()=>setApiOk(false))},[])
  const title=titles[pathname]||'Urban Furniture'
  return <div className="flex h-screen overflow-hidden"><Sidebar/><div className="flex-1 min-w-0 flex flex-col overflow-hidden">
    <header className="h-[76px] flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-200/70 dark:border-white/[0.06] bg-white/35 dark:bg-slate-950/25 backdrop-blur-xl">
      <div><h1 className="font-display text-xl font-black text-slate-900 dark:text-white">{title}</h1><div className="text-[11px] text-slate-400 mt-1">Urban Furniture Accounting System 2026</div></div>
      <div className="flex items-center gap-2"><div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-bold border ${apiOk===true?'text-emerald-500 border-emerald-400/20 bg-emerald-400/5':apiOk===false?'text-rose-500 border-rose-400/20 bg-rose-400/5':'text-slate-400 border-slate-200 dark:border-white/10'}`}><Wifi size={13}/>{apiOk===true?'API Online':apiOk===false?'API Offline':'Checking API'}</div><button className="p-2.5 rounded-xl glass text-slate-500 dark:text-slate-300"><Bell size={17}/></button><button onClick={toggleTheme} className="p-2.5 rounded-xl glass text-slate-500 dark:text-slate-300">{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</button><button onClick={()=>navigate('/users')} className="flex items-center gap-2 px-2 py-1.5 rounded-xl glass"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 text-white flex items-center justify-center font-bold text-xs">{String(user?.name||user?.username||'AD').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()}</div><div className="hidden lg:block text-left"><div className="text-xs font-bold text-slate-800 dark:text-white">{user?.name||user?.username||'Admin'}</div><div className="text-[10px] text-slate-400">{user?.role||'ADMIN'}</div></div></button><button title="Logout" onClick={logout} className="p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10"><LogOut size={17}/></button></div>
    </header><main className="flex-1 overflow-y-auto p-6 lg:p-7"><div className="max-w-[1600px] mx-auto">{children}</div></main>
  </div></div>
}
