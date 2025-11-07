import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment (development)
// This can be used to mock APIs during local development if needed
export const worker = setupWorker(...handlers)
