import { create } from 'zustand'

type NotificationSeverity = 'success' | 'error' | 'info' | 'warning'

interface NotificationState {
  open: boolean
  message: string
  severity: NotificationSeverity
  showSuccess: (message: string) => void
  showError: (message: string) => void
  showInfo: (message: string) => void
  showWarning: (message: string) => void
  clearNotification: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  open: false,
  message: '',
  severity: 'info',

  showSuccess: (message: string) => set({ open: true, message, severity: 'success' }),
  showError: (message: string) => set({ open: true, message, severity: 'error' }),
  showInfo: (message: string) => set({ open: true, message, severity: 'info' }),
  showWarning: (message: string) => set({ open: true, message, severity: 'warning' }),
  clearNotification: () => set({ open: false }),
}))
