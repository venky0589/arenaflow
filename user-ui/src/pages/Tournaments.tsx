import { useEffect, useState } from 'react'
import api from '../api/client'
import { Card, CardContent, Typography, Stack, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, MenuItem } from '@mui/material'

type Tournament = { id:number, name:string, location?:string, startDate?:string, endDate?:string }
type Player = { id:number, firstName:string, lastName:string }

export function Tournaments() {
  const [rows, setRows] = useState<Tournament[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [open, setOpen] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
  const [playerId, setPlayerId] = useState<string>('')
  const [categoryType, setCategoryType] = useState<string>('SINGLES')

  const load = async () => {
    const ts = await api.get('/tournaments'); setRows(ts.data)
    const ps = await api.get('/players'); setPlayers(ps.data)
  }
  useEffect(() => { load() }, [])

  const register = async () => {
    if (!selectedTournament || !playerId) return
    await api.post('/registrations', { tournament: { id: selectedTournament }, player: { id: Number(playerId) }, categoryType })
    setOpen(false)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Tournaments</Typography>
      <Stack spacing={2}>
        {rows.map(t => (
          <Card key={t.id} variant="outlined">
            <CardContent>
              <Typography variant="h6">{t.name}</Typography>
              <Typography>{t.location} • {t.startDate} – {t.endDate}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={() => { setSelectedTournament(t.id); setOpen(true) }}>Register</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          <TextField
            select fullWidth label="Player" margin="normal"
            value={playerId} onChange={e=>setPlayerId(e.target.value)}
          >
            {players.map(p => (
              <MenuItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</MenuItem>
            ))}
          </TextField>

          <TextField
            select fullWidth label="Category" margin="normal"
            value={categoryType} onChange={e=>setCategoryType(e.target.value)}
          >
            <MenuItem value="SINGLES">SINGLES</MenuItem>
            <MenuItem value="DOUBLES">DOUBLES</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={register}>Submit</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
