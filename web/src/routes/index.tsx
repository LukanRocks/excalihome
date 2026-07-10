import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { KeyboardShortcuts } from '@/lib/components/keyboard-shortcuts'
import { Shell } from '@/lib/components/shell'
import { getUsername } from '@/lib/username'

import Home from '@/pages/Home'
import Board from '@/pages/Board'
import Settings from '@/pages/Settings'
import Onboarding from '@/pages/Onboarding'

export const AppRoutes = () => {
  const [username, setUsernameState] = useState(getUsername)

  if (!username) return <Onboarding onComplete={setUsernameState} />

  return (
    <BrowserRouter>
      <KeyboardShortcuts />
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Home />} />
          <Route path='settings' element={<Settings />} />
          <Route path=':id' element={<Board />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
