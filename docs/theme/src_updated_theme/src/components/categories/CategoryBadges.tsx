import { Chip, Stack } from '@mui/material'
import type { Category, GenderRestriction, TournamentFormat } from '../../types'

interface CategoryBadgesProps {
  category: Category | Partial<Category>
  size?: 'small' | 'medium'
}

/**
 * CategoryBadges Component
 *
 * Displays compact visual chips showing category rules:
 * - Tournament format (SINGLE_ELIMINATION/ROUND_ROBIN) with color coding
 * - Gender restriction (MALE/FEMALE/OPEN) with color coding
 * - Age range (e.g., "Age: 18-40", "Age: 40+", "Age: <18")
 * - Capacity (e.g., "Cap: 64" or "Unlimited")
 * - Registration fee (e.g., "Free" or "₹500")
 *
 * Usage:
 *   <CategoryBadges category={category} />
 *   <CategoryBadges category={formData} size="small" /> // Live preview in form
 */
export function CategoryBadges({ category, size = 'small' }: CategoryBadgesProps) {
  const { format, genderRestriction, minAge, maxAge, maxParticipants, registrationFee } = category

  // Format badge custom styling
  const getFormatStyle = (fmt?: TournamentFormat) => {
    switch (fmt) {
      case 'SINGLE_ELIMINATION':
        return {
          backgroundColor: '#9C27B0', // Material Purple
          color: '#FFFFFF'
        }
      case 'ROUND_ROBIN':
        return {
          backgroundColor: '#FF9800', // Material Orange (indicates V2)
          color: '#FFFFFF'
        }
      default:
        return {}
    }
  }

  // Format label (user-friendly)
  const getFormatLabel = (fmt?: TournamentFormat) => {
    switch (fmt) {
      case 'SINGLE_ELIMINATION':
        return 'SE'
      case 'ROUND_ROBIN':
        return 'RR (V2)'
      default:
        return fmt || 'Unknown'
    }
  }

  // Gender badge custom styling (bypasses theme colors)
  const getGenderStyle = (gender?: GenderRestriction) => {
    switch (gender) {
      case 'MALE':
        return {
          backgroundColor: '#2196F3', // Material Blue
          color: '#FFFFFF'
        }
      case 'FEMALE':
        return {
          backgroundColor: '#E91E63', // Material Pink
          color: '#FFFFFF'
        }
      case 'OPEN':
        return {
          backgroundColor: '#4CAF50', // Material Green
          color: '#FFFFFF'
        }
      default:
        return {}
    }
  }

  // Format age range badge label
  const getAgeLabel = () => {
    if (minAge !== null && minAge !== undefined && maxAge !== null && maxAge !== undefined) {
      return `Age: ${minAge}-${maxAge}`
    }
    if (minAge !== null && minAge !== undefined) {
      return `Age: ${minAge}+`
    }
    if (maxAge !== null && maxAge !== undefined) {
      return `Age: ≤${maxAge}`
    }
    return null
  }

  // Format capacity badge label
  const getCapacityLabel = () => {
    if (maxParticipants !== null && maxParticipants !== undefined) {
      return `Cap: ${maxParticipants}`
    }
    return 'Unlimited'
  }

  // Format fee badge label
  const getFeeLabel = () => {
    if (registrationFee === 0 || registrationFee === null || registrationFee === undefined) {
      return 'Free'
    }
    return `₹${registrationFee.toFixed(2)}`
  }

  const ageLabel = getAgeLabel()

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {/* Format Badge (First - most important for V2 visibility) */}
      {format && (
        <Chip
          label={getFormatLabel(format)}
          size={size}
          sx={getFormatStyle(format)}
        />
      )}

      {/* Gender Restriction Badge */}
      {genderRestriction && (
        <Chip
          label={genderRestriction}
          size={size}
          sx={getGenderStyle(genderRestriction)}
        />
      )}

      {/* Age Range Badge */}
      {ageLabel && (
        <Chip
          label={ageLabel}
          color="default"
          size={size}
          variant="outlined"
        />
      )}

      {/* Capacity Badge */}
      <Chip
        label={getCapacityLabel()}
        color="default"
        size={size}
        variant="outlined"
      />

      {/* Registration Fee Badge */}
      <Chip
        label={getFeeLabel()}
        color={registrationFee && registrationFee > 0 ? 'warning' : 'default'}
        size={size}
        variant={registrationFee && registrationFee > 0 ? 'filled' : 'outlined'}
      />
    </Stack>
  )
}
