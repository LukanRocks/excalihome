import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { SystemBanner } from '@/lib/components/system-banner'
import { initTheme } from '@/lib/theme'
import { AppRoutes } from '@/routes'

initTheme()

const App = () => (
  <StrictMode>
    {/* Vite dev server only; the production build (Docker image) strips it */}
    {import.meta.env.DEV && <SystemBanner size='sm' />}
    <AppRoutes />
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
