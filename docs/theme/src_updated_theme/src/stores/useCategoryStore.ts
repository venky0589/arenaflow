import { create } from 'zustand'
import { categoriesApi } from '../api/categories'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null
  selectedTournamentId: number | null

  fetchCategoriesByTournament: (tournamentId: number) => Promise<void>
  createCategory: (category: CreateCategoryRequest) => Promise<void>
  updateCategory: (id: number, category: UpdateCategoryRequest) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
  setSelectedTournamentId: (tournamentId: number | null) => void
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,
  selectedTournamentId: null,

  setSelectedTournamentId: (tournamentId) => {
    set({ selectedTournamentId: tournamentId })
  },

  fetchCategoriesByTournament: async (tournamentId: number) => {
    set({ loading: true, error: null, selectedTournamentId: tournamentId })
    try {
      const response = await categoriesApi.getCategoriesByTournament(tournamentId)
      set({
        categories: response.data,
        loading: false
      })
    } catch (error) {
      set({ error: 'Failed to fetch categories', loading: false })
      throw error
    }
  },

  createCategory: async (category) => {
    try {
      const response = await categoriesApi.createCategory(category)
      set((state) => ({
        categories: [...state.categories, response.data],
      }))
    } catch (error) {
      throw error
    }
  },

  updateCategory: async (id, category) => {
    try {
      const response = await categoriesApi.updateCategory(id, category)
      set((state) => ({
        categories: state.categories.map((c) => (c.id === id ? response.data : c)),
      }))
    } catch (error) {
      throw error
    }
  },

  deleteCategory: async (id) => {
    try {
      await categoriesApi.deleteCategory(id)
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }))
    } catch (error) {
      throw error
    }
  },
}))
