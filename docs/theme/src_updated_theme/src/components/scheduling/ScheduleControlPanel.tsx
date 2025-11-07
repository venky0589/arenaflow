import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Stack,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  PlayArrow as SimulateIcon,
  Check as ApplyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { AutoScheduleRequest } from '../../types'
import { format } from 'date-fns'

interface ScheduleControlPanelProps {
  tournamentId: number | null
  onSimulate: (request: AutoScheduleRequest) => void
  onApply: () => void
  onRefresh: () => void
  simulating: boolean
  applying: boolean
  canApply: boolean
  currentBatchUuid?: string
}

export function ScheduleControlPanel({
  tournamentId,
  onSimulate,
  onApply,
  onRefresh,
  simulating,
  applying,
  canApply,
  currentBatchUuid
}: ScheduleControlPanelProps) {
  const [startDateTime, setStartDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'08:00")
  )
  const [endDateTime, setEndDateTime] = useState(
    format(new Date(), "yyyy-MM-dd'T'22:00")
  )
  const [defaultDuration, setDefaultDuration] = useState(45)
  const [bufferMinutes, setBufferMinutes] = useState(15)

  const handleSimulate = () => {
    if (!tournamentId) return

    const request: AutoScheduleRequest = {
      tournamentId,
      startDateTime,
      endDateTime,
      defaultDurationMinutes: defaultDuration,
      bufferMinutes
    }

    onSimulate(request)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Auto-Schedule Controls
      </Typography>

      <Stack spacing={2}>
        {/* Date/Time range */}
        <TextField
          label="Start Date & Time"
          type="datetime-local"
          value={startDateTime}
          onChange={(e) => setStartDateTime(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="End Date & Time"
          type="datetime-local"
          value={endDateTime}
          onChange={(e) => setEndDateTime(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        {/* Match settings */}
        <TextField
          label="Default Match Duration (minutes)"
          type="number"
          value={defaultDuration}
          onChange={(e) => setDefaultDuration(parseInt(e.target.value) || 45)}
          fullWidth
          inputProps={{ min: 15, max: 120, step: 5 }}
        />

        <TextField
          label="Buffer Between Matches (minutes)"
          type="number"
          value={bufferMinutes}
          onChange={(e) => setBufferMinutes(parseInt(e.target.value) || 15)}
          fullWidth
          inputProps={{ min: 0, max: 60, step: 5 }}
        />

        <Divider />

        {/* Action buttons */}
        <Stack spacing={1.5}>
          <Button
            variant="contained"
            startIcon={simulating ? <CircularProgress size={20} /> : <SimulateIcon />}
            onClick={handleSimulate}
            disabled={!tournamentId || simulating || applying}
            fullWidth
          >
            {simulating ? 'Simulating...' : 'Simulate Schedule'}
          </Button>

          <Button
            variant="contained"
            color="success"
            startIcon={applying ? <CircularProgress size={20} /> : <ApplyIcon />}
            onClick={onApply}
            disabled={!canApply || applying || simulating}
            fullWidth
          >
            {applying ? 'Applying...' : 'Apply Schedule'}
          </Button>

          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={simulating || applying}
            fullWidth
          >
            Refresh
          </Button>
        </Stack>

        {/* Status info */}
        {currentBatchUuid && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'info.contrastText' }}>
              Simulation Ready
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'info.contrastText' }}>
              Batch: {currentBatchUuid.substring(0, 8)}...
            </Typography>
          </Box>
        )}

        {/* Help text */}
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            1. Configure schedule parameters above
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            2. Click "Simulate" to preview the schedule
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            3. Review the simulation results
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            4. Click "Apply" to commit changes
          </Typography>
        </Box>
      </Stack>
    </Paper>
  )
}
