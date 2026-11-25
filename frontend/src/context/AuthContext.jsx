import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('chinese_user') || localStorage.getItem('mandarin_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() =>
    localStorage.getItem('chinese_access_token') || localStorage.getItem('mandarin_access_token')
  )
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('chinese_access_token')
    localStorage.removeItem('chinese_user')
    localStorage.removeItem('chinese_flashcard_progress')
    localStorage.removeItem('mandarin_access_token')
    localStorage.removeItem('mandarin_user')
    localStorage.removeItem('mandarin_flashcard_progress')
  }, [])

  // Validate or fetch user profile on initial load if token exists
  useEffect(() => {
    let isMounted = true

    const verifyToken = async () => {
      const storedToken = localStorage.getItem('chinese_access_token') || localStorage.getItem('mandarin_access_token')
      if (!storedToken) {
        if (isMounted) setLoading(false)
        return
      }

      try {
        const response = await authService.getProfile()
        if (isMounted && response.data?.status === 'success') {
          setUser(response.data.data)
          localStorage.setItem('chinese_user', JSON.stringify(response.data.data))
          localStorage.setItem('mandarin_user', JSON.stringify(response.data.data))
        }
      } catch {
        if (isMounted) {
          logout()
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    verifyToken()

    return () => {
      isMounted = false
    }
  }, [logout])

  const login = async (email, password) => {
    const response = await authService.login(email, password)
    if (response.data?.status === 'success') {
      const { access_token, user: userData } = response.data.data
      setToken(access_token)
      setUser(userData)
      localStorage.setItem('chinese_access_token', access_token)
      localStorage.setItem('chinese_user', JSON.stringify(userData))
      localStorage.setItem('mandarin_access_token', access_token)
      localStorage.setItem('mandarin_user', JSON.stringify(userData))
      return { success: true, user: userData }
    }
    return {
      success: false,
      message: response.data?.message || 'Login gagal.',
    }
  }

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password)
    if (response.data?.status === 'success') {
      // Auto-login after successful registration
      return await login(email, password)
    }
    return {
      success: false,
      message: response.data?.message || 'Registrasi gagal.',
    }
  }

  const updateUser = (userData) => {
    setUser(userData)
    localStorage.setItem('chinese_user', JSON.stringify(userData))
    localStorage.setItem('mandarin_user', JSON.stringify(userData))
  }

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext

