'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText } from 'lucide-react'
import { UserButton, SignInButton } from '@clerk/nextjs'
import { FlashMark } from './flash-mark'

interface StageNavItem {
  href: string
  step: string
  name: string
  shortTitle: string
}

const STAGES: StageNavItem[] = [
  { href: '/detect', step: '01', name: 'Detect', shortTitle: 'Detect Radar' },
  { href: '/estimate', step: '02', name: 'Estimate', shortTitle: 'SDRF Estimate' },
  { href: '/review', step: '03', name: 'Review', shortTitle: 'Officer Review' },
  { href: '/release', step: '04', name: 'Release', shortTitle: 'On-Chain Release' },
  { href: '/deliver', step: '05', name: 'Deliver', shortTitle: 'Field Proofs' },
  { href: '/report', step: '06', name: 'Grievances', shortTitle: 'Public Ledger' },
]

export function AppHeader() {
  const pathname = usePathname()
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  const isDossierActive = pathname.startsWith('/events')

  return (
    <header className="app-header-wrap" role="banner">
      <div className="app-header-inner">
        {/* Left: Brand Identity & Home Link */}
        <div className="app-header-left">
          <Link href="/" className="app-brand-lockup" aria-label="FlashRelief Home">
            <FlashMark />
            <span className="app-brand-text">
              flash<span>relief</span>
            </span>
          </Link>

          <span className="app-brand-divider" aria-hidden="true" />

          <Link
            href="/"
            className={`header-overview-link ${pathname === '/' ? 'active' : ''}`}
          >
            Overview
          </Link>
        </div>

        {/* Center: Segmented Civic Pipeline Runner */}
        <nav className="stage-pipeline-runner" aria-label="Disaster response stages">
          <div className="pipeline-track">
            {STAGES.map((stage) => {
              const isActive = pathname.startsWith(stage.href)
              return (
                <Link
                  key={stage.href}
                  href={stage.href}
                  className={`pipeline-stage-pill ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  <span className="pill-step-num">{stage.step}</span>
                  <span className="pill-step-name">{stage.name}</span>
                </Link>
              )
            })}

            <span className="pipeline-track-divider" aria-hidden="true" />

            <Link
              href="/ledger"
              className={`pipeline-stage-pill dossier-pill ${pathname.startsWith('/ledger') ? 'active' : ''}`}
              aria-current={pathname.startsWith('/ledger') ? 'page' : undefined}
            >
              <FileText size={11} className="dossier-icon text-cyan" />
              <span className="pill-step-name">Notebook</span>
            </Link>

            <Link
              href="/events/fl-2026-brahmaputra"
              className={`pipeline-stage-pill dossier-pill ${isDossierActive ? 'active' : ''}`}
              aria-current={isDossierActive ? 'page' : undefined}
            >
              <FileText size={11} className="dossier-icon" />
              <span className="pill-step-name">Dossier</span>
            </Link>
          </div>
        </nav>

        {/* Right: Sensor Telemetry & Profile */}
        <div className="app-header-right">
          <div className="live-telemetry-badge" title="Basin sensors active">
            <span className="live-telemetry-dot" />
            <span className="live-telemetry-text">CATCHMENT SENSORS ACTIVE</span>
          </div>

          {hasClerk ? (
            <div className="app-header-profile">
              <UserButton />
            </div>
          ) : (
            <SignInButton mode="modal" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard">
              <button type="button" className="nav-auth-link">
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
