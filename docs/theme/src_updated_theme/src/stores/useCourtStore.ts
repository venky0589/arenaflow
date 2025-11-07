import { create } from 'zustand'
import api from '../api/client'
import { Court, PageableResponse } from '../types'

interface CourtState {
  courts: Court[]
  loading: boolean
  error: string | null
  // Pagination state
  page: number
  size: number
  totalPages: number
  totalElements: number

  fetchCourts: (page?: number, size?: number) => Promise<void>
  createCourt: (court: Omit<Court, 'id'>) => Promise<void>
  updateCourt: (id: number, court: Partial<Court>) => Promise<void>
  deleteCourt: (id: number) => Promise<void>
  setPage: (page: number) => void
  setSize: (size: number) => void
}

export const useCourtStore = create<CourtState>((set, get) => ({
  courts: [],
  loading: false,
  error: null,
  page: 0,
  size: 20,
  totalPages: 0,
  totalElements: 0,

  fetchCourts: async (page?: number, size?: number) => {
    const currentPage = page ?? get().page
    const currentSize = size ?? get().size

    set({ loading: true, error: null })
    try {
      const response = await api.get<PageableResponse<Court>>(
        `/api/v1/courts?page=${currentPage}&size=${currentSize}`
      )
      set({
        courts: response.data.content,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        page: response.data.number,
        size: response.data.size,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch courts', loading: false })
      throw error
    }
  },

  setPage: (page: number) => {
    set({ page })
    get().fetchCourts(page)
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
    get().fetchCourts(0, size)
  },

  createCourt: async (court) => {
    try {
      const response = await api.post<Court>('/api/v1/courts', court)
      set((state) => ({
        courts: [...state.courts, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateCourt: async (id, court) => {
    try {
      const response = await api.put<Court>(`/api/v1/courts/${id}`, court)
      set((state) => ({
        courts: state.courts.map((c) => (c.id === id ? response.data : c)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteCourt: async (id) => {
    try {
      await api.delete(`/api/v1/courts/${id}`)
      set((state) => ({
        courts: state.courts.filter((c) => c.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
