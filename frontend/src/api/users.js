import api from './axios'
export const login = body => api.post('/users/login', body).then(r => r.data)
export const getUsers = () => api.get('/users/').then(r => r.data)
export const getUser = id => api.get(`/users/${id}`).then(r => r.data)
export const createUser = body => api.post('/users/', body).then(r => r.data)
export const changeRole = (id, role) => api.patch(`/users/${id}/role`, { role }).then(r => r.data)
export const activateUser = id => api.patch(`/users/${id}/activate`).then(r => r.data)
export const deactivateUser = id => api.patch(`/users/${id}/deactivate`).then(r => r.data)
