import api from './axios'
export const getPurchaseOrders = () => api.get('/purchase/orders').then(r => r.data)
export const getPurchaseOrder = id => api.get(`/purchase/orders/${id}`).then(r => r.data)
export const createPurchaseOrder = body => api.post('/purchase/orders', body).then(r => r.data)
export const confirmPurchaseOrder = id => api.patch(`/purchase/orders/${id}/confirm`).then(r => r.data)
export const receivePurchaseOrder = (id, body = {}) => api.post(`/purchase/orders/${id}/receive`, body).then(r => r.data)
export const getBills = () => api.get('/purchase/bills').then(r => r.data)
export const getBill = id => api.get(`/purchase/bills/${id}`).then(r => r.data)
export const createBill = body => api.post('/purchase/bills', body).then(r => r.data)
