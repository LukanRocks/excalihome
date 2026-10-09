import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { initTheme } from '@/lib/theme'
import { AppRoutes } from '@/routes'

initTheme()

const App = () => (
  <StrictMode>
    <AppRoutes />
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
