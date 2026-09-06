import api from './axios'
const params = obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))
export const getDashboardSummary = (filters = {}) => api.get('/dashboard/summary', { params: params(filters) }).then(r => r.data)
