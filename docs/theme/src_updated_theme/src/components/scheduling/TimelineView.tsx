import { Box, Paper, Typography } from '@mui/material'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { useState } from 'react'
import { Court, SchedulableMatch, CourtAvailability, ConflictInfo } from '../../types'
import { TimeAxis } from './TimeAxis'
import { CourtLane } from './CourtLane'
import { MatchCard } from './MatchCard'

interface TimelineViewProps {
  courts: Court[]
  matches: SchedulableMatch[]
  date: Date
  startHour?: number
  endHour?: number
  slotMinutes?: number
  blackouts?: CourtAvailability[]
  conflicts?: Map<number, ConflictInfo>
  onMatchDrop?: (matchId: number, courtId: number, newTime: Date) => Promise<void>
  onMatchClick?: (match: SchedulableMatch) => void
  onLockToggle?: (matchId: number, locked: boolean) => void
}

export function TimelineView({
  courts,
  matches,
  date,
  startHour = 8,
  endHour = 22,
  slotMinutes = 15,
  blackouts = [],
  conflicts,
  onMatchDrop,
  onMatchClick,
  onLockToggle
}: TimelineViewProps) {
  const [activeMatch, setActiveMatch] = useState<SchedulableMatch | null>(null)

  // Calculate timeline width based on time range
  const totalHours = endHour - startHour
  const totalMinutes = totalHours * 60
  const timelineWidth = (totalMinutes / slotMinutes) * 80  // 80px per slot

  // Group matches by court
  const getMatchesForCourt = (courtId: number) => {
    return matches.filter((match) => {
      if (typeof match.court === 'object' && 'id' in match.court) {
        return match.court.id === courtId
      }
      return match.court === courtId
    })
  }

  // Get blackouts for a specific court
  const getBlackoutsForCourt = (courtId: number) => {
    return blackouts.filter((blackout) => {
      if (typeof blackout.court === 'object' && 'id' in blackout.court) {
        return blackout.court.id === courtId
      }
      return blackout.court === courtId
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    const matchId = event.active.id as number
    const match = matches.find((m) => m.id === matchId)
    if (match) {
      setActiveMatch(match)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveMatch(null)

    if (!over || !onMatchDrop) return

    const matchId = active.id as number
    const match = matches.find((m) => m.id === matchId)

    if (!match) return

    // Check if match is locked
    if (match.locked) {
      return  // Don't allow dragging locked matches
    }

    // Extract court info from drop target
    if (over.data.current?.type === 'court-lane') {
      const courtId = over.data.current.courtId as number

      // For now, we'll keep the same time but change the court
      // In a more advanced implementation, we would calculate the exact drop position
      if (match.scheduledAt) {
        const newTime = new Date(match.scheduledAt)
        await onMatchDrop(matchId, courtId, newTime)
      }
    }
  }

  if (courts.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No courts available. Please add courts first.
        </Typography>
      </Paper>
    )
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box sx={{ width: '100%', overflow: 'auto' }}>
        {/* Time axis header */}
        <TimeAxis
          date={date}
          startHour={startHour}
          endHour={endHour}
          slotMinutes={slotMinutes}
          width={timelineWidth}
        />

        {/* Court lanes */}
        {courts.map((court) => (
          <CourtLane
            key={court.id}
            court={court}
            matches={getMatchesForCourt(court.id)}
            date={date}
            startHour={startHour}
            endHour={endHour}
            slotMinutes={slotMinutes}
            blackouts={getBlackoutsForCourt(court.id)}
            conflicts={conflicts}
            onMatchClick={onMatchClick}
            onLockToggle={onLockToggle}
            width={timelineWidth}
          />
        ))}

        {/* Empty state */}
        {courts.length > 0 && matches.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No matches scheduled for this date.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Drag overlay */}
      <DragOverlay>
        {activeMatch && (
          <MatchCard
            match={activeMatch}
            isDragging
            style={{
              cursor: 'grabbing',
              transform: 'rotate(3deg)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
            }}
          />
        )}
      </DragOverlay>
    </DndContext>
  )
}
