import { useEffect, useState } from 'react'
import { Stack, Button, TextField, Typography, Paper, Autocomplete, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { useMatchStore } from '../stores/useMatchStore'
import { useTournamentStore } from '../stores/useTournamentStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useCourtStore } from '../stores/useCourtStore'
import { useNotificationStore } from '../stores/useNotificationStore'

const columns: GridColDef[] = [
  { field: 'tournament', headerName: 'Tournament', flex: 1,
    valueGetter: (params) => params.row.tournament?.name || params.row.tournament || 'N/A' },
  { field: 'court', headerName: 'Court', flex: 1,
    valueGetter: (params) => params.row.court?.name || params.row.court || 'N/A' },
  { field: 'player1', headerName: 'Player 1', flex: 1,
    valueGetter: (params) => {
      const p = params.row.player1
      return p?.firstName && p?.lastName ? `${p.firstName} ${p.lastName}` : (p || 'N/A')
    }},
  { field: 'player2', headerName: 'Player 2', flex: 1,
    valueGetter: (params) => {
      const p = params.row.player2
      return p?.firstName && p?.lastName ? `${p.firstName} ${p.lastName}` : (p || 'N/A')
    }},
  { field: 'score1', headerName: 'Score 1', flex: 1 },
  { field: 'score2', headerName: 'Score 2', flex: 1 },
  { field: 'status', headerName: 'Status', flex: 1 },
  { field: 'scheduledAt', headerName: 'Scheduled At', flex: 1 }
]

export function Matches() {
  const { matches, loading, fetchMatches, createMatch, updateMatch, deleteMatch } = useMatchStore()
  const { tournaments, fetchTournaments } = useTournamentStore()
  const { players, fetchPlayers } = usePlayerStore()
  const { courts, fetchCourts } = useCourtStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ tournament: null, court: null, player1: null, player2: null, score1: '', score2: '', status: 'SCHEDULED', scheduledAt: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  useEffect(() => {
    if (open) {
      // Load dropdown options when dialog opens
      if (tournaments.length === 0) fetchTournaments()
      if (players.length === 0) fetchPlayers()
      if (courts.length === 0) fetchCourts()
    }
  }, [open, tournaments.length, players.length, courts.length, fetchTournaments, fetchPlayers, fetchCourts])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => {
    setEditingId(null)
    setForm({ tournament: null, court: null, player1: null, player2: null, score1: '', score2: '', status: 'SCHEDULED', scheduledAt: '' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    setForm({
      tournament: typeof row.tournament === 'object' ? row.tournament : tournaments.find(t => t.id === row.tournament),
      court: typeof row.court === 'object' ? row.court : courts.find(c => c.id === row.court),
      player1: typeof row.player1 === 'object' ? row.player1 : players.find(p => p.id === row.player1),
      player2: typeof row.player2 === 'object' ? row.player2 : players.find(p => p.id === row.player2),
      score1: row.score1 || '',
      score2: row.score2 || '',
      status: row.status || 'SCHEDULED',
      scheduledAt: row.scheduledAt || ''
    })
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.tournament) {
      showError('Tournament is required')
      return false
    }
    if (!form.court) {
      showError('Court is required')
      return false
    }
    if (!form.player1) {
      showError('Player 1 is required')
      return false
    }
    if (!form.player2) {
      showError('Player 2 is required')
      return false
    }
    if (form.player1?.id === form.player2?.id) {
      showError('Player 1 and Player 2 must be different')
      return false
    }
    if (!form.scheduledAt) {
      showError('Scheduled time is required')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    const payload = {
      tournament: form.tournament?.id || form.tournament,
      court: form.court?.id || form.court,
      player1: form.player1?.id || form.player1,
      player2: form.player2?.id || form.player2,
      score1: form.score1 ? parseInt(form.score1) : null,
      score2: form.score2 ? parseInt(form.score2) : null,
      status: form.status,
      scheduledAt: form.scheduledAt
    }

    setSaving(true)
    try {
      if (editingId) {
        await updateMatch(editingId, payload)
        showSuccess('Match updated successfully!')
      } else {
        await createMatch(payload)
        showSuccess('Match created successfully!')
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to save match:', error)
      showError('Failed to save match. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const del = async (row: any) => {
    if (window.confirm(`Delete this match?`)) {
      try {
        await deleteMatch(row.id)
        showSuccess('Match deleted successfully!')
      } catch (error) {
        console.error('Failed to delete match:', error)
        showError('Failed to delete match. Please try again.')
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Matches</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={fetchMatches} disabled={loading}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable rows={matches} columns={columns} onRowClick={onEdit} loading={loading} />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Match' : 'New Match'} onClose={() => setOpen(false)} onSave={save} saving={saving}>
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
            options={courts}
            getOptionLabel={(option) => option.name || ''}
            value={form.court}
            onChange={(_, newValue) => setForm({ ...form, court: newValue })}
            renderInput={(params) => <TextField {...params} label="Court" required />}
            fullWidth
            disabled={saving}
          />
          <Autocomplete
            options={players}
            getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
            value={form.player1}
            onChange={(_, newValue) => setForm({ ...form, player1: newValue })}
            renderInput={(params) => <TextField {...params} label="Player 1" required />}
            fullWidth
            disabled={saving}
          />
          <Autocomplete
            options={players}
            getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
            value={form.player2}
            onChange={(_, newValue) => setForm({ ...form, player2: newValue })}
            renderInput={(params) => <TextField {...params} label="Player 2" required />}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Score 1"
            name="score1"
            type="number"
            value={form.score1}
            onChange={handleChange}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Score 2"
            name="score2"
            type="number"
            value={form.score2}
            onChange={handleChange}
            fullWidth
            disabled={saving}
          />
          <FormControl fullWidth disabled={saving}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={form.status}
              onChange={handleChange}
              label="Status"
            >
              <MenuItem value="SCHEDULED">SCHEDULED</MenuItem>
              <MenuItem value="IN_PROGRESS">IN PROGRESS</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Scheduled At"
            name="scheduledAt"
            type="datetime-local"
            value={form.scheduledAt}
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
