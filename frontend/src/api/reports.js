import api from './axios'
const params = obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))
export const getProfitLoss = (filters = {}) => api.get('/reports/profit-loss', { params: params(filters) }).then(r => r.data)
export const getBalanceSheet = (filters = {}) => api.get('/reports/balance-sheet', { params: params(filters) }).then(r => r.data)
export const getBudgetReport = id => api.get(`/reports/budget/${id}`).then(r => r.data)
