import api from './axios'
export const getJournalEntries = () => api.get('/journal-entries/').then(r => r.data)
export const getJournalEntry = id => api.get(`/journal-entries/${id}`).then(r => r.data)
export const createJournalEntry = body => api.post('/journal-entries/', body).then(r => r.data)
