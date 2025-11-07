import { useEffect, useState } from 'react'
import {
  Stack,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Autocomplete,
  IconButton,
  Tooltip,
  Alert,
  Box,
  Divider
} from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import { CrudTable } from '../components/CrudTable'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import { FormDialog } from '../components/FormDialog'
import { CategoryBadges } from '../components/categories/CategoryBadges'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { useCategoryStore } from '../stores/useCategoryStore'
import { useTournamentStore } from '../stores/useTournamentStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import { useTournamentManagePermission } from '../hooks/useTournamentManagePermission'
import type { Tournament, GenderRestriction, CategoryType, TournamentFormat } from '../types'

const GENDER_RESTRICTIONS: GenderRestriction[] = ['OPEN', 'MALE', 'FEMALE']
const CATEGORY_TYPES: CategoryType[] = ['SINGLES', 'DOUBLES']
const TOURNAMENT_FORMATS: TournamentFormat[] = ['SINGLE_ELIMINATION', 'ROUND_ROBIN']

export function Categories() {
  const { categories, loading, fetchCategoriesByTournament, createCategory, updateCategory, deleteCategory } = useCategoryStore()
  const { tournaments, fetchTournaments } = useTournamentStore()
  const { showSuccess, showError } = useNotificationStore()

  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<any>({
    tournamentId: null,
    name: '',
    categoryType: 'SINGLES',
    format: 'SINGLE_ELIMINATION',
    genderRestriction: 'OPEN',
    minAge: null,
    maxAge: null,
    maxParticipants: null,
    registrationFee: 0
  })
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null)

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  // Tournament-scoped RBAC permission check
  const { canManage, loading: permissionLoading } = useTournamentManagePermission(selectedTournament?.id)

  // Open confirm dialog for deletion
  const confirmDelete = (row: any) => {
    setCategoryToDelete(row)
    setConfirmOpen(true)
  }

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return

    setDeleting(true)
    try {
      await deleteCategory(categoryToDelete.id)
      showSuccess('Category deleted successfully!')
      setConfirmOpen(false)
      setCategoryToDelete(null)
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to delete category. Please try again.'
      showError(errorMessage)
    } finally {
      setDeleting(false)
    }
  }

  // Cancel deletion
  const handleCancelDelete = () => {
    setConfirmOpen(false)
    setCategoryToDelete(null)
  }

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
    { field: 'categoryType', headerName: 'Type', width: 100 },
    { field: 'format', headerName: 'Format', width: 150 },
    {
      field: 'badges',
      headerName: 'Rules',
      width: 400,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <CategoryBadges category={params.row} size="small" />
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        canManage ? (
          <Tooltip title="Delete">
            <IconButton
              color="error"
              onClick={(e) => {
                e.stopPropagation()
                confirmDelete(params.row)
              }}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : null
      )
    }
  ]

  useEffect(() => {
    fetchTournaments()
  }, [fetchTournaments])

  useEffect(() => {
    if (selectedTournament) {
      fetchCategoriesByTournament(selectedTournament.id)
    }
  }, [selectedTournament, fetchCategoriesByTournament])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((f: any) => ({
      ...f,
      [name]: value === '' ? null : value
    }))
  }

  const handleNumberChange = (e: any) => {
    const { name, value } = e.target
    setForm((f: any) => ({
      ...f,
      [name]: value === '' ? null : Number(value)
    }))
  }

  const onNew = () => {
    if (!selectedTournament) {
      showError('Please select a tournament first')
      return
    }
    if (!canManage) {
      showError('You do not have permission to create categories in this tournament')
      return
    }
    setEditingId(null)
    setForm({
      tournamentId: selectedTournament.id,
      name: '',
      categoryType: 'SINGLES',
      format: 'SINGLE_ELIMINATION',
      genderRestriction: 'OPEN',
      minAge: null,
      maxAge: null,
      maxParticipants: null,
      registrationFee: 0
    })
    setOpen(true)
  }

  const onEdit = (row: any) => {
    if (!canManage) {
      showError('You do not have permission to edit categories in this tournament')
      return
    }
    setEditingId(row.id)
    setForm({
      tournamentId: row.tournamentId,
      name: row.name,
      categoryType: row.categoryType,
      format: row.format,
      genderRestriction: row.genderRestriction,
      minAge: row.minAge,
      maxAge: row.maxAge,
      maxParticipants: row.maxParticipants,
      registrationFee: row.registrationFee
    })
    setOpen(true)
  }

  const validateForm = () => {
    if (!form.name || form.name.trim().length < 2) {
      showError('Category name must be at least 2 characters')
      return false
    }
    if (form.name.trim().length > 120) {
      showError('Category name must not exceed 120 characters')
      return false
    }
    if (!form.categoryType) {
      showError('Category type is required')
      return false
    }
    if (!form.format) {
      showError('Tournament format is required')
      return false
    }
    if (!form.genderRestriction) {
      showError('Gender restriction is required')
      return false
    }
    if (form.minAge !== null && form.minAge < 0) {
      showError('Minimum age cannot be negative')
      return false
    }
    if (form.maxAge !== null && form.maxAge < 0) {
      showError('Maximum age cannot be negative')
      return false
    }
    if (form.minAge !== null && form.maxAge !== null && form.minAge > form.maxAge) {
      showError('Minimum age cannot be greater than maximum age')
      return false
    }
    if (form.maxParticipants !== null && form.maxParticipants < 2) {
      showError('Maximum participants must be at least 2')
      return false
    }
    if (form.registrationFee < 0) {
      showError('Registration fee cannot be negative')
      return false
    }
    return true
  }

  const save = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const payload = {
        ...form,
        tournamentId: selectedTournament!.id
      }

      if (editingId) {
        // For update, remove tournamentId as it's not in UpdateCategoryRequest
        const { tournamentId, ...updatePayload } = payload
        await updateCategory(editingId, updatePayload)
        showSuccess('Category updated successfully!')
      } else {
        await createCategory(payload)
        showSuccess('Category created successfully!')
      }
      setOpen(false)
    } catch (error: any) {
      console.error('Failed to save category:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save category. Please try again.'
      showError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Category Management</Typography>

      {/* Tournament Selector */}
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Autocomplete
            options={tournaments}
            getOptionLabel={(option) => `${option.name} (${option.location})`}
            value={selectedTournament}
            onChange={(_, newValue) => setSelectedTournament(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Tournament"
                placeholder="Choose a tournament to manage categories"
                required
              />
            )}
            loading={loading}
          />
        </Stack>
      </Paper>

      {selectedTournament && (
        <>
          {/* RBAC Alert - Read-only access message */}
          {!canManage && !permissionLoading && (
            <Alert severity="info">
              You have read-only access to this tournament's categories.
              Contact a tournament administrator (OWNER or ADMIN) to create or edit categories.
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={onNew}
              disabled={!canManage || permissionLoading}
            >
              New Category
            </Button>
            <Button
              onClick={() => fetchCategoriesByTournament(selectedTournament.id)}
              disabled={loading}
            >
              Refresh
            </Button>
          </Stack>

          <Paper sx={{ p: 2 }}>
            <CrudTable
              rows={categories}
              columns={columns}
              onRowClick={canManage ? onEdit : undefined}
              loading={loading || permissionLoading}
            />
          </Paper>
        </>
      )}

      <FormDialog
        open={open}
        title={editingId ? 'Edit Category' : 'New Category'}
        onClose={() => setOpen(false)}
        onSave={save}
        saving={saving}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Category Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
            helperText="e.g., Men's Singles - Under 21"
          />

          <Stack direction="row" spacing={2}>
            <TextField
              select
              label="Category Type"
              name="categoryType"
              value={form.categoryType}
              onChange={handleChange}
              fullWidth
              required
              disabled={saving}
            >
              {CATEGORY_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Format"
              name="format"
              value={form.format}
              onChange={handleChange}
              fullWidth
              required
              disabled={saving}
            >
              {TOURNAMENT_FORMATS.map((format) => (
                <MenuItem key={format} value={format}>
                  {format.replace('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            select
            label="Gender Restriction"
            name="genderRestriction"
            value={form.genderRestriction}
            onChange={handleChange}
            fullWidth
            required
            disabled={saving}
            helperText="OPEN allows all genders"
          >
            {GENDER_RESTRICTIONS.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Minimum Age"
              name="minAge"
              type="number"
              value={form.minAge ?? ''}
              onChange={handleNumberChange}
              fullWidth
              disabled={saving}
              helperText="Leave empty for no minimum"
              inputProps={{ min: 0 }}
            />

            <TextField
              label="Maximum Age"
              name="maxAge"
              type="number"
              value={form.maxAge ?? ''}
              onChange={handleNumberChange}
              fullWidth
              disabled={saving}
              helperText="Leave empty for no maximum"
              inputProps={{ min: 0 }}
            />
          </Stack>

          <TextField
            label="Maximum Participants"
            name="maxParticipants"
            type="number"
            value={form.maxParticipants ?? ''}
            onChange={handleNumberChange}
            fullWidth
            disabled={saving}
            helperText="Leave empty for unlimited. Minimum: 2"
            inputProps={{ min: 2 }}
          />

          <TextField
            label="Registration Fee (₹)"
            name="registrationFee"
            type="number"
            value={form.registrationFee}
            onChange={handleNumberChange}
            fullWidth
            required
            disabled={saving}
            helperText="Enter 0 for free entry"
            inputProps={{ min: 0, step: 0.01 }}
          />

          {/* Live Preview Badges */}
          <Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Preview:
            </Typography>
            <CategoryBadges category={form} size="small" />
          </Box>
        </Stack>
      </FormDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete Category?"
        message={
          categoryToDelete
            ? `This action cannot be undone. Category: "${categoryToDelete.name}"`
            : ''
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={deleting}
      />
    </Stack>
  )
}
