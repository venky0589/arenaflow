import axios, { AxiosError } from 'axios'
import { ApiErrorResponse } from '../types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8080'
})

// Request interceptor: Add JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Handle errors and parse API error responses
api.interceptors.response.use(
  response => response,
  (error: AxiosError<ApiErrorResponse>) => {
    // If the error has a response with our standard error format, enhance it
    if (error.response?.data) {
      const apiError = error.response.data

      // Create a custom error with additional properties
      const enhancedError = new Error(apiError.message || error.message) as Error & {
        code?: string
        status?: number
        details?: Record<string, any>
        validationErrors?: Record<string, string>
        originalError: AxiosError<ApiErrorResponse>
      }

      enhancedError.code = apiError.code
      enhancedError.status = apiError.status
      enhancedError.details = apiError.details
      enhancedError.validationErrors = apiError.validationErrors
      enhancedError.originalError = error

      return Promise.reject(enhancedError)
    }

    // If no structured error response, return original error
    return Promise.reject(error)
  }
)

export default api

// Type guard to check if error is an API error with code
export function isApiErrorWithCode(error: any): error is Error & { code: string; details?: Record<string, any> } {
  return error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
}
