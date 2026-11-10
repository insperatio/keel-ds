import ComponentsPage from './demo/ComponentsPage'
import TokensPage from './demo/TokensPage'
import { ToastProvider } from './components/ui/toast'
import { useRoute } from './demo/shell'

export default function App() {
  const { page, section } = useRoute()
  return (
    <ToastProvider>{page === 'components' ? <ComponentsPage section={section} /> : <TokensPage section={section} />}</ToastProvider>
  )
}
