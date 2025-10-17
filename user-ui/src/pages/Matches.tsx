import { useEffect, useState } from 'react'
import api from '../api/client'
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material'

type Match = {
  id:number, tournament?:any, court?:any,
  player1?:any, player2?:any, score1?:number, score2?:number,
  status?:string, scheduledAt?:string
}

export function Matches() {
  const [rows, setRows] = useState<Match[]>([])
  const load = async () => { const r = await api.get('/matches'); setRows(r.data) }
  useEffect(() => { load() }, [])

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Matches</Typography>
      <Stack spacing={2}>
        {rows.map(m => (
          <Card key={m.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">
                {m.player1?.firstName} {m.player1?.lastName} vs {m.player2?.firstName} {m.player2?.lastName}
              </Typography>
              <Typography>{m.tournament?.name} • Court: {m.court?.name || '-'}</Typography>
              <Typography>Time: {m.scheduledAt || '-'}</Typography>
              <Typography>Score: {m.score1 ?? '-'} - {m.score2 ?? '-'}</Typography>
              <Chip label={m.status || 'SCHEDULED'} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
