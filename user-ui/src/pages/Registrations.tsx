import { useEffect, useState } from 'react'
import api from '../api/client'
import { Card, CardContent, Typography, Stack } from '@mui/material'

type Registration = { id:number, tournament:any, player:any, categoryType:string }

export function Registrations() {
  const [rows, setRows] = useState<Registration[]>([])
  const load = async () => { const r = await api.get('/registrations'); setRows(r.data) }
  useEffect(() => { load() }, [])

  return (
    <Stack spacing={2}>
      <Typography variant="h5">My Registrations</Typography>
      <Stack spacing={2}>
        {rows.map(r => (
          <Card key={r.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{r.tournament?.name}</Typography>
              <Typography>Player: {r.player?.firstName} {r.player?.lastName}</Typography>
              <Typography>Category: {r.categoryType}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  )
}
