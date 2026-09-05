import api from './axios'

export const getContacts   = ()        => api.get('/contacts/')
export const getContact    = (id)      => api.get(`/contacts/${id}`)
export const createContact = (data)    => api.post('/contacts/', data)
export const updateContact = (id, d)   => api.put(`/contacts/${id}`, d)
export const archiveContact = (id)     => api.patch(`/contacts/${id}/archive`)
