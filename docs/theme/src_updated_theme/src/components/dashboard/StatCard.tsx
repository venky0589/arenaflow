import { Card, CardContent, Typography, Box, Skeleton } from '@mui/material'
import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  color?: string
  loading?: boolean
}

export function StatCard({ title, value, icon, color = 'primary.main', loading = false }: StatCardProps) {
  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 140,
        position: 'relative',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(244, 74, 34, 0.2)',
        },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {/* Icon in top-right corner */}
        {icon && (
          <Box sx={{ position: 'absolute', top: 16, right: 16, opacity: 0.3 }}>
            {icon}
          </Box>
        )}

        {/* Title */}
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          {title}
        </Typography>

        {/* Value */}
        {loading ? (
          <Skeleton variant="text" width="60%" height={60} />
        ) : (
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mt: 1,
              mb: 0,
            }}
          >
            {value}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}
