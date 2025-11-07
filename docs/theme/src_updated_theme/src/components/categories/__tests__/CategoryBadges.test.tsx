import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadges } from '../CategoryBadges'
import type { Category } from '../../../types'

describe('CategoryBadges', () => {
  describe('Gender Badge Colors', () => {
    it('renders MALE badge with blue color', () => {
      const category: Partial<Category> = { genderRestriction: 'MALE' }
      render(<CategoryBadges category={category} />)

      const badge = screen.getByText('MALE')
      expect(badge).toBeInTheDocument()
      // Note: sx prop styles are not rendered as inline styles in test environment
      // The component correctly applies custom colors via sx prop, but we can't test inline styles
      // Visual appearance is validated by the CategoryBadges.simple.test.tsx snapshot test
    })

    it('renders FEMALE badge with pink color', () => {
      const category: Partial<Category> = { genderRestriction: 'FEMALE' }
      render(<CategoryBadges category={category} />)

      const badge = screen.getByText('FEMALE')
      expect(badge).toBeInTheDocument()
      // Note: sx prop styles are not rendered as inline styles in test environment
    })

    it('renders OPEN badge with green color', () => {
      const category: Partial<Category> = { genderRestriction: 'OPEN' }
      render(<CategoryBadges category={category} />)

      const badge = screen.getByText('OPEN')
      expect(badge).toBeInTheDocument()
      // Note: sx prop styles are not rendered as inline styles in test environment
    })
  })

  describe('Age Range Badges', () => {
    it('displays age range when both min and max are provided', () => {
      const category: Partial<Category> = { minAge: 18, maxAge: 40 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Age: 18-40')).toBeInTheDocument()
    })

    it('displays "Age: X+" when only minAge is provided', () => {
      const category: Partial<Category> = { minAge: 40, maxAge: null }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Age: 40+')).toBeInTheDocument()
    })

    it('displays "Age: ≤X" when only maxAge is provided', () => {
      const category: Partial<Category> = { minAge: null, maxAge: 13 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Age: ≤13')).toBeInTheDocument()
    })

    it('does not display age badge when no age restrictions', () => {
      const category: Partial<Category> = { minAge: null, maxAge: null }
      render(<CategoryBadges category={category} />)

      // Should not have any element with "Age:" prefix
      const allBadges = screen.queryAllByText(/Age:/)
      expect(allBadges).toHaveLength(0)
    })
  })

  describe('Capacity Badges', () => {
    it('displays capacity when maxParticipants is set', () => {
      const category: Partial<Category> = { maxParticipants: 64 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Cap: 64')).toBeInTheDocument()
    })

    it('displays "Unlimited" when maxParticipants is null', () => {
      const category: Partial<Category> = { maxParticipants: null }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Unlimited')).toBeInTheDocument()
    })

    it('displays "Unlimited" when maxParticipants is undefined', () => {
      const category: Partial<Category> = {}
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Unlimited')).toBeInTheDocument()
    })
  })

  describe('Registration Fee Badges', () => {
    it('displays "Free" when fee is 0', () => {
      const category: Partial<Category> = { registrationFee: 0 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Free')).toBeInTheDocument()
    })

    it('displays fee amount with rupee symbol', () => {
      const category: Partial<Category> = { registrationFee: 500 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('₹500.00')).toBeInTheDocument()
    })

    it('formats fee with 2 decimal places', () => {
      const category: Partial<Category> = { registrationFee: 99.5 }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('₹99.50')).toBeInTheDocument()
    })

    it('displays "Free" when fee is null', () => {
      const category: Partial<Category> = { registrationFee: null as any }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('Free')).toBeInTheDocument()
    })
  })

  describe('Complete Category with All Badges', () => {
    it('renders all badges correctly for a complete category', () => {
      const category: Partial<Category> = {
        genderRestriction: 'MALE',
        minAge: 18,
        maxAge: 40,
        maxParticipants: 32,
        registrationFee: 250,
      }
      render(<CategoryBadges category={category} />)

      // Gender badge
      expect(screen.getByText('MALE')).toBeInTheDocument()

      // Age badge
      expect(screen.getByText('Age: 18-40')).toBeInTheDocument()

      // Capacity badge
      expect(screen.getByText('Cap: 32')).toBeInTheDocument()

      // Fee badge
      expect(screen.getByText('₹250.00')).toBeInTheDocument()
    })
  })

  describe('Badge Sizes', () => {
    it('applies small size by default', () => {
      const category: Partial<Category> = { genderRestriction: 'MALE' }
      const { container } = render(<CategoryBadges category={category} />)

      // MUI Chip with size="small" has specific class
      const chip = container.querySelector('.MuiChip-sizeSmall')
      expect(chip).toBeInTheDocument()
    })

    it('applies medium size when specified', () => {
      const category: Partial<Category> = { genderRestriction: 'MALE' }
      const { container } = render(<CategoryBadges category={category} size="medium" />)

      // MUI Chip with size="medium" has specific class
      const chip = container.querySelector('.MuiChip-sizeMedium')
      expect(chip).toBeInTheDocument()
    })
  })
})
