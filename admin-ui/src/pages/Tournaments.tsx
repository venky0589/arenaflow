import { useEffect, useState } from 'react'
import api from '../api/client'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'

type Tournament = { id: number, name: any, location: any, startDate: any, endDate: any }

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'startDate', headerName: 'Start Date', flex: 1 },
  { field: 'endDate', headerName: 'End Date', flex: 1 }
]

export function Tournaments() {
  const [rows, setRows] = useState<Tournament[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ name: '', location: '', startDate: '', endDate: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    const res = await api.get('/tournaments')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => { setEditingId(null); setForm({ name: '', location: '', startDate: '', endDate: '' }); setOpen(true) }
  const onEdit = (row: any) => { setEditingId(row.id); setForm(row); setOpen(true) }

  const save = async () => {
    if (editingId) {
      await api.put('/tournaments/' + editingId, form)
    } else {
      await api.post('/tournaments', form)
    }
    setOpen(false)
    await load()
  }

  const del = async (row: any) => {
    await api.delete('/tournaments/' + row.id)
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Tournaments</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={load}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Tournament' : 'New Tournament'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField label="Location" name="location" value={form.location} onChange={handleChange} fullWidth />
          <TextField label="Start Date" name="startDate" value={form.startDate} onChange={handleChange} fullWidth />
          <TextField label="End Date" name="endDate" value={form.endDate} onChange={handleChange} fullWidth />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
