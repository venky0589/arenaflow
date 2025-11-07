import { Box, Typography, Button, Paper } from '@mui/material'
import { useNavigate, useLocation } from 'react-router-dom'
import { Lock as LockIcon } from '@mui/icons-material'
import { useAuth } from '../hooks/useAuth'

/**
 * 403 Forbidden / Unauthorized access page.
 * Shown when user tries to access a route they don't have permission for.
 */
export function Unauthorized() {
  const navigate = useNavigate()
  const location = useLocation()
  const { userEmail, roles, isAdmin, isReferee } = useAuth()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 500,
          textAlign: 'center',
        }}
      >
        <LockIcon color="error" sx={{ fontSize: 80, mb: 2 }} />

        <Typography variant="h4" gutterBottom>
          Access Denied
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          You don't have permission to access this page.
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Current role: <strong>{isAdmin ? 'ADMIN' : isReferee ? 'REFEREE' : 'USER'}</strong>
          <br />
          User: {userEmail}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
          If you believe you should have access, please contact your administrator.
        </Typography>
      </Paper>
    </Box>
  )
}
