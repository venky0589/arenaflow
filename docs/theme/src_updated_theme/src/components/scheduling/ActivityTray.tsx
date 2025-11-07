import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material'
import { SchedulingBatchResponse } from '../../types'
import { format, parseISO } from 'date-fns'

interface ActivityTrayProps {
  batches: SchedulingBatchResponse[]
}

export function ActivityTray({ batches }: ActivityTrayProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'success'
      case 'SIMULATED':
        return 'info'
      case 'FAILED':
        return 'error'
      default:
        return 'default'
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMM dd, HH:mm')
    } catch {
      return dateStr
    }
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>

      {batches.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No scheduling activity yet
        </Typography>
      ) : (
        <List dense>
          {batches.slice(0, 10).map((batch) => (
            <ListItem
              key={batch.id}
              sx={{
                borderBottom: '1px solid #eee',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {batch.status === 'APPLIED' ? 'Schedule Applied' :
                   batch.status === 'SIMULATED' ? 'Schedule Simulated' :
                   'Schedule Failed'}
                </Typography>
                <Chip
                  label={batch.status}
                  color={getStatusColor(batch.status)}
                  size="small"
                  sx={{ height: 20 }}
                />
              </Box>

              <Typography variant="caption" color="text.secondary" display="block">
                {batch.scheduledCount} of {batch.totalMatches} matches scheduled
                ({batch.fillPercentage.toFixed(1)}% fill)
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {batch.status === 'APPLIED' && batch.appliedBy
                    ? `Applied by ${batch.appliedBy}`
                    : `Created by ${batch.createdBy}`}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {batch.status === 'APPLIED' && batch.appliedAt
                    ? formatDate(batch.appliedAt)
                    : formatDate(batch.createdAt)}
                </Typography>
              </Box>

              {batch.warnings && batch.warnings.length > 0 && (
                <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                  {batch.warnings.length} warning{batch.warnings.length > 1 ? 's' : ''}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  )
}
