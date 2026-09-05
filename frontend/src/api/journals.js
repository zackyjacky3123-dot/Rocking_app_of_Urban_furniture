import api from './axios'

export const getJournals   = ()        => api.get('/journals/')
export const getJournal    = (id)      => api.get(`/journals/${id}`)
export const createJournal = (data)    => api.post('/journals/', data)
export const updateJournal = (id, d)   => api.put(`/journals/${id}`, d)
export const archiveJournal = (id)     => api.patch(`/journals/${id}/archive`)
