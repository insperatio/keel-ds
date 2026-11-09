import ComponentsPage from './demo/ComponentsPage'
import TokensPage from './demo/TokensPage'
import { usePage } from './demo/shell'

export default function App() {
  return usePage() === 'components' ? <ComponentsPage /> : <TokensPage />
}
