export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap text-center text-sm">
        <p className="m-0">&copy; {new Date().getFullYear()} Phys Play</p>
      </div>
    </footer>
  )
}
