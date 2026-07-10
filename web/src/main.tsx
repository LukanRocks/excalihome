import './index.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppRoutes } from '@/routes'

const App = () => (
  <StrictMode>
    <AppRoutes />
  </StrictMode>
)

createRoot(document.getElementById('root')!).render(<App />)
