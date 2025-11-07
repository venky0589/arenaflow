import { create } from 'zustand'
import {
  SchedulableMatch,
  SchedulingSimulationResponse,
  SchedulingBatchResponse,
  CourtAvailability,
  ConflictInfo,
  AutoScheduleRequest,
  ScheduleMatchRequest
} from '../types'
import * as schedulingApi from '../api/scheduling'

interface ScheduleFilters {
  courtIds: number[]
  categoryIds: number[]
  rounds: number[]
  statuses: string[]
  playerSearch: string
  showLocked: boolean
  showConflicts: boolean
  showUnscheduled: boolean
}

interface SchedulingState {
  // Data
  matches: SchedulableMatch[]
  currentSimulation: SchedulingSimulationResponse | null
  currentBatch: SchedulingBatchResponse | null
  courtAvailabilities: CourtAvailability[]
  schedulingBatches: SchedulingBatchResponse[]

  // UI State
  filters: ScheduleFilters
  viewMode: 'day' | 'week'
  selectedDate: Date
  selectedMatchIds: number[]
  conflicts: Map<number, ConflictInfo>

  // Loading states
  loading: boolean
  simulating: boolean
  applying: boolean
  error: string | null

  // Actions - Scheduling
  simulateSchedule: (request: AutoScheduleRequest) => Promise<SchedulingSimulationResponse>
  applySchedule: (batchUuid: string) => Promise<SchedulingBatchResponse>
  scheduleMatch: (matchId: number, request: ScheduleMatchRequest) => Promise<void>

  // Actions - Lock management
  lockMatch: (matchId: number) => Promise<void>
  unlockMatch: (matchId: number) => Promise<void>
  lockMultiple: (matchIds: number[]) => Promise<void>
  unlockMultiple: (matchIds: number[]) => Promise<void>

  // Actions - Data fetching
  fetchSchedulingBatches: (tournamentId: number) => Promise<void>
  fetchCourtAvailability: (courtId?: number, startDate?: string, endDate?: string) => Promise<void>

  // Actions - Court availability
  createCourtAvailability: (availability: Omit<CourtAvailability, 'id' | 'createdAt' | 'createdBy'>) => Promise<void>
  deleteCourtAvailability: (availabilityId: number) => Promise<void>

  // Actions - UI state
  setFilters: (filters: Partial<ScheduleFilters>) => void
  setViewMode: (mode: 'day' | 'week') => void
  setSelectedDate: (date: Date) => void
  setSelectedMatches: (matchIds: number[]) => void
  addConflict: (matchId: number, conflict: ConflictInfo) => void
  removeConflict: (matchId: number) => void
  clearConflicts: () => void

  // Actions - Optimistic updates
  updateMatchOptimistic: (matchId: number, updates: Partial<SchedulableMatch>) => void
  rollbackMatch: (matchId: number, originalMatch: SchedulableMatch) => void

  // Reset
  reset: () => void
}

const initialFilters: ScheduleFilters = {
  courtIds: [],
  categoryIds: [],
  rounds: [],
  statuses: [],
  playerSearch: '',
  showLocked: true,
  showConflicts: true,
  showUnscheduled: true
}

export const useSchedulingStore = create<SchedulingState>((set, get) => ({
  // Initial state
  matches: [],
  currentSimulation: null,
  currentBatch: null,
  courtAvailabilities: [],
  schedulingBatches: [],
  filters: initialFilters,
  viewMode: 'day',
  selectedDate: new Date(),
  selectedMatchIds: [],
  conflicts: new Map(),
  loading: false,
  simulating: false,
  applying: false,
  error: null,

  // Simulate scheduling
  simulateSchedule: async (request: AutoScheduleRequest) => {
    set({ simulating: true, error: null })
    try {
      const response = await schedulingApi.simulateSchedule(request)
      set({
        currentSimulation: response,
        simulating: false
      })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to simulate schedule'
      set({ error: errorMessage, simulating: false })
      throw error
    }
  },

  // Apply scheduling
  applySchedule: async (batchUuid: string) => {
    set({ applying: true, error: null })
    try {
      const response = await schedulingApi.applySchedule(batchUuid)
      set({
        currentBatch: response,
        currentSimulation: null,
        applying: false
      })
      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply schedule'
      set({ error: errorMessage, applying: false })
      throw error
    }
  },

  // Schedule single match
  scheduleMatch: async (matchId: number, request: ScheduleMatchRequest) => {
    set({ loading: true, error: null })
    try {
      const updatedMatch = await schedulingApi.scheduleMatch(matchId, request)
      set((state) => ({
        matches: state.matches.map((m) => m.id === matchId ? updatedMatch : m),
        loading: false
      }))
    } catch (error: any) {
      // Check for optimistic lock error
      if (error.code === 'OPTIMISTIC_LOCK') {
        const errorMessage = 'This match was updated by another user. Please refresh and try again.'
        set({ error: errorMessage, loading: false })
        // Re-throw with enhanced error info for UI to handle
        const enhancedError = new Error(errorMessage) as Error & {
          code: string;
          matchId: number;
          details?: Record<string, any>
        }
        enhancedError.code = 'OPTIMISTIC_LOCK'
        enhancedError.matchId = matchId
        enhancedError.details = error.details
        throw enhancedError
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule match'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Lock match
  lockMatch: async (matchId: number) => {
    set({ loading: true, error: null })
    try {
      const updatedMatch = await schedulingApi.lockMatch(matchId)
      set((state) => ({
        matches: state.matches.map((m) => m.id === matchId ? updatedMatch : m),
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to lock match'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Unlock match
  unlockMatch: async (matchId: number) => {
    set({ loading: true, error: null })
    try {
      const updatedMatch = await schedulingApi.unlockMatch(matchId)
      set((state) => ({
        matches: state.matches.map((m) => m.id === matchId ? updatedMatch : m),
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock match'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Lock multiple matches
  lockMultiple: async (matchIds: number[]) => {
    set({ loading: true, error: null })
    try {
      await Promise.all(matchIds.map(id => schedulingApi.lockMatch(id)))
      // Refetch matches to get updated lock status
      set({ loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to lock matches'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Unlock multiple matches
  unlockMultiple: async (matchIds: number[]) => {
    set({ loading: true, error: null })
    try {
      await Promise.all(matchIds.map(id => schedulingApi.unlockMatch(id)))
      set({ loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock matches'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Fetch scheduling batches
  fetchSchedulingBatches: async (tournamentId: number) => {
    set({ loading: true, error: null })
    try {
      const batches = await schedulingApi.getSchedulingBatches(tournamentId)
      set({ schedulingBatches: batches, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch scheduling batches'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Fetch court availability
  fetchCourtAvailability: async (courtId?: number, startDate?: string, endDate?: string) => {
    set({ loading: true, error: null })
    try {
      const availabilities = await schedulingApi.getCourtAvailability(courtId, startDate, endDate)
      set({ courtAvailabilities: availabilities, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch court availability'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Create court availability
  createCourtAvailability: async (availability) => {
    set({ loading: true, error: null })
    try {
      const created = await schedulingApi.createCourtAvailability(availability)
      set((state) => ({
        courtAvailabilities: [...state.courtAvailabilities, created],
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create court availability'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // Delete court availability
  deleteCourtAvailability: async (availabilityId: number) => {
    set({ loading: true, error: null })
    try {
      await schedulingApi.deleteCourtAvailability(availabilityId)
      set((state) => ({
        courtAvailabilities: state.courtAvailabilities.filter(a => a.id !== availabilityId),
        loading: false
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete court availability'
      set({ error: errorMessage, loading: false })
      throw error
    }
  },

  // UI state setters
  setFilters: (filters: Partial<ScheduleFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters }
    }))
  },

  setViewMode: (mode: 'day' | 'week') => {
    set({ viewMode: mode })
  },

  setSelectedDate: (date: Date) => {
    set({ selectedDate: date })
  },

  setSelectedMatches: (matchIds: number[]) => {
    set({ selectedMatchIds: matchIds })
  },

  addConflict: (matchId: number, conflict: ConflictInfo) => {
    set((state) => {
      const newConflicts = new Map(state.conflicts)
      newConflicts.set(matchId, conflict)
      return { conflicts: newConflicts }
    })
  },

  removeConflict: (matchId: number) => {
    set((state) => {
      const newConflicts = new Map(state.conflicts)
      newConflicts.delete(matchId)
      return { conflicts: newConflicts }
    })
  },

  clearConflicts: () => {
    set({ conflicts: new Map() })
  },

  // Optimistic updates
  updateMatchOptimistic: (matchId: number, updates: Partial<SchedulableMatch>) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, ...updates } : m
      )
    }))
  },

  rollbackMatch: (matchId: number, originalMatch: SchedulableMatch) => {
    set((state) => ({
      matches: state.matches.map((m) =>
        m.id === matchId ? originalMatch : m
      )
    }))
  },

  // Reset state
  reset: () => {
    set({
      matches: [],
      currentSimulation: null,
      currentBatch: null,
      courtAvailabilities: [],
      schedulingBatches: [],
      filters: initialFilters,
      viewMode: 'day',
      selectedDate: new Date(),
      selectedMatchIds: [],
      conflicts: new Map(),
      loading: false,
      simulating: false,
      applying: false,
      error: null
    })
  }
}))
