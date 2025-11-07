import { useState } from 'react'
import { Stack, Button, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import {
  MoreVert as MoreIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  PersonOff as WalkoverIcon,
  LocalHospital as RetiredIcon
} from '@mui/icons-material'
import { MatchStatusChip } from './MatchStatusChip'
import { WalkoverDialog } from './WalkoverDialog'
import { RetiredDialog } from './RetiredDialog'
import { ScoreDialog } from './ScoreDialog'
import { useMatchStore } from '../stores/useMatchStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import { MatchStatus } from '../types'

interface MatchActionsMenuProps {
  match: {
    id: number
    status: MatchStatus
    player1Id?: number
    player1Name?: string
    player2Id?: number
    player2Name?: string
  }
  compact?: boolean // If true, shows menu icon; if false, shows all buttons
}

export function MatchActionsMenu({ match, compact = false }: MatchActionsMenuProps) {
  const { startMatch, updateScore, completeMatch, markWalkover, markRetired } = useMatchStore()
  const { showSuccess, showError } = useNotificationStore()

  const [loading, setLoading] = useState(false)
  const [scoreOpen, setScoreOpen] = useState(false)
  const [walkoverOpen, setWalkoverOpen] = useState(false)
  const [retiredOpen, setRetiredOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const menuOpen = Boolean(anchorEl)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleStart = async () => {
    handleMenuClose()
    setLoading(true)
    try {
      await startMatch(match.id)
      showSuccess('Match started successfully')
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to start match'
      showError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleScoreOpen = () => {
    handleMenuClose()
    setScoreOpen(true)
  }

  const handleScoreConfirm = async (score1: number, score2: number) => {
    await updateScore(match.id, score1, score2)
    showSuccess('Score updated successfully - match will auto-complete')
  }

  const handleWalkoverOpen = () => {
    handleMenuClose()
    setWalkoverOpen(true)
  }

  const handleRetiredOpen = () => {
    handleMenuClose()
    setRetiredOpen(true)
  }

  const handleWalkoverConfirm = async (reason: string, winnerId: number) => {
    await markWalkover(match.id, reason, winnerId)
    showSuccess('Match marked as walkover')
  }

  const handleRetiredConfirm = async (reason: string, winnerId: number) => {
    await markRetired(match.id, reason, winnerId)
    showSuccess('Match marked as retired')
  }

  // Determine which actions are available based on status
  const canStart = match.status === 'SCHEDULED' || match.status === 'READY_TO_START'
  const canEnterScore = match.status === 'IN_PROGRESS'
  const canWalkover = match.status === 'IN_PROGRESS'
  const canRetired = match.status === 'IN_PROGRESS'
  const isTerminal = match.status === 'COMPLETED' || match.status === 'WALKOVER' || match.status === 'RETIRED'

  const hasActions = canStart || canEnterScore || canWalkover || canRetired

  // Compact mode: Show menu icon
  if (compact) {
    return (
      <>
        <Stack direction="row" spacing={1} alignItems="center">
          <MatchStatusChip status={match.status} size="small" />
          {hasActions && !loading && (
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreIcon />
            </IconButton>
          )}
        </Stack>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
        >
          {canStart && (
            <MenuItem onClick={handleStart}>
              <ListItemIcon><StartIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Start Match</ListItemText>
            </MenuItem>
          )}
          {canEnterScore && (
            <MenuItem onClick={handleScoreOpen}>
              <ListItemIcon><CompleteIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Enter Score</ListItemText>
            </MenuItem>
          )}
          {canWalkover && (
            <MenuItem onClick={handleWalkoverOpen}>
              <ListItemIcon><WalkoverIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Mark Walkover</ListItemText>
            </MenuItem>
          )}
          {canRetired && (
            <MenuItem onClick={handleRetiredOpen}>
              <ListItemIcon><RetiredIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Mark Retired</ListItemText>
            </MenuItem>
          )}
        </Menu>

        <ScoreDialog
          open={scoreOpen}
          onClose={() => setScoreOpen(false)}
          onConfirm={handleScoreConfirm}
          match={match}
        />

        <WalkoverDialog
          open={walkoverOpen}
          onClose={() => setWalkoverOpen(false)}
          onConfirm={handleWalkoverConfirm}
          match={match}
        />

        <RetiredDialog
          open={retiredOpen}
          onClose={() => setRetiredOpen(false)}
          onConfirm={handleRetiredConfirm}
          match={match}
        />
      </>
    )
  }

  // Full mode: Show all buttons
  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <MatchStatusChip status={match.status} />

        {canStart && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<StartIcon />}
            onClick={handleStart}
            disabled={loading}
          >
            Start
          </Button>
        )}

        {canEnterScore && (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<CompleteIcon />}
            onClick={handleScoreOpen}
            disabled={loading}
          >
            Enter Score
          </Button>
        )}

        {canWalkover && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<WalkoverIcon />}
            onClick={handleWalkoverOpen}
            disabled={loading}
          >
            Walkover
          </Button>
        )}

        {canRetired && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<RetiredIcon />}
            onClick={handleRetiredOpen}
            disabled={loading}
          >
            Retired
          </Button>
        )}

        {isTerminal && (
          <Button variant="text" size="small" disabled>
            No actions available
          </Button>
        )}
      </Stack>

      <ScoreDialog
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        onConfirm={handleScoreConfirm}
        match={match}
      />

      <WalkoverDialog
        open={walkoverOpen}
        onClose={() => setWalkoverOpen(false)}
        onConfirm={handleWalkoverConfirm}
        match={match}
      />

      <RetiredDialog
        open={retiredOpen}
        onClose={() => setRetiredOpen(false)}
        onConfirm={handleRetiredConfirm}
        match={match}
      />
    </>
  )
}
