import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CategoryBadges } from '../CategoryBadges'
import type { Category } from '../../../types'

describe('CategoryBadges (Simplified)', () => {
  describe('Gender Badges', () => {
    it('renders MALE badge', () => {
      const category: Partial<Category> = { genderRestriction: 'MALE' }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('MALE')).toBeInTheDocument()
    })

    it('renders FEMALE badge', () => {
      const category: Partial<Category> = { genderRestriction: 'FEMALE' }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('FEMALE')).toBeInTheDocument()
    })

    it('renders OPEN badge', () => {
      const category: Partial<Category> = { genderRestriction: 'OPEN' }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('OPEN')).toBeInTheDocument()
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
  })

  describe('Complete Category', () => {
    it('renders all badges for a complete category', () => {
      const category: Partial<Category> = {
        genderRestriction: 'MALE',
        minAge: 18,
        maxAge: 40,
        maxParticipants: 32,
        registrationFee: 250,
      }
      render(<CategoryBadges category={category} />)

      expect(screen.getByText('MALE')).toBeInTheDocument()
      expect(screen.getByText('Age: 18-40')).toBeInTheDocument()
      expect(screen.getByText('Cap: 32')).toBeInTheDocument()
      expect(screen.getByText('₹250.00')).toBeInTheDocument()
    })
  })
})
