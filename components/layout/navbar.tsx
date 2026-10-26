import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Show } from '@clerk/nextjs'
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
        <Link href="/detect">Live Stages</Link>
        <Link href="/events/fl-2026-brahmaputra">Event Dossier</Link>
      </div>

      {/* Explore the system: routes operators into auth, then the dashboard */}
      <Show when="signed-out">
        <Link className="nav-cta" href="/sign-in">
          Explore the system <ArrowUpRight size={15} />
        </Link>
      </Show>
      <Show when="signed-in">
        <Link className="nav-cta" href="/dashboard">
          Open dashboard <ArrowUpRight size={15} />
        </Link>
      </Show>
    </nav>
  )
}
