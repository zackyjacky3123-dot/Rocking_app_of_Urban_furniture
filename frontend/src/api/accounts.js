import api from './axios'

export const getAccounts  = ()        => api.get('/accounts/')
export const getAccount   = (id)      => api.get(`/accounts/${id}`)
export const createAccount = (data)   => api.post('/accounts/', data)
export const updateAccount = (id, d)  => api.put(`/accounts/${id}`, d)
export const archiveAccount = (id)    => api.patch(`/accounts/${id}/archive`)
