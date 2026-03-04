import { LocaleProvider } from './locale-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return <LocaleProvider>{children}</LocaleProvider>
}
