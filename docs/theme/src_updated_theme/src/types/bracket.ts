// Bracket and Draw Generation Types

export interface SeedEntry {
  registrationId: number
  seedNumber: number
}

export interface DrawGenerateRequest {
  overwriteIfDraft: boolean
  seeds?: SeedEntry[]
}

export interface MatchDto {
  id: number
  round: number
  position: number
  participant1RegistrationId?: number
  participant2RegistrationId?: number
  bye: boolean
  nextMatchId?: number
  winnerAdvancesAs?: 1 | 2
  status: string
}

export interface BracketSummaryResponse {
  categoryId: number
  totalParticipants: number
  effectiveSize: number
  rounds: number
  matches: MatchDto[]
}

// Category types (aligned with backend)
export interface Category {
  id: number
  tournament: { id: number }
  name: string
  categoryType: 'SINGLES' | 'DOUBLES'
  format: 'SINGLE_ELIMINATION' | 'ROUND_ROBIN'
  genderRestriction?: string
  minAge?: number
  maxAge?: number
  maxParticipants?: number
  registrationFee?: number
}
