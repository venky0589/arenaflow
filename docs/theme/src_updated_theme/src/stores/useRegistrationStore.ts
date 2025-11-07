import { create } from 'zustand'
import api from '../api/client'
import { Registration, PageableResponse } from '../types'
import { checkInRegistration, undoCheckInRegistration } from '../api/registrations'

interface RegistrationState {
  registrations: Registration[]
  loading: boolean
  error: string | null
  // Pagination state
  page: number
  size: number
  totalPages: number
  totalElements: number

  fetchRegistrations: (page?: number, size?: number) => Promise<void>
  createRegistration: (registration: any) => Promise<void>
  updateRegistration: (id: number, registration: any) => Promise<void>
  deleteRegistration: (id: number) => Promise<void>
  checkIn: (id: number) => Promise<void>
  undoCheckIn: (id: number) => Promise<void>
  setPage: (page: number) => void
  setSize: (size: number) => void
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchRegistrations: async (page?: number, size?: number) => {
    const currentPage = page ?? get().page
    const currentSize = size ?? get().size

    set({ loading: true, error: null })
    try {
      const response = await api.get<PageableResponse<Registration>>(
        `/api/v1/registrations?page=${currentPage}&size=${currentSize}`
      )
      set({
        registrations: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
        size: response.data.size,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch registrations', loading: false })
      throw error
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchRegistrations(page)
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
    get().fetchRegistrations(0, size)
  },

  createRegistration: async (registration) => {
    try {
      const response = await api.post<Registration>('/api/v1/registrations', registration)
      set((state) => ({
        registrations: [...state.registrations, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateRegistration: async (id, registration) => {
    try {
      const response = await api.put<Registration>(`/api/v1/registrations/${id}`, registration)
      set((state) => ({
        registrations: state.registrations.map((r) => (r.id === id ? response.data : r)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteRegistration: async (id) => {
    try {
      await api.delete(`/api/v1/registrations/${id}`)
      set((state) => ({
        registrations: state.registrations.filter((r) => r.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },

  checkIn: async (id) => {
    try {
      // Optimistic update
      set((state) => ({
        registrations: state.registrations.map((r) =>
          r.id === id ? { ...r, checkedIn: true, checkedInAt: new Date().toISOString() } : r
        ),
      }))

      // API call
      const updated = await checkInRegistration(id)

      // Update with server response
      set((state) => ({
        registrations: state.registrations.map((r) => (r.id === id ? updated : r)),
      }))
    } catch (error) {
      // Rollback on error
      await get().fetchRegistrations()
      throw error
    }
  },

  undoCheckIn: async (id) => {
    try {
      // Optimistic update
      set((state) => ({
        registrations: state.registrations.map((r) =>
          r.id === id ? { ...r, checkedIn: false, checkedInAt: null } : r
        ),
      }))

      // API call
      const updated = await undoCheckInRegistration(id)

      // Update with server response
      set((state) => ({
        registrations: state.registrations.map((r) => (r.id === id ? updated : r)),
      }))
    } catch (error) {
      // Rollback on error
      await get().fetchRegistrations()
      throw error
    }
  },
}))
