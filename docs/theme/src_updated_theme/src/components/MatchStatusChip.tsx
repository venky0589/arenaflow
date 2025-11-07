import { Chip } from '@mui/material'
import {
  Schedule as ScheduledIcon,
  CheckCircle as ReadyIcon,
  PlayArrow as InProgressIcon,
  EmojiEvents as CompletedIcon,
  PersonOff as WalkoverIcon,
  LocalHospital as RetiredIcon
} from '@mui/icons-material'
import { MatchStatus } from '../types'

interface MatchStatusChipProps {
  status: MatchStatus
  size?: 'small' | 'medium'
}

const STATUS_CONFIG: Record<MatchStatus, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; icon: React.ReactElement }> = {
  SCHEDULED: {
    label: 'Scheduled',
    color: 'default',
    icon: <ScheduledIcon />
  },
  READY_TO_START: {
    label: 'Ready',
    color: 'info',
    icon: <ReadyIcon />
  },
  IN_PROGRESS: {
    label: 'Live',
    color: 'warning',
    icon: <InProgressIcon />
  },
  COMPLETED: {
    label: 'Completed',
    color: 'success',
    icon: <CompletedIcon />
  },
  WALKOVER: {
    label: 'Walkover',
    color: 'error',
    icon: <WalkoverIcon />
  },
  RETIRED: {
    label: 'Retired',
    color: 'error',
    icon: <RetiredIcon />
  }
}

export function MatchStatusChip({ status, size = 'medium' }: MatchStatusChipProps) {
  const config = STATUS_CONFIG[status]

  if (!config) {
    return <Chip label={status} size={size} />
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      icon={config.icon}
      sx={{
        fontWeight: status === 'IN_PROGRESS' ? 'bold' : 'normal',
        animation: status === 'IN_PROGRESS' ? 'pulse 2s infinite' : 'none',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.7 }
        }
      }}
    />
  )
}
