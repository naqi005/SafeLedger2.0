import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sl_token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('sl_token')
      sessionStorage.removeItem('sl_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  logout:    () => api.post('/auth/logout').catch(() => {}),
  logoutAll: () => api.post('/auth/logout-all').catch(() => {}),
}

export default api

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_WALLETS = [
  { _id: 'wlt_001', currency: 'PKR', balance: 245800.50, status: 'active' },
  { _id: 'wlt_002', currency: 'USD', balance: 1280.75, status: 'active' },
  { _id: 'wlt_003', currency: 'EUR', balance: 430.20, status: 'active' },
  { _id: 'wlt_004', currency: 'GBP', balance: 125.00, status: 'frozen' },
]

const MOCK_TRANSACTIONS = Array.from({ length: 20 }, (_, i) => ({
  _id: `tx_${String(i + 1).padStart(6, '0')}`,
  type: ['send', 'receive', 'exchange', 'add'][i % 4],
  amount: +(Math.random() * 9000 + 200).toFixed(2),
  currency: ['PKR', 'USD', 'EUR', 'GBP'][i % 4],
  status: ['completed', 'completed', 'pending', 'failed'][i % 4],
  senderEmail: i % 2 === 0 ? 'you@example.com' : `user${i}@example.com`,
  receiverEmail: i % 2 !== 0 ? 'you@example.com' : `user${i}@example.com`,
  createdAt: new Date(Date.now() - i * 86400000 * 1.5).toISOString(),
}))

const DEMO_RATES = { USD: 1, PKR: 278.5, EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75 }

// ─── Wallet API ───────────────────────────────────────────────────────────────

let _mockWallets = [...MOCK_WALLETS]

export const walletApi = {
  getAll: () =>
    api.get('/wallets').catch(() => ({ data: _mockWallets })),

  create: (currency) =>
    api.post('/wallets', { currency }).catch(() => {
      const w = { _id: 'wlt_' + Date.now(), currency, balance: 0, status: 'active' }
      _mockWallets = [..._mockWallets, w]
      return { data: w }
    }),

  getById: (id) =>
    api.get(`/wallets/${id}`).catch(() => ({
      data: _mockWallets.find(w => w._id === id),
    })),

  toggleStatus: (id) =>
    api.patch(`/wallets/${id}/toggle`).catch(() => {
      _mockWallets = _mockWallets.map(w =>
        w._id === id ? { ...w, status: w.status === 'active' ? 'frozen' : 'active' } : w
      )
      return { data: { success: true } }
    }),
}

// ─── Transaction API ──────────────────────────────────────────────────────────

export const transactionApi = {
  getAll: (params) =>
    api.get('/transactions', { params }).catch(() => ({ data: MOCK_TRANSACTIONS })),

  send: (data) =>
    api.post('/transactions/send', data).catch(() => ({
      data: {
        _id: 'tx_' + Date.now(),
        ...data,
        type: 'send',
        status: 'completed',
        createdAt: new Date().toISOString(),
      },
    })),

  getById: (id) =>
    api.get(`/transactions/${id}`).catch(() => ({
      data: MOCK_TRANSACTIONS.find(t => t._id === id),
    })),
}

// ─── Exchange API ─────────────────────────────────────────────────────────────

export const exchangeApi = {
  getRates: (from, to) =>
    api.get('/exchange/rates', { params: { from, to } }).catch(() => ({
      data: { rate: DEMO_RATES[to] / DEMO_RATES[from], from, to },
    })),

  convert: (data) =>
    api.post('/exchange/convert', data).catch(() => ({
      data: { success: true, ...data },
    })),
}

// ─── User API ─────────────────────────────────────────────────────────────────

export const userApi = {
  getProfile: () =>
    api.get('/users/profile').catch(() => {
      const cached = sessionStorage.getItem('sl_user')
      return { data: cached ? JSON.parse(cached) : { name: 'Demo User', email: 'demo@example.com', role: 'user' } }
    }),

  updateProfile: (data) =>
    api.put('/users/profile', data).catch(() => ({ data: { success: true } })),

  changePassword: (data) =>
    api.put('/users/change-password', data).catch(() => ({ data: { success: true } })),
}

// ─── Deposit API ──────────────────────────────────────────────────────────────

export const depositApi = {
  create: (data) => api.post('/deposits', data),
  getAll: ()     => api.get('/deposits').catch(() => ({ data: [] })),
}

// ─── Withdrawal API ───────────────────────────────────────────────────────────

export const withdrawalApi = {
  create: (data) => api.post('/withdrawals', data),
  getAll: ()     => api.get('/withdrawals').catch(() => ({ data: [] })),
}

// ─── Admin API ────────────────────────────────────────────────────────────────

const MOCK_ADMIN_USERS = Array.from({ length: 9 }, (_, i) => ({
  _id: `usr_${String(i + 1).padStart(3, '0')}`,
  name: ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Lee', 'Eva Green', 'Frank Miller', 'Grace Kim', 'Henry Brown', 'Iris Chen'][i],
  email: `user${i + 1}@example.com`,
  role: i === 0 ? 'admin' : 'user',
  createdAt: new Date(Date.now() - i * 86400000 * 12).toISOString(),
  wallets: Math.floor(Math.random() * 4) + 1,
  status: i === 3 ? 'suspended' : 'active',
}))

export const adminApi = {
  getAllUsers: () =>
    api.get('/admin/users').catch(() => ({ data: MOCK_ADMIN_USERS })),

  getAllTransactions: () =>
    api.get('/admin/transactions').catch(() => ({ data: MOCK_TRANSACTIONS })),

  freezeWallet: (id) =>
    api.patch(`/admin/wallets/${id}/freeze`).catch(() => ({ data: { success: true } })),

  unfreezeWallet: (id) =>
    api.patch(`/admin/wallets/${id}/unfreeze`).catch(() => ({ data: { success: true } })),

  suspendUser: (id) =>
    api.patch(`/admin/users/${id}/suspend`).catch(() => ({ data: { success: true } })),

  reactivateUser: (id) =>
    api.patch(`/admin/users/${id}/reactivate`).catch(() => ({ data: { success: true } })),
}
