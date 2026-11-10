import ComponentsPage from './demo/ComponentsPage'
import TokensPage from './demo/TokensPage'
import { ToastProvider } from './components/ui/toast'
import { usePage } from './demo/shell'

export default function App() {
  const page = usePage()
  return <ToastProvider>{page === 'components' ? <ComponentsPage /> : <TokensPage />}</ToastProvider>
}
