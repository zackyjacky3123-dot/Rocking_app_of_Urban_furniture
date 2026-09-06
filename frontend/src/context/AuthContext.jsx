import { createContext, useContext, useMemo, useState } from 'react'
import { login as loginApi } from '../api/users'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('uf_user') || 'null') } catch { return null }
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password) => {
    setLoading(true)
    try {
      const result = await loginApi({ username, password })
      const normalized = result?.user || result
      if (result?.token) localStorage.setItem('uf_token', result.token)
      localStorage.setItem('uf_user', JSON.stringify(normalized))
      setUser(normalized)
      return normalized
    } finally { setLoading(false) }
  }

  const logout = () => {
    localStorage.removeItem('uf_token')
    localStorage.removeItem('uf_user')
    setUser(null)
  }

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
