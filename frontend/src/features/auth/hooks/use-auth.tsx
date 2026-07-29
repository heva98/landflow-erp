import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createContext, useContext, useState, type ReactNode } from 'react'

import { authStorage } from '@/lib/auth-storage'

import { fetchMe, login as loginRequest } from '../api/auth-api'
import type { LoginCredentials, Me } from '../types'

interface AuthContextValue {
  user: Me | undefined
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [hasToken, setHasToken] = useState(() => Boolean(authStorage.getAccessToken()))

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: fetchMe,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const isAuthenticated = hasToken && Boolean(meQuery.data) && !meQuery.isError

  async function login(credentials: LoginCredentials) {
    const tokens = await loginRequest(credentials)
    authStorage.setTokens(tokens.access, tokens.refresh)
    setHasToken(true)
    await queryClient.invalidateQueries({ queryKey: ['me'] })
  }

  function logout() {
    authStorage.clear()
    setHasToken(false)
    queryClient.removeQueries({ queryKey: ['me'] })
  }

  return (
    <AuthContext.Provider
      value={{
        user: meQuery.data,
        isLoading: hasToken && meQuery.isPending,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
