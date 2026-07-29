import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { authStorage } from './auth-storage'

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const accessToken = authStorage.getAccessToken()
  if (accessToken) {
    config.headers.set('Authorization', `Bearer ${accessToken}`)
  }
  return config
})

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = authStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const response = await axios.post<{ access: string }>(`${baseURL}/auth/refresh/`, {
    refresh: refreshToken,
  })
  authStorage.setAccessToken(response.data.access)
  return response.data.access
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined

    if (error.response?.status !== 401 || !config || config._retried || config.url?.includes('/auth/')) {
      throw error
    }

    config._retried = true

    try {
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null
      })
      const accessToken = await refreshPromise
      config.headers.set('Authorization', `Bearer ${accessToken}`)
      return apiClient(config)
    } catch (refreshError) {
      authStorage.clear()
      window.location.assign('/login')
      throw refreshError
    }
  },
)
