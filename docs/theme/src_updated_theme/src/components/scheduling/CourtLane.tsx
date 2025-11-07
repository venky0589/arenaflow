import { Box, Typography } from '@mui/material'
import { useDroppable } from '@dnd-kit/core'
import { Court, SchedulableMatch, CourtAvailability, ConflictInfo } from '../../types'
import { MatchCard } from './MatchCard'
import { format, parseISO, addMinutes, startOfDay, differenceInMinutes, isWithinInterval } from 'date-fns'

interface CourtLaneProps {
  court: Court
  matches: SchedulableMatch[]
  date: Date
  startHour?: number
  endHour?: number
  slotMinutes?: number
  blackouts?: CourtAvailability[]
  conflicts?: Map<number, ConflictInfo>
  onMatchClick?: (match: SchedulableMatch) => void
  onLockToggle?: (matchId: number, locked: boolean) => void
  width: number
}

export function CourtLane({
  court,
  matches,
  date,
  startHour = 8,
  endHour = 22,
  slotMinutes = 15,
  blackouts = [],
  conflicts,
  onMatchClick,
  onLockToggle,
  width
}: CourtLaneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `court-${court.id}`,
    data: {
      type: 'court-lane',
      courtId: court.id,
      courtName: court.name
    }
  })

  const dayStart = startOfDay(date)
  const timelineStart = addMinutes(dayStart, startHour * 60)
  const timelineEnd = addMinutes(dayStart, endHour * 60)
  const totalMinutes = differenceInMinutes(timelineEnd, timelineStart)
  const pixelsPerMinute = width / totalMinutes

  // Calculate position and width for a match
  const getMatchPosition = (match: SchedulableMatch) => {
    if (!match.scheduledAt) return null

    try {
      const scheduledTime = parseISO(match.scheduledAt)
      const minutesFromStart = differenceInMinutes(scheduledTime, timelineStart)

      if (minutesFromStart < 0 || minutesFromStart > totalMinutes) {
        return null  // Match outside visible time range
      }

      const left = minutesFromStart * pixelsPerMinute
      const duration = match.estimatedDurationMinutes || 45
      const matchWidth = duration * pixelsPerMinute

      return { left, width: matchWidth }
    } catch {
      return null
    }
  }

  // Get blackout periods for this court
  const getBlackoutBlocks = () => {
    return blackouts.map((blackout, index) => {
      try {
        const blackoutStart = parseISO(blackout.unavailableFrom)
        const blackoutEnd = parseISO(blackout.unavailableUntil)

        const startMinutes = Math.max(0, differenceInMinutes(blackoutStart, timelineStart))
        const endMinutes = Math.min(totalMinutes, differenceInMinutes(blackoutEnd, timelineStart))

        if (startMinutes >= totalMinutes || endMinutes <= 0) {
          return null  // Blackout outside visible range
        }

        const left = startMinutes * pixelsPerMinute
        const blockWidth = (endMinutes - startMinutes) * pixelsPerMinute

        return (
          <Box
            key={`blackout-${index}`}
            sx={{
              position: 'absolute',
              left: left,
              width: blockWidth,
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.05) 10px, rgba(0,0,0,0.05) 20px)',
              borderLeft: '2px solid #999',
              borderRight: '2px solid #999',
              zIndex: 1,
              pointerEvents: 'none'
            }}
          />
        )
      } catch {
        return null
      }
    }).filter(Boolean)
  }

  return (
    <Box
      ref={setNodeRef}
      sx={{
        display: 'flex',
        borderBottom: '1px solid #ddd',
        minHeight: 120,
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
        transition: 'background-color 0.2s'
      }}
    >
      {/* Court label */}
      <Box
        sx={{
          width: 150,
          minWidth: 150,
          borderRight: '1px solid #ddd',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: 'white',
          position: 'sticky',
          left: 0,
          zIndex: 10
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {court.name}
        </Typography>
        {court.locationNote && (
          <Typography variant="caption" color="text.secondary">
            {court.locationNote}
          </Typography>
        )}
      </Box>

      {/* Timeline area */}
      <Box
        sx={{
          position: 'relative',
          width: width,
          minWidth: width,
          height: '100%'
        }}
      >
        {/* Grid lines for time slots */}
        {Array.from({ length: Math.ceil(totalMinutes / slotMinutes) }).map((_, index) => {
          const slotTime = addMinutes(timelineStart, index * slotMinutes)
          const isHourMark = slotTime.getMinutes() === 0

          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                left: index * slotMinutes * pixelsPerMinute,
                width: 1,
                height: '100%',
                backgroundColor: isHourMark ? '#ccc' : '#eee',
                zIndex: 0
              }}
            />
          )
        })}

        {/* Blackout periods */}
        {getBlackoutBlocks()}

        {/* Matches */}
        {matches.map((match) => {
          const position = getMatchPosition(match)
          if (!position) return null

          const conflict = conflicts?.get(match.id)

          return (
            <Box
              key={match.id}
              sx={{
                position: 'absolute',
                left: position.left,
                width: position.width,
                top: 10,
                bottom: 10,
                zIndex: 5
              }}
            >
              <MatchCard
                match={match}
                conflict={conflict}
                onClick={() => onMatchClick?.(match)}
                onLockToggle={onLockToggle}
                style={{
                  height: '100%',
                  overflow: 'hidden'
                }}
              />
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
