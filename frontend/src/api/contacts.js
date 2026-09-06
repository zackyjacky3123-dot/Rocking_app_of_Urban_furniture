import api from './axios'
export const getContacts = () => api.get('/contacts/').then(r => r.data)
export const getContact = id => api.get(`/contacts/${id}`).then(r => r.data)
export const createContact = body => api.post('/contacts/', body).then(r => r.data)
export const updateContact = (id, body) => api.put(`/contacts/${id}`, body).then(r => r.data)
export const archiveContact = id => api.patch(`/contacts/${id}/archive`).then(r => r.data)
