import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Shell } from '@/lib/components/shell'

import Home from '@/pages/Home'
import Board from '@/pages/Board'
import Settings from '@/pages/Settings'

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path='settings' element={<Settings />} />
        <Route path=':id' element={<Board />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
