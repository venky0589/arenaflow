import { SchedulableMatch, Court } from '../types'
import { format, parseISO } from 'date-fns'

/**
 * Export utilities for match schedules
 */

interface ScheduleExportData {
  matches: SchedulableMatch[]
  courts: Court[]
  date: Date
}

/**
 * Export schedule to CSV format
 * @param data - Schedule data to export
 * @returns CSV string
 */
export function exportToCSV(data: ScheduleExportData): string {
  const { matches, courts, date } = data

  // CSV header
  const headers = [
    'Match ID',
    'Court',
    'Date',
    'Time',
    'Duration (min)',
    'Player 1',
    'Player 2',
    'Status',
    'Score',
    'Round',
    'Category',
    'Locked'
  ]

  // CSV rows
  const rows = matches.map((match) => {
    const courtId = typeof match.court === 'object' && 'id' in match.court
      ? match.court.id
      : (typeof match.court === 'number' ? match.court : 0)

    const courtName = typeof match.court === 'object' && 'name' in match.court
      ? match.court.name
      : courts.find((c) => c.id === courtId)?.name || 'Unknown'

    const player1Name = typeof match.player1 === 'object' && 'firstName' in match.player1
      ? `${match.player1.firstName} ${match.player1.lastName}`
      : 'Unknown'

    const player2Name = typeof match.player2 === 'object' && 'firstName' in match.player2
      ? `${match.player2.firstName} ${match.player2.lastName}`
      : 'Unknown'

    const scheduledDate = match.scheduledAt
      ? format(parseISO(match.scheduledAt), 'yyyy-MM-dd')
      : 'Unscheduled'

    const scheduledTime = match.scheduledAt
      ? format(parseISO(match.scheduledAt), 'HH:mm')
      : 'Unscheduled'

    const score = match.score1 !== undefined && match.score2 !== undefined
      ? `${match.score1}-${match.score2}`
      : 'N/A'

    return [
      match.id,
      courtName,
      scheduledDate,
      scheduledTime,
      match.estimatedDurationMinutes || 45,
      player1Name,
      player2Name,
      match.status,
      score,
      match.round || 'N/A',
      match.categoryId || 'N/A',
      match.locked ? 'Yes' : 'No'
    ]
  })

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n')

  return csvContent
}

/**
 * Download CSV file
 * @param csvContent - CSV string content
 * @param filename - File name (without extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export schedule to JSON format
 * @param data - Schedule data to export
 * @returns JSON string
 */
export function exportToJSON(data: ScheduleExportData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Download JSON file
 * @param jsonContent - JSON string content
 * @param filename - File name (without extension)
 */
export function downloadJSON(jsonContent: string, filename: string): void {
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.json`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Print schedule (opens browser print dialog)
 */
export function printSchedule(): void {
  window.print()
}

/**
 * Generate filename for exports
 * @param prefix - File prefix
 * @param date - Date for filename
 * @returns Formatted filename
 */
export function generateFilename(prefix: string, date: Date): string {
  const dateStr = format(date, 'yyyy-MM-dd')
  return `${prefix}_${dateStr}`
}
