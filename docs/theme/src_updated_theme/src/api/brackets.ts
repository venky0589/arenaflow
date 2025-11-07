import api from './client'
import type { DrawGenerateRequest, BracketSummaryResponse, Category } from '../types/bracket'

export const bracketsApi = {
  /**
   * Generate a single-elimination draw for a category
   */
  generateDraw: (tournamentId: number, categoryId: number, data: DrawGenerateRequest) =>
    api.post<BracketSummaryResponse>(
      `/api/v1/tournaments/${tournamentId}/categories/${categoryId}/draw:generate`,
      data
    ),

  /**
   * Get the bracket for a category
   */
  getBracket: (categoryId: number) =>
    api.get<BracketSummaryResponse>(`/api/v1/categories/${categoryId}/bracket`),

  /**
   * Delete a draft bracket
   */
  deleteDraftBracket: (categoryId: number) =>
    api.delete(`/api/v1/categories/${categoryId}/bracket?draft=true`),

  /**
   * Get categories for a tournament
   *
   * IMPORTANT: This endpoint needs to be implemented in the backend.
   * Expected endpoint: GET /api/v1/tournaments/{tournamentId}/categories
   *
   * Backend Implementation Needed:
   * - Add getCategoriesByTournament method to CategoryService
   * - Add endpoint to TournamentController or create CategoryController
   * - Return List<CategoryResponse> with all categories for the tournament
   */
  getCategoriesByTournament: (tournamentId: number) =>
    api.get<Category[]>(`/api/v1/tournaments/${tournamentId}/categories`)
}
