'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, ShieldCheck, ArrowUpRight } from 'lucide-react'
import { FlashMark } from './flash-mark'

const NAV_ITEMS = [
  { href: '/', label: 'Overview' },
  { href: '/detect', label: '01 Detect', badge: 'Active' },
  { href: '/estimate', label: '02 Estimate', badge: 'Draft' },
  { href: '/disbursals', label: '03 Disbursals', badge: 'Multi-sig' },
  { href: '/grievances', label: '04 Grievances', badge: 'Public' },
]

export function AppHeader() {
  const pathname = usePathname()

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

        {/* Telemetry Status Pill & Emergency Action */}
        <div className="app-header-right">
          <div className="live-telemetry-badge" title="Live sensor feed connected">
            <span className="live-telemetry-dot" />
            <span className="live-telemetry-text">CATCHMENT SENSORS ACTIVE</span>
          </div>

          <Link href="/estimate" className="app-header-cta">
            <span>Proceed to Estimate</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </header>
  )
}
