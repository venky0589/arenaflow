import { useEffect, useState } from 'react'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { useTournamentStore } from '../stores/useTournamentStore'
import { useNotificationStore } from '../stores/useNotificationStore'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'location', headerName: 'Location', flex: 1 },
  { field: 'startDate', headerName: 'Start Date', flex: 1 },
  { field: 'endDate', headerName: 'End Date', flex: 1 }
]

export function Tournaments() {
  const { tournaments, loading, fetchTournaments, createTournament, updateTournament, deleteTournament } = useTournamentStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ name: '', location: '', startDate: '', endDate: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => {
    setEditingId(null)
    setForm({ name: '', location: '', startDate: '', endDate: '' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    setForm(row)
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 3) {
      showError('Tournament name must be at least 3 characters')
      return false
    }
    if (!form.location || form.location.trim().length < 2) {
      showError('Location must be at least 2 characters')
      return false
    }
    if (!form.startDate) {
      showError('Start date is required')
      return false
    }
    if (!form.endDate) {
      showError('End date is required')
      return false
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      showError('End date must be on or after start date')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editingId) {
        await updateTournament(editingId, form)
        showSuccess('Tournament updated successfully!')
      } else {
        await createTournament(form)
        showSuccess('Tournament created successfully!')
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to save tournament:', error)
      showError('Failed to save tournament. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const del = async (row: any) => {
    if (window.confirm(`Delete tournament "${row.name}"?`)) {
      try {
        await deleteTournament(row.id)
        showSuccess('Tournament deleted successfully!')
      } catch (error) {
        console.error('Failed to delete tournament:', error)
        showError('Failed to delete tournament. Please try again.')
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Tournaments</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={fetchTournaments} disabled={loading}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={tournaments} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Tournament' : 'New Tournament'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
          />
          <TextField
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
          />
          <TextField
            label="Start Date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            name="endDate"
            type="date"
            value={form.endDate}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
