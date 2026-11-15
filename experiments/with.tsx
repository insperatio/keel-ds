import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './with.css'
import WithKeel from './pages/WithKeel'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WithKeel />
  </StrictMode>,
)
