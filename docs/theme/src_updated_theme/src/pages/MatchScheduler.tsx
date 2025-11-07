import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Button,
  IconButton,
  ButtonGroup,
  Paper
} from '@mui/material'
import {
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Today as TodayIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material'
import { format, addDays, subDays } from 'date-fns'
import { TimelineView } from '../components/scheduling/TimelineView'
import { FilterPanel } from '../components/scheduling/FilterPanel'
import { ScheduleControlPanel } from '../components/scheduling/ScheduleControlPanel'
import { SimulationDialog } from '../components/scheduling/SimulationDialog'
import { ActivityTray } from '../components/scheduling/ActivityTray'
import { OptimisticLockDialog } from '../components/scheduling/OptimisticLockDialog'
import { useMatchStore } from '../stores/useMatchStore'
import { useTournamentStore } from '../stores/useTournamentStore'
import { useCourtStore } from '../stores/useCourtStore'
import { usePlayerStore } from '../stores/usePlayerStore'
import { useSchedulingStore } from '../stores/useSchedulingStore'
import { useNotificationStore } from '../stores/useNotificationStore'
import { useScheduleWebSocket } from '../hooks/useScheduleWebSocket'
import { SchedulableMatch, AutoScheduleRequest, ScheduleMatchRequest } from '../types'
import { exportToCSV, downloadCSV, exportToJSON, downloadJSON, printSchedule, generateFilename } from '../utils/scheduleExport'

export function MatchScheduler() {
  const { matches, fetchMatches } = useMatchStore()
  const { tournaments, fetchTournaments } = useTournamentStore()
  const { courts, fetchCourts } = useCourtStore()
  const { players, fetchPlayers } = usePlayerStore()
  const { showSuccess, showError } = useNotificationStore()

  const {
    currentSimulation,
    currentBatch,
    schedulingBatches,
    courtAvailabilities,
    filters,
    selectedDate,
    conflicts,
    loading,
    simulating,
    applying,
    simulateSchedule,
    applySchedule,
    scheduleMatch,
    lockMatch,
    unlockMatch,
    fetchSchedulingBatches,
    fetchCourtAvailability,
    setFilters,
    setSelectedDate,
    addConflict,
    updateMatchOptimistic,
    rollbackMatch
  } = useSchedulingStore()

  const [selectedTournamentId, setSelectedTournamentId] = useState<number | null>(null)
  const [showSimulationDialog, setShowSimulationDialog] = useState(false)
  const [showOptimisticLockDialog, setShowOptimisticLockDialog] = useState(false)
  const [conflictMatchId, setConflictMatchId] = useState<number | null>(null)

  // WebSocket connection for real-time updates
  const { connected: wsConnected } = useScheduleWebSocket({
    tournamentId: selectedTournamentId,
    onUpdate: (event) => {
      console.log('Schedule update received:', event)
      // Refresh matches when updates are received from other users
      fetchMatches()

      // Show notification based on action
      if (event.action === 'RESCHEDULED' || event.action === 'SCHEDULED') {
        showSuccess('Schedule updated by another user')
      }
    },
    enabled: !!selectedTournamentId
  })

  // Initial data load
  useEffect(() => {
    fetchTournaments()
    fetchCourts()
    fetchPlayers()
    fetchMatches()
  }, [fetchTournaments, fetchCourts, fetchPlayers, fetchMatches])

  // Load tournament-specific data when tournament is selected
  useEffect(() => {
    if (selectedTournamentId) {
      fetchSchedulingBatches(selectedTournamentId)
      fetchCourtAvailability()
    }
  }, [selectedTournamentId, fetchSchedulingBatches, fetchCourtAvailability])

  // Handle simulate schedule
  const handleSimulate = async (request: AutoScheduleRequest) => {
    try {
      const result = await simulateSchedule(request)
      showSuccess(`Simulation complete: ${result.scheduledCount} matches scheduled`)
      setShowSimulationDialog(true)
    } catch (error) {
      showError('Failed to simulate schedule')
    }
  }

  // Handle apply schedule
  const handleApply = async () => {
    if (!currentSimulation) return

    try {
      await applySchedule(currentSimulation.batchUuid)
      showSuccess('Schedule applied successfully!')
      setShowSimulationDialog(false)
      await fetchMatches()  // Refresh matches
    } catch (error) {
      showError('Failed to apply schedule')
    }
  }

  // Handle manual match drop (drag-and-drop)
  const handleMatchDrop = async (matchId: number, courtId: number, newTime: Date) => {
    const match = matches.find((m) => m.id === matchId) as SchedulableMatch
    if (!match) return

    // Save original state for rollback
    const originalMatch = { ...match }

    // Optimistic update
    updateMatchOptimistic(matchId, {
      court: courts.find((c) => c.id === courtId),
      scheduledAt: newTime.toISOString()
    })

    try {
      const request: ScheduleMatchRequest = {
        scheduledAt: newTime.toISOString(),
        courtId,
        estimatedDurationMinutes: match.estimatedDurationMinutes || 45,
        version: match.version || 0  // Include version for optimistic locking
      }

      await scheduleMatch(matchId, request)
      showSuccess('Match rescheduled successfully')
      await fetchMatches()  // Refresh to get server state
    } catch (error: any) {
      // Rollback on error
      rollbackMatch(matchId, originalMatch)

      // Handle optimistic lock error specifically
      if (error.code === 'OPTIMISTIC_LOCK') {
        setConflictMatchId(matchId)
        setShowOptimisticLockDialog(true)
        return  // Dialog will handle user action
      }

      // Show other conflict errors
      const errorMessage = error.response?.data?.message || error.message || 'Failed to schedule match'
      showError(errorMessage)

      if (errorMessage.includes('conflict') || errorMessage.includes('overlap')) {
        addConflict(matchId, {
          type: 'HARD',
          message: 'Scheduling conflict',
          details: errorMessage
        })
      }
    }
  }

  // Handle lock toggle
  const handleLockToggle = async (matchId: number, locked: boolean) => {
    try {
      if (locked) {
        await lockMatch(matchId)
        showSuccess('Match locked')
      } else {
        await unlockMatch(matchId)
        showSuccess('Match unlocked')
      }
      await fetchMatches()
    } catch (error) {
      showError(`Failed to ${locked ? 'lock' : 'unlock'} match`)
    }
  }

  // Handle match click
  const handleMatchClick = (match: SchedulableMatch) => {
    // Future: Open match details dialog
    console.log('Match clicked:', match)
  }

  // Export handlers
  const handleExportCSV = () => {
    const csvContent = exportToCSV({ matches: filteredMatches, courts, date: selectedDate })
    const filename = generateFilename('schedule', selectedDate)
    downloadCSV(csvContent, filename)
    showSuccess('Schedule exported to CSV')
  }

  const handleExportJSON = () => {
    const jsonContent = exportToJSON({ matches: filteredMatches, courts, date: selectedDate })
    const filename = generateFilename('schedule', selectedDate)
    downloadJSON(jsonContent, filename)
    showSuccess('Schedule exported to JSON')
  }

  const handlePrint = () => {
    printSchedule()
  }

  // Date navigation
  const handlePrevDay = () => setSelectedDate(subDays(selectedDate, 1))
  const handleNextDay = () => setSelectedDate(addDays(selectedDate, 1))
  const handleToday = () => setSelectedDate(new Date())

  // Filter matches for selected date
  const filteredMatches = matches.filter((match) => {
    const matchDate = match.scheduledAt ? new Date(match.scheduledAt) : null
    const isSameDay = matchDate && format(matchDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')

    // Apply filters
    if (filters.courtIds.length > 0) {
      const courtId = typeof match.court === 'object' ? match.court.id : match.court
      if (!filters.courtIds.includes(courtId)) return false
    }

    if (filters.statuses.length > 0 && !filters.statuses.includes(match.status)) {
      return false
    }

    if (!filters.showUnscheduled && !match.scheduledAt) {
      return false
    }

    return isSameDay || (!match.scheduledAt && filters.showUnscheduled)
  }) as SchedulableMatch[]

  return (
    <Container maxWidth={false} sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4">Match Scheduler</Typography>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Export buttons */}
            <ButtonGroup variant="outlined" size="small">
              <Button startIcon={<DownloadIcon />} onClick={handleExportCSV}>
                CSV
              </Button>
              <Button startIcon={<DownloadIcon />} onClick={handleExportJSON}>
                JSON
              </Button>
              <Button startIcon={<PrintIcon />} onClick={handlePrint}>
                Print
              </Button>
            </ButtonGroup>

            {/* Date navigation */}
            <ButtonGroup variant="outlined">
              <IconButton onClick={handlePrevDay}>
                <PrevIcon />
              </IconButton>
              <Button onClick={handleToday} startIcon={<TodayIcon />}>
                Today
              </Button>
              <IconButton onClick={handleNextDay}>
                <NextIcon />
              </IconButton>
            </ButtonGroup>

            <Paper sx={{ px: 2, py: 1 }}>
              <Typography variant="h6">
                {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
              </Typography>
            </Paper>
          </Box>
        </Box>

        {/* Tournament selector */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="subtitle2">Select Tournament:</Typography>
            <ButtonGroup>
              {tournaments.slice(0, 5).map((tournament) => (
                <Button
                  key={tournament.id}
                  variant={selectedTournamentId === tournament.id ? 'contained' : 'outlined'}
                  onClick={() => setSelectedTournamentId(tournament.id)}
                >
                  {tournament.name}
                </Button>
              ))}
            </ButtonGroup>
          </Stack>
        </Paper>

        {/* Main content */}
        <Grid container spacing={2}>
          {/* Left sidebar - Filters and Controls */}
          <Grid item xs={12} md={3}>
            <Stack spacing={2}>
              <FilterPanel
                courts={courts}
                players={players}
                selectedCourtIds={filters.courtIds}
                selectedCategoryIds={filters.categoryIds}
                selectedRounds={filters.rounds}
                selectedStatuses={filters.statuses}
                playerSearch={filters.playerSearch}
                showLocked={filters.showLocked}
                showConflicts={filters.showConflicts}
                showUnscheduled={filters.showUnscheduled}
                onCourtFilterChange={(courtIds) => setFilters({ courtIds })}
                onCategoryFilterChange={(categoryIds) => setFilters({ categoryIds })}
                onRoundFilterChange={(rounds) => setFilters({ rounds })}
                onStatusFilterChange={(statuses) => setFilters({ statuses })}
                onPlayerSearchChange={(search) => setFilters({ playerSearch: search })}
                onShowLockedChange={(show) => setFilters({ showLocked: show })}
                onShowConflictsChange={(show) => setFilters({ showConflicts: show })}
                onShowUnscheduledChange={(show) => setFilters({ showUnscheduled: show })}
              />

              <ScheduleControlPanel
                tournamentId={selectedTournamentId}
                onSimulate={handleSimulate}
                onApply={() => setShowSimulationDialog(true)}
                onRefresh={() => fetchMatches()}
                simulating={simulating}
                applying={applying}
                canApply={!!currentSimulation}
                currentBatchUuid={currentSimulation?.batchUuid}
              />

              <ActivityTray batches={schedulingBatches} />
            </Stack>
          </Grid>

          {/* Main timeline view */}
          <Grid item xs={12} md={9}>
            <Paper sx={{ p: 2 }}>
              <TimelineView
                courts={courts}
                matches={filteredMatches}
                date={selectedDate}
                startHour={8}
                endHour={22}
                slotMinutes={15}
                blackouts={courtAvailabilities}
                conflicts={conflicts}
                onMatchDrop={handleMatchDrop}
                onMatchClick={handleMatchClick}
                onLockToggle={handleLockToggle}
              />
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      {/* Simulation dialog */}
      <SimulationDialog
        open={showSimulationDialog}
        simulation={currentSimulation}
        onClose={() => setShowSimulationDialog(false)}
        onApply={handleApply}
        applying={applying}
      />

      {/* Optimistic lock conflict dialog */}
      <OptimisticLockDialog
        open={showOptimisticLockDialog}
        matchId={conflictMatchId || 0}
        onClose={() => {
          setShowOptimisticLockDialog(false)
          setConflictMatchId(null)
        }}
        onRefreshMatch={async () => {
          if (conflictMatchId) {
            await fetchMatches()  // Refresh all matches including the conflicted one
            showSuccess('Match refreshed')
          }
        }}
        onRefreshSchedule={async () => {
          await fetchMatches()  // Reload entire schedule
          showSuccess('Schedule reloaded')
        }}
      />
    </Container>
  )
}
