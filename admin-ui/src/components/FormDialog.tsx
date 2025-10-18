import { Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress } from '@mui/material'

interface FormDialogProps {
  open: boolean
  title: string
  children: React.ReactNode
  onClose: () => void
  onSave: () => void
  saving?: boolean
}

export function FormDialog({ open, title, children, onClose, onSave, saving = false }: FormDialogProps) {
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        {children}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
