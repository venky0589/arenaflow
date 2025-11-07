import api from './client'
import {
  AutoScheduleRequest,
  SchedulingSimulationResponse,
  SchedulingBatchResponse,
  ScheduleMatchRequest,
  SchedulableMatch,
  CourtAvailability
} from '../types'

/**
 * Scheduling API Client
 * Handles all scheduling-related API calls
 */

/**
 * Simulate automatic scheduling (dry-run, no database changes)
 * @param request - Auto-schedule parameters
 * @returns Simulation response with batch UUID for later application
 */
export const simulateSchedule = async (request: AutoScheduleRequest): Promise<SchedulingSimulationResponse> => {
  const response = await api.post<SchedulingSimulationResponse>('/api/v1/scheduling/simulate', request)
  return response.data
}

/**
 * Apply a previously simulated schedule (commits changes to database)
 * @param batchUuid - The UUID from a previous simulation
 * @returns Batch response with final status
 */
export const applySchedule = async (batchUuid: string): Promise<SchedulingBatchResponse> => {
  const response = await api.post<SchedulingBatchResponse>(
    '/api/v1/scheduling/apply',
    null,
    {
      headers: {
        'Idempotency-Key': batchUuid
      }
    }
  )
  return response.data
}

/**
 * Schedule a single match manually
 * @param matchId - The match ID to schedule
 * @param request - Schedule request with time and court
 * @returns Updated match details
 */
export const scheduleMatch = async (
  matchId: number,
  request: ScheduleMatchRequest
): Promise<SchedulableMatch> => {
  const response = await api.put<SchedulableMatch>(`/api/v1/matches/${matchId}/schedule`, request)
  return response.data
}

/**
 * Lock a match to prevent auto-scheduler from modifying it
 * @param matchId - The match ID to lock
 * @returns Updated match with lock info
 */
export const lockMatch = async (matchId: number): Promise<SchedulableMatch> => {
  const response = await api.put<SchedulableMatch>(`/api/v1/matches/${matchId}/lock`)
  return response.data
}

/**
 * Unlock a match to allow auto-scheduler to modify it
 * @param matchId - The match ID to unlock
 * @returns Updated match with lock removed
 */
export const unlockMatch = async (matchId: number): Promise<SchedulableMatch> => {
  const response = await api.put<SchedulableMatch>(`/api/v1/matches/${matchId}/unlock`)
  return response.data
}

/**
 * Get all scheduling batches for a tournament (audit trail)
 * @param tournamentId - The tournament ID
 * @returns List of scheduling batches
 */
export const getSchedulingBatches = async (tournamentId: number): Promise<SchedulingBatchResponse[]> => {
  const response = await api.get<SchedulingBatchResponse[]>(
    `/api/v1/scheduling/batches?tournamentId=${tournamentId}`
  )
  return response.data
}

/**
 * Get court availability/blackout periods
 * @param courtId - Optional court ID to filter
 * @param startDate - Optional start date filter
 * @param endDate - Optional end date filter
 * @returns List of court availability records
 */
export const getCourtAvailability = async (
  courtId?: number,
  startDate?: string,
  endDate?: string
): Promise<CourtAvailability[]> => {
  const params = new URLSearchParams()
  if (courtId) params.append('courtId', courtId.toString())
  if (startDate) params.append('startDate', startDate)
  if (endDate) params.append('endDate', endDate)

  const response = await api.get<CourtAvailability[]>(
    `/api/v1/courts/availability?${params.toString()}`
  )
  return response.data
}

/**
 * Create a court blackout period
 * @param availability - Court availability details
 * @returns Created availability record
 */
export const createCourtAvailability = async (
  availability: Omit<CourtAvailability, 'id' | 'createdAt' | 'createdBy'>
): Promise<CourtAvailability> => {
  const response = await api.post<CourtAvailability>('/api/v1/courts/availability', availability)
  return response.data
}

/**
 * Delete a court blackout period
 * @param availabilityId - The availability record ID
 */
export const deleteCourtAvailability = async (availabilityId: number): Promise<void> => {
  await api.delete(`/api/v1/courts/availability/${availabilityId}`)
}
