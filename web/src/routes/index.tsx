import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { Shell } from '@/lib/components/shell'

import Home from '@/pages/Home'
import Board from '@/pages/Board'

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path=':id' element={<Board />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
