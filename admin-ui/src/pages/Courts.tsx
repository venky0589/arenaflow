import { useEffect, useState } from 'react'
import api from '../api/client'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'

type Court = { id: number, name: any, locationNote: any }

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'locationNote', headerName: 'Location Note', flex: 1 }
]

export function Courts() {
  const [rows, setRows] = useState<Court[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ name: '', locationNote: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    const res = await api.get('/courts')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => { setEditingId(null); setForm({ name: '', locationNote: '' }); setOpen(true) }
  const onEdit = (row: any) => { setEditingId(row.id); setForm(row); setOpen(true) }

  const save = async () => {
    if (editingId) {
      await api.put('/courts/' + editingId, form)
    } else {
      await api.post('/courts', form)
    }
    setOpen(false)
    await load()
  }

  const del = async (row: any) => {
    await api.delete('/courts/' + row.id)
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Courts</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={load}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Court' : 'New Court'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Name" name="name" value={form.name} onChange={handleChange} fullWidth />
          <TextField label="Location Note" name="locationNote" value={form.locationNote} onChange={handleChange} fullWidth />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
