import { useEffect, useState } from 'react'
import api from '../api/client'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'

type Registration = { id: number, tournament: any, player: any, categoryType: any }

const columns: GridColDef[] = [
  { field: 'tournament', headerName: 'Tournament (id)', flex: 1 },
  { field: 'player', headerName: 'Player (id)', flex: 1 },
  { field: 'categoryType', headerName: 'CategoryType (SINGLES/DOUBLES)', flex: 1 }
]

export function Registrations() {
  const [rows, setRows] = useState<Registration[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ tournament: '', player: '', categoryType: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    const res = await api.get('/registrations')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => { setEditingId(null); setForm({ tournament: '', player: '', categoryType: '' }); setOpen(true) }
  const onEdit = (row: any) => { setEditingId(row.id); setForm(row); setOpen(true) }

  const save = async () => {
    if (editingId) {
      await api.put('/registrations/' + editingId, form)
    } else {
      await api.post('/registrations', form)
    }
    setOpen(false)
    await load()
  }

  const del = async (row: any) => {
    await api.delete('/registrations/' + row.id)
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Registrations</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={load}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Registration' : 'New Registration'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Tournament (id)" name="tournament" value={form.tournament} onChange={handleChange} fullWidth />
          <TextField label="Player (id)" name="player" value={form.player} onChange={handleChange} fullWidth />
          <TextField label="CategoryType (SINGLES/DOUBLES)" name="categoryType" value={form.categoryType} onChange={handleChange} fullWidth />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
