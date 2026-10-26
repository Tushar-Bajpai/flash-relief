'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, BarChart2, FileCheck, Users, Truck, MessageSquare, Home, BookOpen } from 'lucide-react'
import { FlashMark } from './flash-mark'

const STAGE_ITEMS = [
  { href: '/detect',   label: 'Detect',     number: '01', icon: Search },
  { href: '/estimate', label: 'Estimate',   number: '02', icon: BarChart2 },
  { href: '/review',   label: 'Review',     number: '03', icon: FileCheck },
  { href: '/release',  label: 'Release',    number: '04', icon: Users },
  { href: '/deliver',  label: 'Deliver',    number: '05', icon: Truck },
  { href: '/report',   label: 'Grievances', number: '06', icon: MessageSquare },
]

const EXTRA_ITEMS = [
  { href: '/',                             label: 'Overview',     icon: Home },
  { href: '/events/fl-2026-brahmaputra',   label: 'Event Dossier', icon: BookOpen },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="app-sidebar" aria-label="Application navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <Link href="/" className="sidebar-brand-link" aria-label="FlashRelief Home">
          <FlashMark />
          <span className="sidebar-brand-text">flash<span>relief</span></span>
        </Link>
      </div>

      {/* Live status */}
      <div className="sidebar-status">
        <span className="sidebar-status-dot" />
        <span className="sidebar-status-label">Sensors active</span>
      </div>

      <div className="sidebar-divider" />

      {/* Stage navigation */}
      <nav aria-label="Lifecycle stages">
        <p className="sidebar-section-label">Lifecycle Stages</p>
        <ul className="sidebar-nav-list">
          {STAGE_ITEMS.map(({ href, label, number, icon: Icon }) => {
            const isActive = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="sidebar-nav-number">{number}</span>
                  <Icon size={14} />
                  <span className="sidebar-nav-label">{label}</span>
                  {isActive && <span className="sidebar-active-bar" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="sidebar-divider" />

      {/* Extra links */}
      <nav aria-label="Additional navigation">
        <ul className="sidebar-nav-list">
          {EXTRA_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href))
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`sidebar-nav-item${isActive ? ' active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={14} />
                  <span className="sidebar-nav-label">{label}</span>
                  {isActive && <span className="sidebar-active-bar" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
