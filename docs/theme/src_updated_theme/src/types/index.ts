// Pagination types - matches Spring Data Page structure
export interface PageableResponse<T> {
  content: T[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  last: boolean
  totalPages: number
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

// Tournament types
export interface Tournament {
  id: number
  name: string
  location: string
  startDate: string
  endDate: string
}

export interface TournamentResponse {
  content: Tournament[]
}

// Player types
export interface Player {
  id: number
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  phone?: string
}

// Court types
export interface Court {
  id: number
  name: string
  locationNote: string
}

// Match types
export type MatchStatus = 'SCHEDULED' | 'READY_TO_START' | 'IN_PROGRESS' | 'COMPLETED' | 'WALKOVER' | 'RETIRED'

export interface Match {
  id: number
  tournament: Tournament | { id: number }
  court: Court | { id: number }
  player1: Player | { id: number }
  player2: Player | { id: number }
  score1?: number
  score2?: number
  status: MatchStatus
  statusReason?: string
  startedAt?: string
  endedAt?: string
  scheduledAt: string
  version?: number  // For optimistic locking
}

// Registration types
export interface Registration {
  id: number
  tournament: Tournament | { id: number }
  player: Player | { id: number }
  categoryType: 'SINGLES' | 'DOUBLES'
  scheduledTime?: string | null
  checkedIn?: boolean
  checkedInAt?: string | null
}

// API request/response types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  email?: string
}

export interface CreateTournamentRequest {
  name: string
  location: string
  startDate: string
  endDate: string
}

export interface UpdateTournamentRequest extends Partial<CreateTournamentRequest> { }

export interface CreatePlayerRequest {
  firstName: string
  lastName: string
  gender: 'M' | 'F'
  phone?: string
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> { }

export interface CreateCourtRequest {
  name: string
  locationNote: string
}

export interface UpdateCourtRequest extends Partial<CreateCourtRequest> { }

export interface CreateMatchRequest {
  tournament: { id: number }
  court: { id: number }
  player1: { id: number }
  player2: { id: number }
  score1?: number
  score2?: number
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED'
  scheduledAt: string
}

export interface UpdateMatchRequest extends Partial<CreateMatchRequest> { }

export interface CreateRegistrationRequest {
  tournament: { id: number }
  player: { id: number }
  categoryType: 'SINGLES' | 'DOUBLES'
}

export interface UpdateRegistrationRequest extends Partial<CreateRegistrationRequest> { }

// Notification types
export type NotificationSeverity = 'success' | 'error' | 'info' | 'warning'

// Scheduling types
export interface ScheduleMatchRequest {
  scheduledAt: string
  courtId: number
  estimatedDurationMinutes?: number
  version: number  // Required for optimistic locking
}

export interface AutoScheduleRequest {
  tournamentId: number
  startDateTime: string
  endDateTime: string
  defaultDurationMinutes?: number
  bufferMinutes?: number
}

export interface SimulatedMatchSchedule {
  matchId: number
  courtId: number
  courtName: string
  scheduledAt: string
  durationMinutes: number
  player1Name: string
  player2Name: string
}

export interface SchedulingSimulationResponse {
  batchUuid: string
  tournamentId: number
  startDateTime: string
  endDateTime: string
  totalMatches: number
  scheduledCount: number
  unscheduledCount: number
  fillPercentage: number
  meanPlayerRestMinutes: number
  courtUtilizationJson: string
  courtBalanceScore: number
  courtBalanceStdDev: number
  warnings: string[]
  scheduledMatches: SimulatedMatchSchedule[]
}

export type BatchStatus = 'SIMULATED' | 'APPLIED' | 'FAILED'

export interface SchedulingBatchResponse {
  id: number
  batchUuid: string
  tournamentId: number
  status: BatchStatus
  startDateTime: string
  endDateTime: string
  totalMatches: number
  scheduledCount: number
  fillPercentage: number
  meanPlayerRestMinutes: number
  courtUtilizationJson: string
  courtBalanceScore: number
  courtBalanceStdDev: number
  warnings: string[]
  createdAt: string
  createdBy: string
  appliedAt?: string
  appliedBy?: string
}

export interface CourtAvailability {
  id: number
  court: Court | { id: number }
  unavailableFrom: string
  unavailableUntil: string
  reason: 'MAINTENANCE' | 'LUNCH_BREAK' | 'RESERVED' | 'EVENT'
  notes?: string
  createdAt: string
  createdBy: string
}

export type ConflictType = 'HARD' | 'SOFT'

export interface ConflictInfo {
  type: ConflictType
  message: string
  details?: string
}

// Extended Match type with scheduling fields
export interface SchedulableMatch extends Match {
  locked?: boolean
  lockedAt?: string
  lockedBy?: string
  nextMatchId?: number
  categoryId?: number
  round?: number
  position?: number
  winnerAdvancesAs?: string
  estimatedDurationMinutes?: number
  scheduledEndAt?: string
}

// Category types
export type GenderRestriction = 'MALE' | 'FEMALE' | 'OPEN'
export type CategoryType = 'SINGLES' | 'DOUBLES'
export type TournamentFormat = 'SINGLE_ELIMINATION' | 'ROUND_ROBIN'

export interface Category {
  id: number
  tournamentId: number
  name: string
  categoryType: CategoryType
  format: TournamentFormat
  genderRestriction: GenderRestriction
  minAge?: number | null
  maxAge?: number | null
  maxParticipants?: number | null
  registrationFee: number
}

export interface CreateCategoryRequest {
  tournamentId: number
  name: string
  categoryType: CategoryType
  format: TournamentFormat
  genderRestriction: GenderRestriction
  minAge?: number | null
  maxAge?: number | null
  maxParticipants?: number | null
  registrationFee: number
}

export interface UpdateCategoryRequest extends Partial<Omit<CreateCategoryRequest, 'tournamentId'>> { }

// Error types for check-in feature
export interface TimeWindowError {
  code: 'TIME_WINDOW_VIOLATION'
  message: string
  details: {
    scheduledTime: string
    allowedFrom: string
    allowedTo: string
    now: string
  }
}

export interface ApiErrorResponse {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  code?: string
  details?: Record<string, any>
  validationErrors?: Record<string, string>
}
