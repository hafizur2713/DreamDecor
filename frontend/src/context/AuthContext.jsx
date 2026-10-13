import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function getSavedUser() {
  try {
    const raw =
      localStorage.getItem('dreamdecorUser') || localStorage.getItem('dreamdecor-user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('dreamdecorToken') || localStorage.getItem('dreamdecor-token'),
  )
  const [user, setUser] = useState(getSavedUser)

  function login(newToken, newUser) {
    // Support both login(token, user) and login({ token, user })
    if (newToken && typeof newToken === 'object' && 'token' in newToken) {
      newUser = newToken.user
      newToken = newToken.token
    }

    localStorage.setItem('dreamdecorToken', newToken)
    localStorage.setItem('dreamdecorUser', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    localStorage.removeItem('dreamdecorToken')
    localStorage.removeItem('dreamdecorUser')
    localStorage.removeItem('dreamdecor-token')
    localStorage.removeItem('dreamdecor-user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}