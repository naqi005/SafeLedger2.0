import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

// Mock users for demo when backend is unavailable
const MOCK_USERS = {
  'admin@safeledger.com': { id: 'adm_001', name: 'Admin User', email: 'admin@safeledger.com', role: 'admin', phone: '+1 555 0100', createdAt: '2023-01-01' },
  'demo@safeledger.com': { id: 'usr_001', name: 'Alex Johnson', email: 'demo@safeledger.com', role: 'user', phone: '+92 300 1234567', createdAt: '2023-06-15' },
}

function makeMockUser(name, email) {
  const isAdmin = email.toLowerCase().includes('admin')
  return {
    id: 'usr_' + Math.random().toString(36).slice(2, 9),
    name: name || (isAdmin ? 'Admin User' : 'Demo User'),
    email,
    role: isAdmin ? 'admin' : 'user',
    phone: '',
    createdAt: new Date().toISOString(),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => sessionStorage.getItem('sl_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }

    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    // Try to restore user from cache first, then verify with server
    const cached = sessionStorage.getItem('sl_user')
    if (cached) {
      try { setUser(JSON.parse(cached)) } catch { /* ignore */ }
    }

    api.get('/auth/me')
      .then(res => {
        setUser(res.data)
        sessionStorage.setItem('sl_user', JSON.stringify(res.data))
      })
      .catch(err => {
        // Network error → use cached user (demo mode)
        if (!err.response) {
          if (!cached) logout()
          // else keep the cached user — demo mode
        } else {
          // 401 or other server error → force logout
          logout()
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const { token: newToken, user: userData } = res.data
      _persist(newToken, userData)
      return userData
    } catch (err) {
      if (err.response) throw err               // real server error (e.g. wrong password)

      // Network error → demo mode
      const mockUser = MOCK_USERS[email.toLowerCase()] || makeMockUser('', email)
      const mockToken = 'demo-' + Math.random().toString(36).slice(2)
      _persist(mockToken, mockUser)
      return mockUser
    }
  }

  const register = async (data) => {
    try {
      const res = await api.post('/auth/register', data)
      const { token: newToken, user: userData } = res.data
      _persist(newToken, userData)
      return userData
    } catch (err) {
      if (err.response) throw err

      // Network error → demo mode
      const mockUser = makeMockUser(data.name, data.email)
      const mockToken = 'demo-' + Math.random().toString(36).slice(2)
      _persist(mockToken, mockUser)
      return mockUser
    }
  }

  const logout = () => {
    sessionStorage.removeItem('sl_token')
    sessionStorage.removeItem('sl_user')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(prev => {
      const updated = { ...prev, ...data }
      sessionStorage.setItem('sl_user', JSON.stringify(updated))
      return updated
    })
  }

  function _persist(tok, usr) {
    sessionStorage.setItem('sl_token', tok)
    sessionStorage.setItem('sl_user', JSON.stringify(usr))
    api.defaults.headers.common['Authorization'] = `Bearer ${tok}`
    setToken(tok)
    setUser(usr)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
