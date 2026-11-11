import ComponentsPage from './demo/ComponentsPage'
import SettingsPage from './demo/SettingsPage'
import TokensPage from './demo/TokensPage'
import { ToastProvider } from './components/ui/toast'
import { useRoute } from './demo/shell'

export default function App() {
  const { page, section } = useRoute()
  return (
    <ToastProvider>
      {page === 'components' ? (
        <ComponentsPage section={section} />
      ) : page === 'example' ? (
        <SettingsPage section={section} />
      ) : (
        <TokensPage section={section} />
      )}
    </ToastProvider>
  )
}
