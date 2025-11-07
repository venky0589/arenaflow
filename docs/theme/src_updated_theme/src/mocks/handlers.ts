import { http, HttpResponse } from 'msw'
import type { Tournament, Category, TournamentRole } from '../types'

const BASE_URL = 'http://localhost:8080'

// Mock data
const mockTournaments: Tournament[] = [
  {
    id: 1,
    name: 'City Open 2025',
    location: 'Hyderabad',
    startDate: '2025-03-01',
    endDate: '2025-03-05',
  },
  {
    id: 2,
    name: 'Winter Cup 2025',
    location: 'Bengaluru',
    startDate: '2025-04-01',
    endDate: '2025-04-05',
  },
]

const mockCategories: Record<number, Category[]> = {
  1: [
    {
      id: 1,
      tournamentId: 1,
      name: "Men's Singles U13",
      categoryType: 'SINGLES',
      format: 'SINGLE_ELIMINATION',
      genderRestriction: 'MALE',
      minAge: null,
      maxAge: 13,
      maxParticipants: 16,
      registrationFee: 200,
    },
    {
      id: 2,
      tournamentId: 1,
      name: "Women's Singles U13",
      categoryType: 'SINGLES',
      format: 'SINGLE_ELIMINATION',
      genderRestriction: 'FEMALE',
      minAge: null,
      maxAge: 13,
      maxParticipants: 16,
      registrationFee: 200,
    },
  ],
  2: [],
}

export const handlers = [
  // GET /api/v1/tournaments - List all tournaments
  http.get(`${BASE_URL}/api/v1/tournaments`, () => {
    return HttpResponse.json(mockTournaments)
  }),

  // GET /api/v1/tournaments/:tid/categories - List categories for tournament
  http.get(`${BASE_URL}/api/v1/tournaments/:tid/categories`, ({ params }) => {
    const tid = Number(params.tid)
    const categories = mockCategories[tid] || []
    return HttpResponse.json(categories)
  }),

  // GET /api/v1/categories/:id - Get single category
  http.get(`${BASE_URL}/api/v1/categories/:id`, ({ params }) => {
    const id = Number(params.id)
    const allCategories = Object.values(mockCategories).flat()
    const category = allCategories.find((c) => c.id === id)

    if (!category) {
      return new HttpResponse(null, { status: 404 })
    }

    return HttpResponse.json(category)
  }),

  // POST /api/v1/categories - Create category
  http.post(`${BASE_URL}/api/v1/categories`, async ({ request }) => {
    const body = (await request.json()) as Omit<Category, 'id'>
    const newCategory: Category = {
      ...body,
      id: Math.floor(Math.random() * 10000),
    }

    // Add to mock data
    if (!mockCategories[body.tournamentId]) {
      mockCategories[body.tournamentId] = []
    }
    mockCategories[body.tournamentId].push(newCategory)

    return HttpResponse.json(newCategory, { status: 201 })
  }),

  // PUT /api/v1/categories/:id - Update category
  http.put(`${BASE_URL}/api/v1/categories/:id`, async ({ params, request }) => {
    const id = Number(params.id)
    const updates = (await request.json()) as Partial<Category>

    const allCategories = Object.values(mockCategories).flat()
    const category = allCategories.find((c) => c.id === id)

    if (!category) {
      return new HttpResponse(null, { status: 404 })
    }

    const updated = { ...category, ...updates }
    return HttpResponse.json(updated)
  }),

  // DELETE /api/v1/categories/:id - Delete category
  http.delete(`${BASE_URL}/api/v1/categories/:id`, ({ params }) => {
    const id = Number(params.id)

    // Find and remove from mock data
    for (const tid in mockCategories) {
      const index = mockCategories[tid].findIndex((c) => c.id === id)
      if (index !== -1) {
        mockCategories[tid].splice(index, 1)
        return new HttpResponse(null, { status: 204 })
      }
    }

    return new HttpResponse(null, { status: 404 })
  }),

  // GET /api/v1/tournaments/:tid/roles/me - Get current user's roles in tournament
  http.get(`${BASE_URL}/api/v1/tournaments/:tid/roles/me`, () => {
    // Default: return OWNER role (full permission)
    const roles: TournamentRole[] = ['OWNER']
    return HttpResponse.json(roles)
  }),
]
