import api from './axios'
const params = obj => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))
export const getLedger = (filters = {}) => api.get('/ledger/', { params: params(filters) }).then(r => r.data)
export const getAccountLedger = (accountId, filters = {}) => api.get(`/ledger/${accountId}`, { params: params(filters) }).then(r => r.data)
