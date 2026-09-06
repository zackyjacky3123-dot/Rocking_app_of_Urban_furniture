import api from './axios'
export const getBudgets = () => api.get('/budgets/').then(r => r.data)
export const getBudget = id => api.get(`/budgets/${id}`).then(r => r.data)
export const createBudget = body => api.post('/budgets/', body).then(r => r.data)
export const activateBudget = id => api.patch(`/budgets/${id}/activate`).then(r => r.data)
export const closeBudget = id => api.patch(`/budgets/${id}/close`).then(r => r.data)
