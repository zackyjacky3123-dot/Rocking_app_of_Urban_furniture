import api from './axios'
export const getProducts = () => api.get('/products/').then(r => r.data)
export const getProduct = id => api.get(`/products/${id}`).then(r => r.data)
export const createProduct = body => api.post('/products/', body).then(r => r.data)
export const updateProduct = (id, body) => api.put(`/products/${id}`, body).then(r => r.data)
export const archiveProduct = id => api.patch(`/products/${id}/archive`).then(r => r.data)
