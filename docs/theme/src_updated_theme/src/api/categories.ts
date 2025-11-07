import api from './client'
import type { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types'

export const categoriesApi = {
  /**
   * Get all categories for a tournament
   */
  getCategoriesByTournament: (tournamentId: number) =>
    api.get<Category[]>(`/api/v1/tournaments/${tournamentId}/categories`),

  /**
   * Get category by ID
   */
  getCategoryById: (id: number) =>
    api.get<Category>(`/api/v1/categories/${id}`),

  /**
   * Create a new category
   */
  createCategory: (data: CreateCategoryRequest) =>
    api.post<Category>('/api/v1/categories', data),

  /**
   * Update an existing category
   */
  updateCategory: (id: number, data: UpdateCategoryRequest) =>
    api.put<Category>(`/api/v1/categories/${id}`, data),

  /**
   * Delete a category
   */
  deleteCategory: (id: number) =>
    api.delete(`/api/v1/categories/${id}`)
}
