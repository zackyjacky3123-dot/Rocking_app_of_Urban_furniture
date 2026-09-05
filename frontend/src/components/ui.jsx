import { useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { Search } from 'lucide-react'

export const inputCls =
  'w-full px-4 py-2.5 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 bg-white/70 dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 focus:border-cyan-400/60 transition-all duration-200'

export function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

export function TextInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={inputCls}
    />
  )
}

export function SelectInput({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o =>
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.id} value={o.id}>{o.name} ({o.type})</option>
      )}
    </select>
  )
}

export function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="flex-1 relative">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} pl-10 bg-white/70 dark:bg-white/[0.04]`}
      />
    </div>
  )
}

/* Card that highlights a radial glow following the mouse */
export function SpotlightCard({ className = '', children, ...rest }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - r.left}px`)
    el.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight ${className}`} {...rest}>
      {children}
    </div>
  )
}

/* Number that counts up when scrolled into view */
export function AnimatedCounter({ value, duration = 1.4, className = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView || !ref.current) return
    const controls = animate(0, Number(value) || 0, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: v => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString('en-IN')
      },
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return <span ref={ref} className={`tnum ${className}`}>0</span>
}

/* Primary gradient CTA with shine sweep */
export function PrimaryButton({ children, onClick, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`shine flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-600 bg-[length:150%_100%] hover:bg-[position:100%_0] shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 ${className}`}
    >
      {children}
    </button>
  )
}

/* Stacked proportion bar used in stat cards */
export function MiniBars({ segments = [] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  if (!total) return null
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden gap-px mt-4">
      {segments.map((s, i) => (
        <div
          key={i}
          className={s.color}
          style={{ width: `${(s.value / total) * 100}%` }}
          title={`${s.name}: ${s.value}`}
        />
      ))}
    </div>
  )
}
