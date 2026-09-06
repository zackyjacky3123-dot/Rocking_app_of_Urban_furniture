import api from './axios'
export const getPayments = () => api.get('/payments/').then(r => r.data)
export const getPayment = id => api.get(`/payments/${id}`).then(r => r.data)
export const createCustomerPayment = body => api.post('/payments/customer', body).then(r => r.data)
export const createVendorPayment = body => api.post('/payments/vendor', body).then(r => r.data)
