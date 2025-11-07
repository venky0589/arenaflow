import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

/**
 * ConfirmDialog Component
 *
 * A reusable confirmation dialog for destructive or important actions.
 *
 * Features:
 * - Customizable title, message, and button labels
 * - Color-coded confirm button (default: error for destructive actions)
 * - Loading state disables buttons during async operations
 * - Accessible with proper ARIA attributes
 *
 * @example
 * <ConfirmDialog
 *   open={confirmOpen}
 *   title="Delete Category?"
 *   message="This action cannot be undone. Category: Men's Singles"
 *   confirmLabel="Delete"
 *   cancelLabel="Cancel"
 *   confirmColor="error"
 *   onConfirm={handleConfirmDelete}
 *   onCancel={() => setConfirmOpen(false)}
 *   loading={deleting}
 * />
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onCancel,
  loading = false
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          color={confirmColor}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? 'Processing...' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
