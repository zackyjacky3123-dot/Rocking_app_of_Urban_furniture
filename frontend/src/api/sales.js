import api from './axios'
export const getSalesOrders = () => api.get('/sales/orders').then(r => r.data)
export const getSalesOrder = id => api.get(`/sales/orders/${id}`).then(r => r.data)
export const createSalesOrder = body => api.post('/sales/orders', body).then(r => r.data)
export const getInvoices = () => api.get('/sales/invoices').then(r => r.data)
export const getInvoice = id => api.get(`/sales/invoices/${id}`).then(r => r.data)
export const createInvoice = body => api.post('/sales/invoices', body).then(r => r.data)
