'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { FlashMark } from './flash-mark'

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/detect', label: '01 Detect' },
  { href: '/estimate', label: '02 Estimate' },
  { href: '/review', label: '03 Review' },
  { href: '/release', label: '04 Release' },
  { href: '/deliver', label: '05 Deliver' },
  { href: '/report', label: '06 Grievances' },
  { href: '/events/fl-2026-brahmaputra', label: 'Event Dossier' },
]

export function AppHeader() {
  const pathname = usePathname()

  // Dynamic next stage computation
  let nextStage = { href: '/detect', label: '01 Detect' }
  if (pathname.startsWith('/detect')) {
    nextStage = { href: '/estimate', label: '02 Estimate' }
  } else if (pathname.startsWith('/estimate')) {
    nextStage = { href: '/review', label: '03 Review' }
  } else if (pathname.startsWith('/review')) {
    nextStage = { href: '/release', label: '04 Release' }
  } else if (pathname.startsWith('/release')) {
    nextStage = { href: '/deliver', label: '05 Deliver' }
  } else if (pathname.startsWith('/deliver')) {
    nextStage = { href: '/report', label: '06 Grievances' }
  } else if (pathname.startsWith('/report')) {
    nextStage = { href: '/events/fl-2026-brahmaputra', label: 'Event Dossier' }
  } else if (pathname.startsWith('/events')) {
    nextStage = { href: '/detect', label: '01 Detect' }
  }

  return (
    <header className="app-header-wrap" role="banner">
      <div className="app-header-inner">
        {/* Brand Mark */}
        <Link href="/" className="brand" aria-label="FlashRelief Home">
          <FlashMark />
          <span>flash<span>relief</span></span>
        </Link>

        {/* Civic Lifecycle Navigation */}
        <nav className="app-nav-links" aria-label="Application navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`app-nav-item ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{item.label}</span>
                {isActive && <span className="nav-active-pip" />}
              </Link>
            )
          })}
        </nav>

        {/* Telemetry Status Pill & Dynamic Next Stage Action */}
        <div className="app-header-right">
          <div className="live-telemetry-badge" title="Live sensor feed connected">
            <span className="live-telemetry-dot" />
            <span className="live-telemetry-text">CATCHMENT SENSORS ACTIVE</span>
          </div>

          <Link href={nextStage.href} className="app-header-cta">
            <span>Next: {nextStage.label}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  )
}
