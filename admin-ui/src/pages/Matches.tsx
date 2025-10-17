import { useEffect, useState } from 'react'
import api from '../api/client'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'

type Match = { id: number, tournament: any, court: any, player1: any, player2: any, score1: any, score2: any, status: any, scheduledAt: any }

const columns: GridColDef[] = [
  { field: 'tournament', headerName: 'Tournament (id)', flex: 1 },
  { field: 'court', headerName: 'Court (id)', flex: 1 },
  { field: 'player1', headerName: 'Player1 (id)', flex: 1 },
  { field: 'player2', headerName: 'Player2 (id)', flex: 1 },
  { field: 'score1', headerName: 'Score1', flex: 1 },
  { field: 'score2', headerName: 'Score2', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'scheduledAt', headerName: 'Scheduled At', flex: 1 }
]

export function Matches() {
  const [rows, setRows] = useState<Match[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ tournament: '', court: '', player1: '', player2: '', score1: '', score2: '', status: '', scheduledAt: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    const res = await api.get('/matches')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => { setEditingId(null); setForm({ tournament: '', court: '', player1: '', player2: '', score1: '', score2: '', status: '', scheduledAt: '' }); setOpen(true) }
  const onEdit = (row: any) => { setEditingId(row.id); setForm(row); setOpen(true) }

  const save = async () => {
    if (editingId) {
      await api.put('/matches/' + editingId, form)
    } else {
      await api.post('/matches', form)
    }
    setOpen(false)
    await load()
  }

  const del = async (row: any) => {
    await api.delete('/matches/' + row.id)
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Matches</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={load}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Match' : 'New Match'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tournament (id)" name="tournament" value={form.tournament} onChange={handleChange} fullWidth />
          <TextField label="Court (id)" name="court" value={form.court} onChange={handleChange} fullWidth />
          <TextField label="Player1 (id)" name="player1" value={form.player1} onChange={handleChange} fullWidth />
          <TextField label="Player2 (id)" name="player2" value={form.player2} onChange={handleChange} fullWidth />
          <TextField label="Score1" name="score1" value={form.score1} onChange={handleChange} fullWidth />
          <TextField label="Score2" name="score2" value={form.score2} onChange={handleChange} fullWidth />
          <TextField label="Status" name="status" value={form.status} onChange={handleChange} fullWidth />
          <TextField label="Scheduled At" name="scheduledAt" value={form.scheduledAt} onChange={handleChange} fullWidth />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
