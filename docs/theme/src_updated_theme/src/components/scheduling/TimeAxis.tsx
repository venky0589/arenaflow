import { Box, Typography } from '@mui/material'
import { format, addMinutes, startOfDay, endOfDay, differenceInMinutes } from 'date-fns'

interface TimeAxisProps {
  date: Date
  startHour?: number  // Default 8 AM
  endHour?: number    // Default 10 PM
  slotMinutes?: number  // Default 15 minutes
  width: number
}

export function TimeAxis({ date, startHour = 8, endHour = 22, slotMinutes = 15, width }: TimeAxisProps) {
  const dayStart = startOfDay(date)
  const timelineStart = addMinutes(dayStart, startHour * 60)
  const timelineEnd = addMinutes(dayStart, endHour * 60)
  const totalMinutes = differenceInMinutes(timelineEnd, timelineStart)
  const slotCount = Math.ceil(totalMinutes / slotMinutes)

  const timeSlots = []
  for (let i = 0; i <= slotCount; i++) {
    const slotTime = addMinutes(timelineStart, i * slotMinutes)
    if (slotTime <= timelineEnd) {
      timeSlots.push(slotTime)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        position: 'sticky',
        top: 0,
        backgroundColor: 'white',
        zIndex: 100,
        borderBottom: '2px solid #ddd',
        height: 50
      }}
    >
      {/* Empty space for court labels column */}
      <Box sx={{ width: 150, minWidth: 150, borderRight: '1px solid #ddd' }}>
        <Typography variant="caption" sx={{ p: 1, fontWeight: 600 }}>
          Courts
        </Typography>
      </Box>

      {/* Time slots */}
      <Box sx={{ display: 'flex', width: width, overflowX: 'auto' }}>
        {timeSlots.map((slotTime, index) => {
          const isHourMark = slotTime.getMinutes() === 0

          return (
            <Box
              key={index}
              sx={{
                minWidth: 80,
                width: 80,
                borderRight: isHourMark ? '2px solid #ccc' : '1px solid #eee',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isHourMark ? '#f9f9f9' : 'transparent'
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isHourMark ? 600 : 400,
                  color: isHourMark ? 'text.primary' : 'text.secondary',
                  fontSize: isHourMark ? '0.75rem' : '0.65rem'
                }}
              >
                {format(slotTime, isHourMark ? 'HH:mm' : 'mm')}
              </Typography>
              {isHourMark && (
                <Typography variant="caption" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                  {format(slotTime, 'a')}
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
