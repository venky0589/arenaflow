import { useEffect, useState } from 'react'
import { Stack, Button, TextField, Typography, Paper, Autocomplete, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { useRegistrationStore } from '../stores/useRegistrationStore'
import { useTournamentStore } from '../stores/useTournamentStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useNotificationStore } from '../stores/useNotificationStore'

const columns: GridColDef[] = [
  { field: 'tournament', headerName: 'Tournament', flex: 1,
    valueGetter: (params) => params.row.tournament?.name || params.row.tournament || 'N/A' },
  { field: 'player', headerName: 'Player', flex: 1,
    valueGetter: (params) => {
      const p = params.row.player
      return p?.firstName && p?.lastName ? `${p.firstName} ${p.lastName}` : (p || 'N/A')
    }},
  { field: 'categoryType', headerName: 'Category', flex: 1 }
]

export function Registrations() {
  const { registrations, loading, fetchRegistrations, createRegistration, updateRegistration, deleteRegistration } = useRegistrationStore()
  const { tournaments, fetchTournaments } = useTournamentStore()
  const { players, fetchPlayers } = usePlayerStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ tournament: null, player: null, categoryType: 'SINGLES' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  useEffect(() => {
    if (open) {
      // Load dropdown options when dialog opens
      if (tournaments.length === 0) fetchTournaments()
      if (players.length === 0) fetchPlayers()
    }
  }, [open, tournaments.length, players.length, fetchTournaments, fetchPlayers])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => {
    setEditingId(null)
    setForm({ tournament: null, player: null, categoryType: 'SINGLES' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    setForm({
      tournament: typeof row.tournament === 'object' ? row.tournament : tournaments.find(t => t.id === row.tournament),
      player: typeof row.player === 'object' ? row.player : players.find(p => p.id === row.player),
      categoryType: row.categoryType || 'SINGLES'
    })
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.tournament) {
      showError('Tournament is required')
      return false
    }
    if (!form.player) {
      showError('Player is required')
      return false
    }
    if (!form.categoryType || (form.categoryType !== 'SINGLES' && form.categoryType !== 'DOUBLES')) {
      showError('Category type must be SINGLES or DOUBLES')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    const payload = {
      tournament: form.tournament?.id || form.tournament,
      player: form.player?.id || form.player,
      categoryType: form.categoryType
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateRegistration(editingId, payload)
        showSuccess('Registration updated successfully!')
      } else {
        await createRegistration(payload)
        showSuccess('Registration created successfully!')
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to save registration:', error)
      showError('Failed to save registration. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const del = async (row: any) => {
    if (window.confirm(`Delete registration for ${row.player?.firstName || 'this player'}?`)) {
      try {
        await deleteRegistration(row.id)
        showSuccess('Registration deleted successfully!')
      } catch (error) {
        console.error('Failed to delete registration:', error)
        showError('Failed to delete registration. Please try again.')
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Registrations</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={fetchRegistrations} disabled={loading}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={registrations} columns={columns} onRowClick={onEdit} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Registration' : 'New Registration'} onClose={() => setOpen(false)} onSave={save}>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Autocomplete
            options={tournaments}
            getOptionLabel={(option) => option.name || ''}
            value={form.tournament}
            onChange={(_, newValue) => setForm({ ...form, tournament: newValue })}
            renderInput={(params) => <TextField {...params} label="Tournament" required />}
            fullWidth
            disabled={saving}
          />
          <Autocomplete
            options={players}
            getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
            value={form.player}
            onChange={(_, newValue) => setForm({ ...form, player: newValue })}
            renderInput={(params) => <TextField {...params} label="Player" required />}
            fullWidth
            disabled={saving}
          />
          <FormControl fullWidth required disabled={saving}>
            <InputLabel>Category Type</InputLabel>
            <Select
              name="categoryType"
              value={form.categoryType}
              onChange={handleChange}
              label="Category Type"
            >
              <MenuItem value="SINGLES">SINGLES</MenuItem>
              <MenuItem value="DOUBLES">DOUBLES</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </FormDialog>
    </Stack>
  )
}
