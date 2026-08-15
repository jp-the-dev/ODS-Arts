import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Each test starts from a clean browser: the stores read localStorage on mount,
// so leaked state between tests would produce false passes.
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
