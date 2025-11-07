import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  AlertTitle,
  Box,
  Typography
} from '@mui/material'
import { Refresh as RefreshIcon, Visibility as ViewIcon } from '@mui/icons-material'

interface OptimisticLockDialogProps {
  open: boolean
  matchId: number
  entityType?: string
  onClose: () => void
  onRefreshMatch: () => void
  onRefreshSchedule: () => void
}

/**
 * Dialog shown when an optimistic lock conflict is detected.
 * Provides clear actions for the user to resolve the conflict.
 */
export function OptimisticLockDialog({
  open,
  matchId,
  entityType = 'Match',
  onClose,
  onRefreshMatch,
  onRefreshSchedule
}: OptimisticLockDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Conflict Detected
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>This {entityType.toLowerCase()} was updated by another user</AlertTitle>
          Your changes could not be saved because someone else modified this {entityType.toLowerCase()} while you were editing it.
        </Alert>

        <DialogContentText sx={{ mb: 2 }}>
          <strong>What happened?</strong>
        </DialogContentText>
        <Box component="ol" sx={{ pl: 2, mb: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            You loaded {entityType.toLowerCase()} #{matchId}
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Another user (or another tab) made changes to it
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            Your attempt to save was rejected to prevent overwriting their changes
          </Typography>
        </Box>

        <DialogContentText sx={{ mb: 2 }}>
          <strong>How to resolve:</strong>
        </DialogContentText>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Refresh this match</strong> to see the latest version
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            <strong>Reload the schedule</strong> to refresh all matches
          </Typography>
          <Typography component="li" variant="body2">
            Then re-apply your changes
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={() => {
            onRefreshMatch()
            onClose()
          }}
          variant="outlined"
          startIcon={<ViewIcon />}
        >
          Refresh This Match
        </Button>
        <Button
          onClick={() => {
            onRefreshSchedule()
            onClose()
          }}
          variant="contained"
          startIcon={<RefreshIcon />}
        >
          Reload Schedule
        </Button>
      </DialogActions>
    </Dialog>
  )
}
