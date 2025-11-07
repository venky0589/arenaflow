import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import relativeTime from 'dayjs/plugin/relativeTime'

// Extend dayjs with plugins
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(relativeTime)

const INDIA_TIMEZONE = 'Asia/Kolkata'

/**
 * Format an ISO timestamp to IST (India Standard Time)
 * @param timestamp ISO timestamp string
 * @param format Format string (default: 'DD MMM YYYY, HH:mm')
 * @returns Formatted date string in IST
 */
export function formatToIST(timestamp: string | null | undefined, format: string = 'DD MMM YYYY, HH:mm'): string {
  if (!timestamp) return 'N/A'
  return dayjs(timestamp).tz(INDIA_TIMEZONE).format(format)
}

/**
 * Get relative time from now (e.g., "2 hours ago")
 * @param timestamp ISO timestamp string
 * @returns Relative time string
 */
export function getRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'N/A'
  return dayjs(timestamp).fromNow()
}

/**
 * Format check-in time for tooltip display
 * Combines relative time and absolute IST time
 * @param timestamp ISO timestamp string
 * @returns Formatted string like "2 hours ago • 27 Oct 2025, 14:30"
 */
export function formatCheckInTime(timestamp: string | null | undefined): string {
  if (!timestamp) return 'Not checked in'
  const relative = getRelativeTime(timestamp)
  const absolute = formatToIST(timestamp)
  return `${relative} • ${absolute}`
}

/**
 * Format time window for error messages
 * @param allowedFrom ISO timestamp
 * @param allowedTo ISO timestamp
 * @returns Formatted string like "10:30–14:30 IST"
 */
export function formatTimeWindow(allowedFrom: string, allowedTo: string): string {
  const from = dayjs(allowedFrom).tz(INDIA_TIMEZONE).format('HH:mm')
  const to = dayjs(allowedTo).tz(INDIA_TIMEZONE).format('HH:mm')
  return `${from}–${to} IST`
}
