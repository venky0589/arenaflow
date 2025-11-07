import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

interface CheckInEvent {
  registrationId: number
  tournamentId: number
  playerId: number
  playerName: string
  checkedIn: boolean
  checkedInAt: string | null
  checkedInBy: string | null
  eventType: 'CHECK_IN' | 'UNDO_CHECK_IN' | 'BATCH_CHECK_IN'
}

/**
 * WebSocket hook for real-time check-in updates.
 * Connects to /ws endpoint and subscribes to /topic/check-ins.
 *
 * @param onCheckInEvent Callback fired when check-in event is received
 * @param enabled Whether to enable WebSocket connection (default: true)
 */
export function useWebSocket(
  onCheckInEvent: (event: CheckInEvent) => void,
  enabled: boolean = true
) {
  const clientRef = useRef<Client | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Create STOMP client with SockJS
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log('[WebSocket Debug]', str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      console.log('[WebSocket] Connected')

      // Subscribe to check-in events
      client.subscribe('/topic/check-ins', (message) => {
        try {
          const event: CheckInEvent = JSON.parse(message.body)
          console.log('[WebSocket] Received check-in event:', event)
          onCheckInEvent(event)
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error)
        }
      })
    }

    client.onStompError = (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message'])
      console.error('[WebSocket] Details:', frame.body)
    }

    client.onWebSocketError = (event) => {
      console.error('[WebSocket] WebSocket error:', event)
    }

    client.onDisconnect = () => {
      console.log('[WebSocket] Disconnected')
    }

    // Activate connection
    client.activate()
    clientRef.current = client

    // Cleanup on unmount
    return () => {
      console.log('[WebSocket] Deactivating connection')
      client.deactivate()
    }
  }, [enabled, onCheckInEvent])

  return clientRef.current
}
