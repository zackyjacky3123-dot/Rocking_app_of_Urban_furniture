import api from './axios'
export const getJournals = () => api.get('/journals/').then(r => r.data)
export const getJournal = id => api.get(`/journals/${id}`).then(r => r.data)
export const createJournal = body => api.post('/journals/', body).then(r => r.data)
export const updateJournal = (id, body) => api.put(`/journals/${id}`, body).then(r => r.data)
export const archiveJournal = id => api.patch(`/journals/${id}/archive`).then(r => r.data)
