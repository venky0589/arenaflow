import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Stack,
  Autocomplete,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Typography,
  Chip,
  Tooltip
} from '@mui/material'
import { Info as InfoIcon } from '@mui/icons-material'
import { bracketsApi } from '../api/brackets'
import type { Category } from '../types/bracket'

interface GenerateDrawDialogProps {
  open: boolean
  tournamentId: number | null
  onClose: () => void
  onSuccess: () => void
}

export function GenerateDrawDialog({ open, tournamentId, onClose, onSuccess }: GenerateDrawDialogProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [overwriteIfDraft, setOverwriteIfDraft] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load categories when dialog opens
  useEffect(() => {
    if (open && tournamentId) {
      loadCategories()
    } else {
      // Reset state when dialog closes
      setCategories([])
      setSelectedCategory(null)
      setOverwriteIfDraft(false)
      setError(null)
    }
  }, [open, tournamentId])

  const loadCategories = async () => {
    if (!tournamentId) return

    setLoadingCategories(true)
    setError(null)
    try {
      const response = await bracketsApi.getCategoriesByTournament(tournamentId)
      setCategories(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load categories'
      setError(errorMessage)
      console.error('Failed to load categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedCategory || !tournamentId) return

    setLoading(true)
    setError(null)

    try {
      await bracketsApi.generateDraw(tournamentId, selectedCategory.id, {
        overwriteIfDraft,
        seeds: undefined // For MVP, we don't provide manual seeding
      })

      // Success - notify parent and close
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to generate draw. Please try again.'
      setError(errorMessage)
      console.error('Failed to generate draw:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Generate Draw</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {loadingCategories ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">Loading categories...</Typography>
            </Stack>
          ) : (
            <>
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => `${option.name} (${option.categoryType})`}
                value={selectedCategory}
                onChange={(_, newValue) => setSelectedCategory(newValue)}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                      <Typography sx={{ flexGrow: 1 }}>
                        {option.name} ({option.categoryType})
                      </Typography>
                      <Chip
                        label={option.format === 'SINGLE_ELIMINATION' ? 'SE' : 'RR (V2)'}
                        size="small"
                        color={option.format === 'SINGLE_ELIMINATION' ? 'primary' : 'warning'}
                      />
                    </Stack>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Category"
                    required
                    helperText="Select the category to generate a draw for"
                  />
                )}
                disabled={loading || categories.length === 0}
                noOptionsText="No categories found for this tournament"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={overwriteIfDraft}
                    onChange={(e) => setOverwriteIfDraft(e.target.checked)}
                    disabled={loading}
                  />
                }
                label="Overwrite existing draft bracket"
              />

              {/* Format-specific info messages */}
              {selectedCategory?.format === 'SINGLE_ELIMINATION' && (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  This will generate a single-elimination bracket for all registered participants in the selected
                  category. BYEs will be automatically assigned if needed.
                </Alert>
              )}

              {selectedCategory?.format === 'ROUND_ROBIN' && (
                <Alert severity="warning" icon={<InfoIcon />} sx={{ fontSize: '0.875rem' }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Round Robin Format - Coming in Version 2
                  </Typography>
                  <Typography variant="body2">
                    Round Robin draw generation will be available in the next release. For now, please use Single
                    Elimination format, or stay tuned for updates!
                  </Typography>
                </Alert>
              )}

              {!selectedCategory && (
                <Alert severity="info" sx={{ fontSize: '0.875rem' }}>
                  Select a category to generate a tournament draw.
                </Alert>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Tooltip
          title={
            selectedCategory?.format === 'ROUND_ROBIN'
              ? 'Round Robin format is not yet available. Please select a Single Elimination category.'
              : ''
          }
          arrow
        >
          <span>
            <Button
              variant="contained"
              onClick={handleGenerate}
              disabled={
                loading ||
                !selectedCategory ||
                loadingCategories ||
                selectedCategory?.format === 'ROUND_ROBIN'
              }
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  )
}
