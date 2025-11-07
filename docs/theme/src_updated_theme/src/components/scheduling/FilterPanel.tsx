import {
  Box,
  Paper,
  Typography,
  FormControl,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  TextField,
  Chip,
  Stack
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { Court, Player } from '../../types'

interface Category {
  id: number
  name: string
}

interface FilterPanelProps {
  courts: Court[]
  players: Player[]
  categories?: Category[]
  selectedDate?: Date | null
  selectedCourtIds: number[]
  selectedCategoryIds: number[]
  selectedRounds: number[]
  selectedStatuses: string[]
  playerSearch: string
  showLocked: boolean
  showConflicts: boolean
  showUnscheduled: boolean
  onDateChange?: (date: Date | null) => void
  onCourtFilterChange: (courtIds: number[]) => void
  onCategoryFilterChange: (categoryIds: number[]) => void
  onRoundFilterChange: (rounds: number[]) => void
  onStatusFilterChange: (statuses: string[]) => void
  onPlayerSearchChange: (search: string) => void
  onShowLockedChange: (show: boolean) => void
  onShowConflictsChange: (show: boolean) => void
  onShowUnscheduledChange: (show: boolean) => void
}

export function FilterPanel({
  courts,
  players,
  categories = [],
  selectedDate,
  selectedCourtIds,
  selectedCategoryIds,
  selectedRounds,
  selectedStatuses,
  playerSearch,
  showLocked,
  showConflicts,
  showUnscheduled,
  onDateChange,
  onCourtFilterChange,
  onCategoryFilterChange,
  onRoundFilterChange,
  onStatusFilterChange,
  onPlayerSearchChange,
  onShowLockedChange,
  onShowConflictsChange,
  onShowUnscheduledChange
}: FilterPanelProps) {
  const statusOptions = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']
  const roundOptions = [1, 2, 3, 4, 5, 6, 7, 8]  // Common tournament rounds

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>

        <Stack spacing={2}>
        {/* Date filter */}
        {onDateChange && (
          <FormControl fullWidth>
            <DatePicker
              label="Filter by Date"
              value={selectedDate}
              onChange={onDateChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  placeholder: 'Select date to filter'
                },
                actionBar: {
                  actions: ['clear', 'today']
                }
              }}
            />
          </FormControl>
        )}

        {/* Category filter */}
        {categories.length > 0 && (
          <FormControl fullWidth>
            <Autocomplete
              multiple
              options={categories}
              getOptionLabel={(category) => category.name}
              value={categories.filter((c) => selectedCategoryIds.includes(c.id))}
              onChange={(_, newValue) => onCategoryFilterChange(newValue.map((c) => c.id))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categories"
                  placeholder="Select categories"
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))
              }
            />
          </FormControl>
        )}

        {/* Court filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={courts}
            getOptionLabel={(court) => court.name}
            value={courts.filter((c) => selectedCourtIds.includes(c.id))}
            onChange={(_, newValue) => onCourtFilterChange(newValue.map((c) => c.id))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Courts"
                placeholder="Select courts"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        </FormControl>

        {/* Player search */}
        <FormControl fullWidth>
          <Autocomplete
            options={players}
            getOptionLabel={(player) => `${player.firstName} ${player.lastName}`}
            value={null}
            onChange={(_, newValue) => {
              if (newValue) {
                onPlayerSearchChange(`${newValue.firstName} ${newValue.lastName}`)
              }
            }}
            inputValue={playerSearch}
            onInputChange={(_, newValue) => onPlayerSearchChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Player"
                placeholder="Type to search"
              />
            )}
          />
        </FormControl>

        {/* Round filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={roundOptions}
            getOptionLabel={(round) => `Round ${round}`}
            value={selectedRounds}
            onChange={(_, newValue) => onRoundFilterChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Rounds"
                placeholder="Select rounds"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={`Round ${option}`}
                  {...getTagProps({ index })}
                  size="small"
                />
              ))
            }
          />
        </FormControl>

        {/* Status filter */}
        <FormControl fullWidth>
          <Autocomplete
            multiple
            options={statusOptions}
            value={selectedStatuses}
            onChange={(_, newValue) => onStatusFilterChange(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Status"
                placeholder="Select status"
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  size="small"
                  color={
                    option === 'COMPLETED' ? 'success' :
                    option === 'IN_PROGRESS' ? 'warning' : 'info'
                  }
                />
              ))
            }
          />
        </FormControl>

        {/* Quick toggles */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Quick Filters
          </Typography>
          <Stack spacing={0.5}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showLocked}
                  onChange={(e) => onShowLockedChange(e.target.checked)}
                />
              }
              label="Show locked matches"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showConflicts}
                  onChange={(e) => onShowConflictsChange(e.target.checked)}
                />
              }
              label="Show matches with conflicts"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showUnscheduled}
                  onChange={(e) => onShowUnscheduledChange(e.target.checked)}
                />
              }
              label="Show unscheduled matches"
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
    </LocalizationProvider>
  )
}
