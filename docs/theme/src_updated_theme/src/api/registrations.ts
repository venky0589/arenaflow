import api from './client'
import { Registration, ApiErrorResponse } from '../types'

/**
 * API client for registration check-in operations
 */

/**
 * Batch check-in response from backend
 */
export interface BatchCheckInResponse {
  successfulIds: number[]
  failures: BatchCheckInFailure[]
  totalProcessed: number
  successCount: number
  failureCount: number
}

export interface BatchCheckInFailure {
  registrationId: number
  reason: string
  errorCode: string
}

/**
 * Check in a player for their registration
 * @param id Registration ID
 * @returns Updated registration with check-in details
 * @throws ApiErrorResponse with code 'TIME_WINDOW_VIOLATION' if outside allowed time window
 * @throws ApiErrorResponse with code 'STATE_CONFLICT' if already checked in
 */
export async function checkInRegistration(id: number): Promise<Registration> {
  try {
    const response = await api.post<Registration>(`/api/v1/registrations/${id}/check-in`)
    return response.data
  } catch (error: any) {
    // Re-throw with enhanced error information
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse
    }
    throw error
  }
}

/**
 * Undo check-in for a registration
 * @param id Registration ID
 * @returns Updated registration with check-in removed
 * @throws ApiErrorResponse with code 'STATE_CONFLICT' if not checked in
 */
export async function undoCheckInRegistration(id: number): Promise<Registration> {
  try {
    const response = await api.post<Registration>(`/api/v1/registrations/${id}/undo-check-in`)
    return response.data
  } catch (error: any) {
    // Re-throw with enhanced error information
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse
    }
    throw error
  }
}

/**
 * Batch check-in multiple registrations
 * @param registrationIds List of registration IDs to check in
 * @returns Batch result with successes and failures
 */
export async function batchCheckInRegistrations(registrationIds: number[]): Promise<BatchCheckInResponse> {
  try {
    const response = await api.post<BatchCheckInResponse>('/api/v1/registrations/batch-check-in', {
      registrationIds
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse
    }
    throw error
  }
}

/**
 * Batch undo check-in for multiple registrations
 * @param registrationIds List of registration IDs to undo check-in
 * @returns Batch result with successes and failures
 */
export async function batchUndoCheckInRegistrations(registrationIds: number[]): Promise<BatchCheckInResponse> {
  try {
    const response = await api.post<BatchCheckInResponse>('/api/v1/registrations/batch-undo-check-in', {
      registrationIds
    })
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse
    }
    throw error
  }
}

/**
 * Sync registration's scheduled time from the earliest assigned match
 * @param id Registration ID
 * @returns Updated registration with synced scheduled time
 */
export async function syncScheduledTimeFromMatch(id: number): Promise<Registration> {
  try {
    const response = await api.put<Registration>(`/api/v1/registrations/${id}/sync-scheduled-time`)
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      throw error.response.data as ApiErrorResponse
    }
    throw error
  }
}
