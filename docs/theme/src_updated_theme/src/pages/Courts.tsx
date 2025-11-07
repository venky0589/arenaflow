import { useEffect, useState } from 'react'
import { Stack, Button, TextField, Typography, Paper } from '@mui/material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { useCourtStore } from '../stores/useCourtStore'
import { useNotificationStore } from '../stores/useNotificationStore'

const columns: GridColDef[] = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'locationNote', headerName: 'Location Note', flex: 1 }
]

export function Courts() {
  const { courts, loading, page, size: pageSize, totalElements, fetchCourts, createCourt, updateCourt, deleteCourt, setPage, setSize } = useCourtStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({ name: '', locationNote: '' })
  const [editingId, setEditingId] = useState<number | null>(null)

  useEffect(() => {
    fetchCourts()
  }, [fetchCourts])

  const handleChange = (e: any) => setForm((f: any) => ({ ...f, [e.target.name]: e.target.value }))

  const onNew = () => {
    setEditingId(null)
    setForm({ name: '', locationNote: '' })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    setEditingId(row.id)
    setForm(row)
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 2) {
      showError('Court name must be at least 2 characters')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      if (editingId) {
        await updateCourt(editingId, form)
        showSuccess('Court updated successfully!')
      } else {
        await createCourt(form)
        showSuccess('Court created successfully!')
      }
      setOpen(false)
    } catch (error) {
      console.error('Failed to save court:', error)
      showError('Failed to save court. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const del = async (row: any) => {
    if (window.confirm(`Delete court "${row.name}"?`)) {
      try {
        await deleteCourt(row.id)
        showSuccess('Court deleted successfully!')
      } catch (error) {
        console.error('Failed to delete court:', error)
        showError('Failed to delete court. Please try again.')
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Courts</Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={onNew}>New</Button>
        <Button onClick={() => fetchCourts()} disabled={loading}>Refresh</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <CrudTable
          rows={courts}
          columns={columns}
          onRowClick={onEdit}
          loading={loading}
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          rowCount={totalElements}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </Paper>

      <FormDialog open={open} title={editingId ? 'Edit Court' : 'New Court'} onClose={() => setOpen(false)} onSave={save} saving={saving}>
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
            label="Location Note"
            name="locationNote"
            value={form.locationNote}
            onChange={handleChange}
            fullWidth
            disabled={saving}
          />
        </Stack>
      </FormDialog>
    </Stack>
  )
}
