import { useEffect, useState } from 'react'
import api from '../api/client'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'

type Player = { id: number, firstName: any, lastName: any, gender: any, phone: any }

const columns: GridColDef[] = [
  { field: 'firstName', headerName: 'First Name', flex: 1 },
  { field: 'lastName', headerName: 'Last Name', flex: 1 },
  { field: 'gender', headerName: 'Gender', flex: 1 },
  { field: 'phone', headerName: 'Phone', flex: 1 }
]

export function Players() {
  const [rows, setRows] = useState<Player[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<any>({ firstName: '', lastName: '', gender: '', phone: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => {
    const res = await api.get('/players')
    setRows(res.data)
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => { setEditingId(null); setForm({ firstName: '', lastName: '', gender: '', phone: '' }); setOpen(true) }
  const onEdit = (row: any) => { setEditingId(row.id); setForm(row); setOpen(true) }

  const save = async () => {
    if (editingId) {
      await api.put('/players/' + editingId, form)
    } else {
      await api.post('/players', form)
    }
    setOpen(false)
    await load()
  }

  const del = async (row: any) => {
    await api.delete('/players/' + row.id)
    await load()
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Players</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={load}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={rows} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Player' : 'New Player'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth />
          <TextField label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth />
          <TextField label="Gender" name="gender" value={form.gender} onChange={handleChange} fullWidth />
          <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} fullWidth />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
