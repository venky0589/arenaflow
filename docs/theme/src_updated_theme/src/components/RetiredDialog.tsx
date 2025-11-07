import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Stack,
  Typography
} from '@mui/material'

interface RetiredDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (reason: string, winnerId: number) => Promise<void>
  match: {
    id: number
    player1Name?: string
    player1Id?: number
    player2Name?: string
    player2Id?: number
  }
}

export function RetiredDialog({ open, onClose, onConfirm, match }: RetiredDialogProps) {
  const [reason, setReason] = useState('')
  const [winnerId, setWinnerId] = useState<number | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    // Validation
    if (!reason.trim()) {
      setError('Reason is required')
      return
    }
    if (!winnerId) {
      setError('Winner must be selected')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onConfirm(reason.trim(), winnerId as number)
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to mark retired')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setWinnerId('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Mark Match as Retired</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Alert severity="warning">
            This action is irreversible. The match will be marked as completed with RETIRED status.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Match: {match.player1Name || 'Player 1'} vs {match.player2Name || 'Player 2'}
          </Typography>

          <FormControl fullWidth required>
            <InputLabel>Winner</InputLabel>
            <Select
              value={winnerId}
              onChange={(e) => setWinnerId(e.target.value as number)}
              label="Winner"
              disabled={loading}
            >
              {match.player1Id && match.player1Name && (
                <MenuItem value={match.player1Id}>{match.player1Name}</MenuItem>
              )}
              {match.player2Id && match.player2Name && (
                <MenuItem value={match.player2Id}>{match.player2Name}</MenuItem>
              )}
            </Select>
          </FormControl>

          <TextField
            label="Reason"
            placeholder="e.g., Player injured - ankle sprain"
            multiline
            rows={3}
            fullWidth
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            helperText="Explain why the player was unable to continue"
          />

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
          color="error"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Mark Retired'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
