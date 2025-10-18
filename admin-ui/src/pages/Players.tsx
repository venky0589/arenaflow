import { useEffect, useState } from 'react'
import { Stack, Button, TextField, Typography, Paper, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useNotificationStore } from '../stores/useNotificationStore'

const columns: GridColDef[] = [
  { field: 'firstName', headerName: 'First Name', flex: 1 },
  { field: 'lastName', headerName: 'Last Name', flex: 1 },
  { field: 'gender', headerName: 'Gender', flex: 1 },
  { field: 'phone', headerName: 'Phone', flex: 1 }
]

export function Players() {
  const { players, loading, fetchPlayers, createPlayer, updatePlayer, deletePlayer } = usePlayerStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ firstName: '', lastName: '', gender: 'M', phone: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => {
    setEditingId(null)
    setForm({ firstName: '', lastName: '', gender: 'M', phone: '' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    setForm(row)
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.firstName || form.firstName.trim().length < 2) {
      showError('First name must be at least 2 characters')
      return false
    }
    if (!form.lastName || form.lastName.trim().length < 2) {
      showError('Last name must be at least 2 characters')
      return false
    }
    if (!form.gender || (form.gender !== 'M' && form.gender !== 'F')) {
      showError('Gender must be M or F')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editingId) {
        await updatePlayer(editingId, form)
        showSuccess('Player updated successfully!')
      } else {
        await createPlayer(form)
        showSuccess('Player created successfully!')
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to save player:', error)
      showError('Failed to save player. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const del = async (row: any) => {
    if (window.confirm(`Delete player "${row.firstName} ${row.lastName}"?`)) {
      try {
        await deletePlayer(row.id)
        showSuccess('Player deleted successfully!')
      } catch (error) {
        console.error('Failed to delete player:', error)
        showError('Failed to delete player. Please try again.')
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Players</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={fetchPlayers} disabled={loading}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={players} columns={columns} onRowClick={onEdit} loading={loading} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Player' : 'New Player'} onClose={() => setOpen(false)} onSave={save} saving={saving}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
          />
          <TextField
            label="Last Name"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
          />
          <FormControl fullWidth required disabled={saving}>
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              label="Gender"
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            fullWidth
            disabled={saving}
          />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
