import { Card, CardContent, Typography, Box, Chip, Tooltip, IconButton } from '@mui/material'
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { SchedulableMatch, ConflictInfo } from '../../types'
import { format, parseISO } from 'date-fns'

interface MatchCardProps {
  match: SchedulableMatch
  conflict?: ConflictInfo
  onLockToggle?: (matchId: number, locked: boolean) => void
  onClick?: () => void
  isDragging?: boolean
  style?: React.CSSProperties
}

export function MatchCard({ match, conflict, onLockToggle, onClick, isDragging, style }: MatchCardProps) {
  const getPlayer1Name = () => {
    if (typeof match.player1 === 'object' && 'firstName' in match.player1) {
      return `${match.player1.firstName} ${match.player1.lastName}`
    }
    return 'Player 1'
  }

  const getPlayer2Name = () => {
    if (typeof match.player2 === 'object' && 'firstName' in match.player2) {
      return `${match.player2.firstName} ${match.player2.lastName}`
    }
    return 'Player 2'
  }

  const getStatusColor = () => {
    switch (match.status) {
      case 'COMPLETED':
        return 'success'
      case 'IN_PROGRESS':
        return 'warning'
      case 'SCHEDULED':
        return 'info'
      default:
        return 'default'
    }
  }

  const getConflictIcon = () => {
    if (!conflict) return null

    if (conflict.type === 'HARD') {
      return (
        <Tooltip title={`${conflict.message}${conflict.details ? `: ${conflict.details}` : ''}`}>
          <ErrorIcon color="error" sx={{ fontSize: 18 }} />
        </Tooltip>
      )
    } else {
      return (
        <Tooltip title={`${conflict.message}${conflict.details ? `: ${conflict.details}` : ''}`}>
          <WarningIcon color="warning" sx={{ fontSize: 18 }} />
        </Tooltip>
      )
    }
  }

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onLockToggle) {
      onLockToggle(match.id, !match.locked)
    }
  }

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return ''
    try {
      return format(parseISO(dateStr), 'HH:mm')
    } catch {
      return ''
    }
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        minWidth: 200,
        cursor: onClick ? 'pointer' : 'default',
        opacity: isDragging ? 0.5 : 1,
        border: conflict?.type === 'HARD' ? '2px solid red' :
                conflict?.type === 'SOFT' ? '2px solid orange' :
                match.locked ? '2px solid #666' : '1px solid #ddd',
        backgroundColor: match.locked ? '#f5f5f5' : 'white',
        '&:hover': onClick ? {
          boxShadow: 3,
          borderColor: 'primary.main'
        } : {},
        ...style
      }}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        {/* Header with round/category and status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            {match.round ? `Round ${match.round}` : 'TBD'}
            {match.categoryId ? ` - Cat ${match.categoryId}` : ''}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            {getConflictIcon()}
            {match.locked && (
              <Tooltip title={`Locked ${match.lockedBy ? `by ${match.lockedBy}` : ''} ${match.lockedAt ? `at ${formatTime(match.lockedAt)}` : ''}`}>
                <LockIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
            <Chip
              label={match.status}
              color={getStatusColor()}
              size="small"
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>

        {/* Players */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
            {getPlayer1Name()}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            vs
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
            {getPlayer2Name()}
          </Typography>
        </Box>

        {/* Time and duration */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {match.scheduledAt ? formatTime(match.scheduledAt) : 'Unscheduled'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {match.estimatedDurationMinutes || 45} min
          </Typography>
        </Box>

        {/* Score if completed */}
        {match.status === 'COMPLETED' && (match.score1 !== undefined || match.score2 !== undefined) && (
          <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Score: {match.score1 ?? 0} - {match.score2 ?? 0}
            </Typography>
          </Box>
        )}

        {/* Lock/Unlock button */}
        {onLockToggle && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton
              size="small"
              onClick={handleLockClick}
              sx={{ p: 0.5 }}
            >
              {match.locked ? (
                <LockIcon sx={{ fontSize: 16 }} />
              ) : (
                <LockOpenIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
