import { Snackbar, Alert } from '@mui/material'
import { useNotificationStore } from '../stores/useNotificationStore'

export function GlobalSnackbar() {
  const { open, message, severity, clearNotification } = useNotificationStore()

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={clearNotification}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={clearNotification} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  )
}
