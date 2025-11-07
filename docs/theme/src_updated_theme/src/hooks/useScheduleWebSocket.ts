import { useEffect, useRef, useState } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface ScheduleUpdateEvent {
  matchId: number
  tournamentId: number
  courtId: number | null
  action: 'SCHEDULED' | 'RESCHEDULED' | 'UNSCHEDULED' | 'LOCKED' | 'UNLOCKED'
  scheduledAt: string | null
  timestamp: string
}

interface UseScheduleWebSocketProps {
  tournamentId: number | null
  onUpdate: (event: ScheduleUpdateEvent) => void
  enabled?: boolean
}

/**
 * Custom hook for real-time schedule updates via WebSocket.
 * Connects to /topic/tournaments/{tournamentId}/schedule and receives live updates.
 */
export function useScheduleWebSocket({
  tournamentId,
  onUpdate,
  enabled = true
}: UseScheduleWebSocketProps) {
  const clientRef = useRef<Client | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || !tournamentId) {
      return
    }

    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
    const wsUrl = `${apiBase}/ws`

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: (str) => {
        console.log('[WebSocket]', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log(`[WebSocket] Connected to tournament ${tournamentId}`)
        setConnected(true)
        setError(null)

        // Subscribe to tournament schedule updates
        const subscription = client.subscribe(
          `/topic/tournaments/${tournamentId}/schedule`,
          (message) => {
            try {
              const event: ScheduleUpdateEvent = JSON.parse(message.body)
              console.log('[WebSocket] Received schedule update:', event)
              onUpdate(event)
            } catch (err) {
              console.error('[WebSocket] Failed to parse message:', err)
            }
          }
        )

        console.log(`[WebSocket] Subscribed to /topic/tournaments/${tournamentId}/schedule`)
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message'])
        setError(frame.headers['message'] || 'WebSocket error')
        setConnected(false)
      },
      onWebSocketClose: () => {
        console.log('[WebSocket] Connection closed')
        setConnected(false)
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket error:', event)
        setError('WebSocket connection error')
        setConnected(false)
      }
    })

    client.activate()
    clientRef.current = client

    return () => {
      if (clientRef.current) {
        console.log('[WebSocket] Disconnecting...')
        clientRef.current.deactivate()
        clientRef.current = null
      }
    }
  }, [tournamentId, enabled, onUpdate])

  return { connected, error }
}
