import { Loader2, Search, Plus, RefreshCw, X } from 'lucide-react'
import { useState } from 'react'

export function PageHeader({ title, description, action, children }) {
  return <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
    <div><h1 className="font-display text-3xl font-black text-slate-900 dark:text-white">{title}</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p></div>
    <div className="flex items-center gap-2">{children}{action}</div>
  </div>
}

export function Button({ children, icon: Icon, variant='primary', ...props }) {
  const classes = { primary:'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01]', secondary:'glass text-slate-700 dark:text-slate-200', danger:'bg-rose-500 text-white', ghost:'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/5 dark:hover:bg-white/5' }
  return <button className={`inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${classes[variant]}`} {...props}>{Icon && <Icon size={16}/>} {children}</button>
}

export function Input({ label, className='', ...props }) { return <label className="block"><span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</span><input className={`w-full rounded-xl px-3 py-2.5 bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/30 ${className}`} {...props}/></label> }
export function Select({ label, children, className='', ...props }) { return <label className="block"><span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</span><select className={`w-full rounded-xl px-3 py-2.5 bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/30 ${className}`} {...props}>{children}</select></label> }
export function Textarea({ label, className='', ...props }) { return <label className="block"><span className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">{label}</span><textarea className={`w-full rounded-xl px-3 py-2.5 bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/30 ${className}`} {...props}/></label> }

export function Card({ children, className='' }) { return <div className={`glass rounded-2xl p-5 ${className}`}>{children}</div> }

export function SearchBox({ value, onChange, placeholder='Search...' }) { return <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="pl-9 pr-3 py-2.5 w-full rounded-xl bg-white/70 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-cyan-500/30"/></div> }

export function Modal({ open, title, children, onClose, width='max-w-2xl' }) { if (!open) return null; return <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose?.()}}><div className={`w-full ${width} max-h-[90vh] overflow-y-auto glass-deep rounded-3xl p-6 shadow-2xl`}><div className="flex justify-between items-center mb-5"><h3 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h3><button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10"><X size={18}/></button></div>{children}</div></div> }

export function Loading({ text='Loading...' }) { return <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="animate-spin mr-2" size={18}/>{text}</div> }
export function Empty({ text='Nothing here yet.', onClick }) { return <div className="py-16 text-center"><div className="text-lg font-semibold text-slate-700 dark:text-slate-200">{text}</div>{onClick && <Button icon={Plus} className="mt-4" onClick={onClick}>Create</Button>}</div> }
export function RefreshButton({ onClick, loading=false }) { return <Button variant="secondary" icon={RefreshCw} onClick={onClick} disabled={loading}>{loading?'Refreshing...':'Refresh'}</Button> }

export function Table({ columns, rows, empty='No records found.' }) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-200/80 dark:border-white/10">{columns.map(c=><th key={c.key} className="text-left px-3 py-3 text-[11px] uppercase tracking-wider text-slate-400 font-bold">{c.label}</th>)}</tr></thead><tbody>{rows.length ? rows.map((row,i)=><tr key={row.id ?? i} className="border-b border-slate-200/50 dark:border-white/[0.06] hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.025]">{columns.map(c=><td key={c.key} className="px-3 py-3 text-slate-700 dark:text-slate-200">{c.render ? c.render(row) : row[c.key]}</td>)}</tr>) : <tr><td colSpan={columns.length}><Empty text={empty}/></td></tr>}</tbody></table></div>
}
