import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Stack,
  Typography,
  Box
} from '@mui/material'

interface ScoreDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (score1: number, score2: number) => Promise<void>
  match: {
    id: number
    player1Name?: string
    player2Name?: string
    score1?: number
    score2?: number
  }
}

export function ScoreDialog({ open, onClose, onConfirm, match }: ScoreDialogProps) {
  const [score1, setScore1] = useState<string>(match.score1?.toString() || '')
  const [score2, setScore2] = useState<string>(match.score2?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    // Validation
    const s1 = parseInt(score1)
    const s2 = parseInt(score2)

    if (isNaN(s1) || s1 < 0) {
      setError('Score 1 must be a valid non-negative number')
      return
    }
    if (isNaN(s2) || s2 < 0) {
      setError('Score 2 must be a valid non-negative number')
      return
    }
    if (s1 === s2) {
      setError('Tied scores are not allowed in single elimination tournaments')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(s1, s2)
      handleClose()
    } catch (err: any) {
      // Handle optimistic lock conflict (409)
      if (err.response?.status === 409 && err.response?.data?.code === 'OPTIMISTIC_LOCK') {
        setError('This match was updated by another user. The data has been refreshed. Please review and try again.')
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to update score')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setScore1(match.score1?.toString() || '')
    setScore2(match.score2?.toString() || '')
    setError('')
    onClose()
  }

  // Determine winner based on current scores
  const winner = score1 && score2 && parseInt(score1) > parseInt(score2)
    ? match.player1Name
    : score1 && score2 && parseInt(score2) > parseInt(score1)
    ? match.player2Name
    : null

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Enter Match Score</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="info">
            Enter final scores. Match will be completed automatically when both scores are valid.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Match: {match.player1Name || 'Player 1'} vs {match.player2Name || 'Player 2'}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label={match.player1Name || 'Player 1 Score'}
              type="number"
              fullWidth
              required
              value={score1}
              onChange={(e) => setScore1(e.target.value)}
              disabled={loading}
              inputProps={{ min: 0 }}
              helperText="Must be non-negative"
            />
            <Typography variant="h6" color="text.secondary">:</Typography>
            <TextField
              label={match.player2Name || 'Player 2 Score'}
              type="number"
              fullWidth
              required
              value={score2}
              onChange={(e) => setScore2(e.target.value)}
              disabled={loading}
              inputProps={{ min: 0 }}
              helperText="Must be non-negative"
            />
          </Box>

          {winner && (
            <Alert severity="success">
              Winner: <strong>{winner}</strong>
            </Alert>
          )}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading || !score1 || !score2}
        >
          {loading ? 'Processing...' : 'Update Score'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
