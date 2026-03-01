import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <h1 className="text-4xl font-bold text-[var(--sea-ink)]">Phys Play</h1>
      <p className="mt-4 text-[var(--sea-ink-soft)]">
        Interactive physics playground
      </p>
    </main>
  )
}
