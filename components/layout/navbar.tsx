import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { FlashMark } from './flash-mark'

export function Navbar() {
  return (
    <nav className="nav-wrap" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="FlashRelief home">
        <FlashMark />
        <span>flash<span>relief</span></span>
      </Link>
      <div className="nav-links">
        <a href="#about">How it works</a>
        <a href="#signal">The signal</a>
        <Link href="/events/fl-2026-brahmaputra">Event Dossier</Link>
      </div>
      <Link className="nav-cta" href="/detect">
        Live Console <ArrowUpRight size={15} />
      </Link>
    </nav>
  )
}
