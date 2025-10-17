import { Typography, Stack } from '@mui/material'

export function Home() {
  return (
    <Stack spacing={2}>
      <Typography variant="h4">Welcome to the Badminton Tournament App</Typography>
      <Typography>Browse tournaments, register to play, and follow schedules & results.</Typography>
    </Stack>
  )
}
