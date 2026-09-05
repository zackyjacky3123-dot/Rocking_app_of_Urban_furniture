import api from './axios'

export const getProducts   = ()        => api.get('/products/')
export const getProduct    = (id)      => api.get(`/products/${id}`)
export const createProduct = (data)    => api.post('/products/', data)
export const updateProduct = (id, d)   => api.put(`/products/${id}`, d)
export const archiveProduct = (id)     => api.patch(`/products/${id}/archive`)
