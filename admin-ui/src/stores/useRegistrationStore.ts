import { create } from 'zustand'
import api from '../api/client'

export interface Registration {
  id: number
  tournament: any
  player: any
  categoryType: 'SINGLES' | 'DOUBLES'
}

interface RegistrationState {
  registrations: Registration[]
  loading: boolean
  error: string | null

  fetchRegistrations: () => Promise<void>
  createRegistration: (registration: any) => Promise<void>
  updateRegistration: (id: number, registration: any) => Promise<void>
  deleteRegistration: (id: number) => Promise<void>
}

export const useRegistrationStore = create<RegistrationState>((set, get) => ({
  registrations: [],
  loading: false,
  error: null,

  fetchRegistrations: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get<Registration[]>('/api/v1/registrations')
      set({ registrations: response.data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch registrations', loading: false })
      throw error
    }
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
}))
