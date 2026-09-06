export const listify = (data) => {
  if (Array.isArray(data)) return data
  if (!data) return []
  for (const key of ['items','results','data','orders','invoices','payments','entries','budgets','users']) {
    if (Array.isArray(data[key])) return data[key]
  }
  return []
}

export const money = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
}).format(Number(value || 0))

export const number = value => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(value || 0))
export const dateFmt = value => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
export const today = () => new Date().toISOString().slice(0, 10)
export const initials = name => String(name || 'UF').split(' ').filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase()
export const titleCase = value => String(value || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export async function safeAll(promise) {
  try { return await promise } catch { return null }
}

export const pick = (obj, keys, fallback = 0) => {
  for (const key of keys) if (obj?.[key] !== undefined && obj?.[key] !== null) return obj[key]
  return fallback
}
