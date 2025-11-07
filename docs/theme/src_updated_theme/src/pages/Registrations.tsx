import { useEffect, useState, useCallback } from 'react'
import { Stack, Button, TextField, Typography, Paper, Autocomplete, MenuItem, Select, FormControl, InputLabel, IconButton, Tooltip, Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Box, CircularProgress, Menu } from '@mui/material'
import { CheckCircle, Cancel, Sync, Download, ArrowDropDown, QrCode2 } from '@mui/icons-material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { useRegistrationStore } from '../stores/useRegistrationStore'
import { useTournamentStore } from '../stores/useTournamentStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import { formatCheckInTime, formatTimeWindow } from '../utils/timeUtils'
import { ApiErrorResponse } from '../types'
import { batchCheckInRegistrations, batchUndoCheckInRegistrations, syncScheduledTimeFromMatch } from '../api/registrations'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuth } from '../hooks/useAuth'
import { RoleGuard } from '../components/common/RoleGuard'

export function Registrations() {
  const { isAdmin } = useAuth()
  const { registrations, loading, page, size: pageSize, totalElements, fetchRegistrations, createRegistration, updateRegistration, deleteRegistration, checkIn, undoCheckIn, setPage, setSize } = useRegistrationStore()
  const { tournaments, fetchTournaments } = useTournamentStore()
  const { players, fetchPlayers } = usePlayerStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ tournament: null, player: null, partner1: null, partner2: null, categoryType: 'SINGLES', scheduledTime: '' })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [checkInFilter, setCheckInFilter] = useState<'all' | 'checked-in' | 'not-checked-in'>('all')
  const [confirmUndoOpen, setConfirmUndoOpen] = useState(false)
  const [selectedRegistrationId, setSelectedRegistrationId] = useState<number | null>(null)
  const [selectedRowIds, setSelectedRowIds] = useState<number[]>([])
  const [batchProcessing, setBatchProcessing] = useState(false)
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null)
  const [syncing, setSyncing] = useState(false)
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false)
  const [qrCodeRegistrationId, setQrCodeRegistrationId] = useState<number | null>(null)

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  // WebSocket connection for real-time updates
  const handleCheckInEvent = useCallback((event: any) => {
    console.log('[Registrations] Received check-in event:', event)
    // Refresh registrations to show updated check-in status
    fetchRegistrations()
  }, [fetchRegistrations])

  useWebSocket(handleCheckInEvent, true)

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
    setForm({ tournament: null, player: null, partner1: null, partner2: null, categoryType: 'SINGLES', scheduledTime: '' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    // Convert ISO instant to datetime-local format (YYYY-MM-DDTHH:mm)
    const scheduledTimeLocal = row.scheduledTime
      ? new Date(row.scheduledTime).toISOString().slice(0, 16)
      : ''
    setForm({
      tournament: typeof row.tournament === 'object' ? row.tournament : tournaments.find(t => t.id === row.tournament),
      player: typeof row.player === 'object' ? row.player : players.find(p => p.id === row.player),
      categoryType: row.categoryType || 'SINGLES',
      scheduledTime: scheduledTimeLocal
    })
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.tournament) {
      showError('Tournament is required')
      return false
    }
    if (!form.categoryType || (form.categoryType !== 'SINGLES' && form.categoryType !== 'DOUBLES')) {
      showError('Category type must be SINGLES or DOUBLES')
      return false
    }

    // Validate based on category type
    if (form.categoryType === 'SINGLES') {
      if (!form.player) {
        showError('Player is required for SINGLES')
        return false
      }
    } else {
      // DOUBLES
      if (!form.partner1 || !form.partner2) {
        showError('Both partners are required for DOUBLES')
        return false
      }
      if (form.partner1.id === form.partner2.id) {
        showError('Partners must be different players')
        return false
      }
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    // Convert datetime-local to ISO instant (UTC)
    const scheduledTimeISO = form.scheduledTime
      ? new Date(form.scheduledTime).toISOString()
      : null

    setSaving(true)
    try {
      let payload: any

      if (form.categoryType === 'SINGLES') {
        // SINGLES registration
        payload = {
          tournamentId: form.tournament?.id || form.tournament,
          playerId: form.player?.id || form.player,
          categoryType: form.categoryType,
          scheduledTime: scheduledTimeISO
        }
      } else {
        // DOUBLES registration - create team first
        const teamPayload = {
          player1Id: form.partner1?.id,
          player2Id: form.partner2?.id
        }

        // Create team (POST /api/v1/teams)
        const teamResponse = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(teamPayload)
        })

        if (!teamResponse.ok) {
          const errorData = await teamResponse.json().catch(() => ({}))
          throw new Error(errorData.message || 'Failed to create team')
        }

        const team = await teamResponse.json()

        // Create registration with teamId
        payload = {
          tournamentId: form.tournament?.id || form.tournament,
          teamId: team.id,
          categoryType: form.categoryType,
          scheduledTime: scheduledTimeISO
        }
      }

      if (editingId) {
        await updateRegistration(editingId, payload)
        showSuccess('Registration updated successfully!')
      } else {
        await createRegistration(payload)
        showSuccess('Registration created successfully!')
      }
      setOpen(false)
    } catch (error: any) {
      console.error('Failed to save registration:', error)
      showError(error.message || 'Failed to save registration. Please try again.')
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

  const handleCheckIn = async (id: number) => {
    try {
      await checkIn(id)
      showSuccess('Player checked in successfully!')
    } catch (error: any) {
      console.error('Failed to check in:', error)
      const apiError = error as ApiErrorResponse

      if (apiError.code === 'TIME_WINDOW_VIOLATION' && apiError.details) {
        const window = formatTimeWindow(apiError.details.allowedFrom, apiError.details.allowedTo)
        showError(`Check-in allowed only during ${window}`)
      } else if (apiError.code === 'STATE_CONFLICT') {
        showError(apiError.message || 'Already checked in')
      } else {
        showError(apiError.message || 'Failed to check in. Please try again.')
      }
    }
  }

  const handleUndoCheckIn = async () => {
    if (!selectedRegistrationId) return

    try {
      await undoCheckIn(selectedRegistrationId)
      showSuccess('Check-in undone successfully!')
      setConfirmUndoOpen(false)
      setSelectedRegistrationId(null)
    } catch (error: any) {
      console.error('Failed to undo check-in:', error)
      const apiError = error as ApiErrorResponse
      showError(apiError.message || 'Failed to undo check-in. Please try again.')
      setConfirmUndoOpen(false)
    }
  }

  const openUndoConfirm = (id: number) => {
    setSelectedRegistrationId(id)
    setConfirmUndoOpen(true)
  }

  const handleBatchCheckIn = async () => {
    if (selectedRowIds.length === 0) {
      showError('Please select registrations to check in')
      return
    }

    setBatchProcessing(true)
    try {
      const result = await batchCheckInRegistrations(selectedRowIds)

      // Refresh data to show updated check-in statuses
      await fetchRegistrations()

      // Show summary message
      if (result.failureCount === 0) {
        showSuccess(`Successfully checked in ${result.successCount} registration(s)`)
      } else {
        showError(`Checked in ${result.successCount} registration(s). ${result.failureCount} failed. Check console for details.`)
        console.error('Batch check-in failures:', result.failures)
      }

      // Clear selection
      setSelectedRowIds([])
    } catch (error: any) {
      console.error('Batch check-in error:', error)
      showError('Failed to process batch check-in')
    } finally {
      setBatchProcessing(false)
    }
  }

  const handleBatchUndoCheckIn = async () => {
    if (selectedRowIds.length === 0) {
      showError('Please select registrations to undo check-in')
      return
    }

    setBatchProcessing(true)
    try {
      const result = await batchUndoCheckInRegistrations(selectedRowIds)

      // Refresh data
      await fetchRegistrations()

      // Show summary message
      if (result.failureCount === 0) {
        showSuccess(`Successfully undone check-in for ${result.successCount} registration(s)`)
      } else {
        showError(`Undone ${result.successCount} registration(s). ${result.failureCount} failed. Check console for details.`)
        console.error('Batch undo failures:', result.failures)
      }

      // Clear selection
      setSelectedRowIds([])
    } catch (error: any) {
      console.error('Batch undo error:', error)
      showError('Failed to process batch undo check-in')
    } finally {
      setBatchProcessing(false)
    }
  }

  const handleSyncFromMatch = async () => {
    if (!editingId) return

    setSyncing(true)
    try {
      const updated = await syncScheduledTimeFromMatch(editingId)

      // Update form with synced time (convert ISO instant to datetime-local format)
      const scheduledTimeLocal = updated.scheduledTime
        ? new Date(updated.scheduledTime).toISOString().slice(0, 16)
        : ''
      setForm({ ...form, scheduledTime: scheduledTimeLocal })

      showSuccess('Scheduled time synced from match successfully!')
    } catch (error: any) {
      console.error('Failed to sync scheduled time:', error)
      const apiError = error as ApiErrorResponse
      showError(apiError.message || 'Failed to sync scheduled time. Ensure registration has an assigned match.')
    } finally {
      setSyncing(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/registrations/export/csv`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `check-ins-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showSuccess('CSV exported successfully!')
      setExportMenuAnchor(null)
    } catch (error) {
      console.error('Failed to export CSV:', error)
      showError('Failed to export CSV. Please try again.')
    }
  }

  const handleExportPDF = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/registrations/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `check-ins-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      showSuccess('PDF exported successfully!')
      setExportMenuAnchor(null)
    } catch (error) {
      console.error('Failed to export PDF:', error)
      showError('Failed to export PDF. Please try again.')
    }
  }

  const handleOpenQRCode = (registrationId: number) => {
    setQrCodeRegistrationId(registrationId)
    setQrCodeDialogOpen(true)
  }

  const handleCloseQRCode = () => {
    setQrCodeDialogOpen(false)
    setQrCodeRegistrationId(null)
  }

  // Filter registrations based on check-in status
  const filteredRegistrations = registrations.filter(reg => {
    if (checkInFilter === 'checked-in') return reg.checkedIn
    if (checkInFilter === 'not-checked-in') return !reg.checkedIn
    return true
  })

  const columns: GridColDef[] = [
    { field: 'tournament', headerName: 'Tournament', flex: 1,
      valueGetter: (params) => params.row.tournament?.name || params.row.tournament || 'N/A' },
    { field: 'participantName', headerName: 'Participant', flex: 1,
      valueGetter: (params) => {
        // Use participantName from backend (handles both singles and doubles)
        return params.row.participantName || 'N/A'
      }},
    { field: 'categoryType', headerName: 'Category', width: 100 },
    {
      field: 'checkInStatus',
      headerName: 'Status',
      width: 80,
      renderCell: (params: GridRenderCellParams) => {
        const checkedIn = params.row.checkedIn
        const checkedInAt = params.row.checkedInAt
        const checkedInBy = params.row.checkedInBy

        const tooltipText = checkedIn
          ? `${formatCheckInTime(checkedInAt)}${checkedInBy ? `\nBy: ${checkedInBy}` : ''}`
          : 'Not checked in'

        return (
          <Tooltip title={tooltipText}>
            {checkedIn ? (
              <CheckCircle color="success" fontSize="small" />
            ) : (
              <Cancel color="disabled" fontSize="small" />
            )}
          </Tooltip>
        )
      }
    },
    {
      field: 'checkInAction',
      headerName: 'Check-In',
      width: 100,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const checkedIn = params.row.checkedIn
        const id = params.row.id

        return (
          <Tooltip title={checkedIn ? 'Undo check-in' : 'Check in player'}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                if (checkedIn) {
                  openUndoConfirm(id)
                } else {
                  handleCheckIn(id)
                }
              }}
              color={checkedIn ? 'warning' : 'primary'}
            >
              {checkedIn ? <Cancel fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
        )
      }
    },
    {
      field: 'qrCode',
      headerName: 'QR Code',
      width: 80,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        return (
          <Tooltip title="Show QR code">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenQRCode(params.row.id)
              }}
              color="default"
            >
              <QrCode2 fontSize="small" />
            </IconButton>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Registrations</Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={() => fetchRegistrations()} disabled={loading}>Refresh</Button>
        {/* Export - ADMIN only */}
        <RoleGuard roles={['ADMIN']}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            endIcon={<ArrowDropDown />}
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
          >
            Export
          </Button>
        </RoleGuard>

        {/* Batch operation buttons - ADMIN only */}
        <RoleGuard roles={['ADMIN']}>
          {selectedRowIds.length > 0 && (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleBatchCheckIn}
                disabled={batchProcessing}
                startIcon={batchProcessing ? <CircularProgress size={16} /> : <CheckCircle />}
              >
                Batch Check-In ({selectedRowIds.length})
              </Button>
              <Button
                variant="outlined"
                color="warning"
                onClick={handleBatchUndoCheckIn}
                disabled={batchProcessing}
                startIcon={batchProcessing ? <CircularProgress size={16} /> : <Cancel />}
              >
                Batch Undo ({selectedRowIds.length})
              </Button>
            </>
          )}
        </RoleGuard>

        <Box sx={{ flexGrow: 1 }} />

        {/* Quick filters */}
        <Chip
          label="All"
          onClick={() => setCheckInFilter('all')}
          color={checkInFilter === 'all' ? 'primary' : 'default'}
          variant={checkInFilter === 'all' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Checked In"
          icon={<CheckCircle fontSize="small" />}
          onClick={() => setCheckInFilter('checked-in')}
          color={checkInFilter === 'checked-in' ? 'success' : 'default'}
          variant={checkInFilter === 'checked-in' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Not Checked In"
          icon={<Cancel fontSize="small" />}
          onClick={() => setCheckInFilter('not-checked-in')}
          color={checkInFilter === 'not-checked-in' ? 'default' : 'default'}
          variant={checkInFilter === 'not-checked-in' ? 'filled' : 'outlined'}
        />
      </Stack>

      {/* Legend */}
      <Paper sx={{ p: 1, bgcolor: 'background.default' }}>
        <Typography variant="caption" color="text.secondary">
          <CheckCircle fontSize="inherit" color="success" /> = Checked in | <Cancel fontSize="inherit" color="disabled" /> = Not checked in
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <CrudTable
          rows={filteredRegistrations}
          columns={columns}
          onRowClick={onEdit}
          loading={loading}
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={totalElements}
          onPageChange={setPage}
          onPageSizeChange={setSize}
          checkboxSelection
          rowSelectionModel={selectedRowIds}
          onRowSelectionModelChange={setSelectedRowIds}
        />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Registration' : 'New Registration'} onClose={() => setOpen(false)} onSave={save} saving={saving}>
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
          {form.categoryType === 'SINGLES' ? (
            <Autocomplete
              options={players}
              getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
              value={form.player}
              onChange={(_, newValue) => setForm({ ...form, player: newValue })}
              renderInput={(params) => <TextField {...params} label="Player" required />}
              fullWidth
              disabled={saving}
            />
          ) : (
            <>
              <Autocomplete
                options={players}
                getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
                value={form.partner1}
                onChange={(_, newValue) => setForm({ ...form, partner1: newValue })}
                renderInput={(params) => <TextField {...params} label="Partner 1" required />}
                fullWidth
                disabled={saving}
              />
              <Autocomplete
                options={players}
                getOptionLabel={(option) => option.firstName && option.lastName ? `${option.firstName} ${option.lastName}` : ''}
                value={form.partner2}
                onChange={(_, newValue) => setForm({ ...form, partner2: newValue })}
                renderInput={(params) => <TextField {...params} label="Partner 2" required />}
                fullWidth
                disabled={saving}
              />
            </>
          )}
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
          <Box>
            <TextField
              label="Scheduled Time"
              name="scheduledTime"
              type="datetime-local"
              value={form.scheduledTime}
              onChange={handleChange}
              fullWidth
              disabled={saving}
              helperText="Optional: Set when player should arrive for check-in (local time)"
              InputLabelProps={{
                shrink: true,
              }}
            />
            {editingId && (
              <Button
                variant="outlined"
                size="small"
                startIcon={syncing ? <CircularProgress size={16} /> : <Sync />}
                onClick={handleSyncFromMatch}
                disabled={syncing || saving}
                sx={{ mt: 1 }}
              >
                Sync from Match
              </Button>
            )}
          </Box>
        </Stack>
      </FormDialog>

      {/* Undo check-in confirmation dialog */}
      <Dialog open={confirmUndoOpen} onClose={() => setConfirmUndoOpen(false)}>
        <DialogTitle>Undo Check-In?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to undo check-in for this player? This action will mark them as not checked in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUndoOpen(false)}>Cancel</Button>
          <Button onClick={handleUndoCheckIn} color="warning" variant="contained">
            Undo Check-In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Export menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={handleExportCSV}>
          <Download sx={{ mr: 1 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={handleExportPDF}>
          <Download sx={{ mr: 1 }} />
          Export as PDF
        </MenuItem>
      </Menu>

      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onClose={handleCloseQRCode} maxWidth="sm" fullWidth>
        <DialogTitle>Registration QR Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 2 }}>
            {qrCodeRegistrationId && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Registration ID: {qrCodeRegistrationId}
                </Typography>
                <img
                  src={`${import.meta.env.VITE_API_BASE}/api/v1/registrations/${qrCodeRegistrationId}/qrcode`}
                  alt="QR Code"
                  style={{ width: '300px', height: '300px', border: '1px solid #ddd' }}
                />
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Scan this QR code to quickly check in the player
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseQRCode}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
