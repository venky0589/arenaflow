import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Alert,
  Divider
} from '@mui/material'
import {
  CheckCircle as SuccessIcon,
  Warning as WarningIcon,
  Error as ErrorIcon
} from '@mui/icons-material'
import { SchedulingSimulationResponse } from '../../types'
import { format, parseISO } from 'date-fns'

interface SimulationDialogProps {
  open: boolean
  simulation: SchedulingSimulationResponse | null
  onClose: () => void
  onApply: () => void
  applying: boolean
}

export function SimulationDialog({
  open,
  simulation,
  onClose,
  onApply,
  applying
}: SimulationDialogProps) {
  if (!simulation) return null

  const courtUtilization = simulation.courtUtilizationJson
    ? JSON.parse(simulation.courtUtilizationJson)
    : {}

  const getFillPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'success'
    if (percentage >= 50) return 'warning'
    return 'error'
  }

  const getBalanceScoreColor = (score: number) => {
    if (score >= 80) return 'success'
    if (score >= 60) return 'warning'
    return 'error'
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Scheduling Simulation Results
        <Typography variant="caption" display="block" color="text.secondary">
          Batch ID: {simulation.batchUuid.substring(0, 13)}...
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          {/* Summary metrics */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {simulation.scheduledCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Scheduled Matches
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="error">
                  {simulation.unscheduledCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Unscheduled Matches
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Chip
                  label={`${simulation.fillPercentage.toFixed(1)}%`}
                  color={getFillPercentageColor(simulation.fillPercentage)}
                  sx={{ fontSize: '1.2rem', p: 2 }}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Fill Percentage
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Chip
                  label={simulation.courtBalanceScore.toFixed(1)}
                  color={getBalanceScoreColor(simulation.courtBalanceScore)}
                  sx={{ fontSize: '1.2rem', p: 2 }}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                  Court Balance Score
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Player rest time */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Player Rest Time
            </Typography>
            <Typography variant="h6" color="primary">
              {simulation.meanPlayerRestMinutes.toFixed(1)} minutes (avg)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Average time between consecutive matches for players
            </Typography>
          </Paper>

          {/* Court utilization */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Court Utilization
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(courtUtilization).map(([courtName, matchCount]) => (
                <Grid item xs={12} sm={6} key={courtName}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">{courtName}</Typography>
                    <Chip label={`${matchCount} matches`} size="small" />
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Std Dev: {simulation.courtBalanceStdDev.toFixed(2)} (lower is better)
            </Typography>
          </Paper>

          {/* Warnings */}
          {simulation.warnings && simulation.warnings.length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Warnings ({simulation.warnings.length})
              </Typography>
              <List dense>
                {simulation.warnings.map((warning, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <WarningIcon fontSize="small" sx={{ mr: 1 }} />
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{ variant: 'caption' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Scheduled matches preview */}
          <Typography variant="subtitle2" gutterBottom>
            Scheduled Matches ({simulation.scheduledMatches.length})
          </Typography>
          <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
            <List dense>
              {simulation.scheduledMatches.slice(0, 20).map((match, index) => (
                <ListItem key={index} sx={{ borderBottom: '1px solid #eee' }}>
                  <ListItemText
                    primary={`${match.player1Name} vs ${match.player2Name}`}
                    secondary={`${match.courtName} - ${format(parseISO(match.scheduledAt), 'HH:mm')} (${match.durationMinutes} min)`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
            </List>
            {simulation.scheduledMatches.length > 20 && (
              <Typography variant="caption" color="text.secondary" sx={{ p: 1, display: 'block' }}>
                ... and {simulation.scheduledMatches.length - 20} more matches
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={applying}>
          Cancel
        </Button>
        <Button
          onClick={onApply}
          variant="contained"
          color="success"
          disabled={applying || simulation.scheduledCount === 0}
          startIcon={applying ? undefined : <SuccessIcon />}
        >
          {applying ? 'Applying...' : 'Apply Schedule'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
