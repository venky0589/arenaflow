import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Alert
} from '@mui/material'
import { TournamentRole } from '../types/tournamentRole'
import { tournamentRolesApi } from '../api/tournamentRoles'

interface AddMemberDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  tournamentId: number
}

export default function AddMemberDialog({
  open,
  onClose,
  onSuccess,
  tournamentId
}: AddMemberDialogProps) {
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState<TournamentRole>('STAFF')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!userId || !role) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    setError('')

    try {
      await tournamentRolesApi.assign(tournamentId, {
        userId: Number(userId),
        role
      })
      onSuccess()
      handleClose()
    } catch (err: any) {
      setError(err.message || 'Failed to assign role')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setUserId('')
    setRole('STAFF')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Tournament Member</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="User ID"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            fullWidth
            helperText="Enter the ID of the user to assign a role"
            required
          />

          <TextField
            select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as TournamentRole)}
            fullWidth
            required
          >
            <MenuItem value="ADMIN">Admin - Can manage tournament, assign STAFF/REFEREE</MenuItem>
            <MenuItem value="STAFF">Staff - Check-in and registrations</MenuItem>
            <MenuItem value="REFEREE">Referee - Match scoring</MenuItem>
          </TextField>

          <Alert severity="info">
            <strong>Note:</strong> Only OWNERs can assign ADMIN roles. If you don't have permission, you'll receive an error.
          </Alert>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !userId}
        >
          {loading ? 'Assigning...' : 'Add Member'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
