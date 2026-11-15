import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './without.css'
import WithoutKeel from './pages/WithoutKeel'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WithoutKeel />
  </StrictMode>,
)
