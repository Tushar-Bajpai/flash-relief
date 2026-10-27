'use client'

import React from 'react'
import Link from 'next/link'
import {
  Radio,
  Calculator,
  ShieldCheck,
  Lock,
  Truck,
  MessageSquareWarning,
  Check,
  ChevronRight,
  Coins,
  ArrowRight
} from 'lucide-react'

export interface StageInfo {
  number: number
  key: string
  href: string
  name: string
  role: string
  shortDesc: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export const PROTOCOL_STAGES: StageInfo[] = [
  {
    number: 1,
    key: 'detect',
    href: '/detect',
    name: 'Detect',
    role: 'Hydrologist / EWS',
    shortDesc: 'Satellite radar & river gauges',
    icon: Radio,
  },
  {
    number: 2,
    key: 'estimate',
    href: '/estimate',
    name: 'Estimate',
    role: 'Planning Authority',
    shortDesc: 'Statutory SDRF norm budgeting',
    icon: Calculator,
  },
  {
    number: 3,
    key: 'review',
    href: '/review',
    name: 'Review',
    role: 'DM · NDMA · IDAS',
    shortDesc: '3-of-3 multi-sig consensus',
    icon: ShieldCheck,
  },
  {
    number: 4,
    key: 'release',
    href: '/release',
    name: 'Release',
    role: 'State Treasury',
    shortDesc: 'Departmental escrow vaults',
    icon: Lock,
  },
  {
    number: 5,
    key: 'deliver',
    href: '/deliver',
    name: 'Deliver',
    role: 'Field Logistics',
    shortDesc: 'GPS & IPFS delivery proof',
    icon: Truck,
  },
  {
    number: 6,
    key: 'report',
    href: '/report',
    name: 'Report',
    role: 'Affected Citizens',
    shortDesc: '48h statutory SLA registry',
    icon: MessageSquareWarning,
  },
]

interface ProtocolStepperProps {
  currentStage: number
  fundStatus?: string
  totalBudgetCrores?: number
}

export function ProtocolStepper({
  currentStage,
  fundStatus,
  totalBudgetCrores = 14.82,
}: ProtocolStepperProps) {
  // Determine contextual fund status default based on active stage
  const defaultFundStatus = (() => {
    switch (currentStage) {
      case 1:
        return 'Pre-Approval · River monitoring active'
      case 2:
        return `Formulating SDRF Draft (₹${totalBudgetCrores.toFixed(2)} Cr)`
      case 3:
        return 'Pending 3-of-3 Multi-Sig Quorum'
      case 4:
        return `Locked in 6 Department Escrows on Polygon`
      case 5:
        return 'Tranches Releasing Against Geotagged Proofs'
      case 6:
        return 'Active 48h Citizen Auditing & Resolution'
      default:
        return 'Public Ledger Synchronized'
    }
  })()

  const activeFundStatus = fundStatus || defaultFundStatus

  return (
    <nav
      className="protocol-stepper-container"
      aria-label="Disaster Relief Protocol 6-Stage Pipeline"
    >
      <div className="protocol-stepper-inner">
        {/* Left Stage Tracker Track */}
        <div className="stepper-stages-scroll">
          <ol className="stepper-stages-list">
            {PROTOCOL_STAGES.map((st, idx) => {
              const isPast = st.number < currentStage
              const isCurrent = st.number === currentStage
              const isFuture = st.number > currentStage
              const Icon = st.icon

              return (
                <li key={st.key} className="stepper-stage-item">
                  <Link
                    href={st.href}
                    className={`stepper-node-card ${
                      isCurrent
                        ? 'is-active'
                        : isPast
                        ? 'is-completed'
                        : 'is-upcoming'
                    }`}
                    aria-current={isCurrent ? 'step' : undefined}
                  >
                    {/* Stage Number & Status Indicator */}
                    <div className="stepper-indicator-wrap">
                      <div className="stepper-icon-ring">
                        {isPast ? (
                          <Check size={12} className="stepper-check-icon" />
                        ) : (
                          <Icon size={12} className="stepper-step-icon" />
                        )}
                      </div>
                      <span className="stepper-num">0{st.number}</span>
                    </div>

                    {/* Stage Identity */}
                    <div className="stepper-content-wrap">
                      <div className="stepper-title-row">
                        <span className="stepper-title">{st.name}</span>
                        {isCurrent && (
                          <span className="stepper-active-pill">NOW</span>
                        )}
                        {isPast && (
                          <span className="stepper-verified-pill">DONE</span>
                        )}
                      </div>
                      <span className="stepper-role">{st.role}</span>
                    </div>
                  </Link>

                  {idx < PROTOCOL_STAGES.length - 1 && (
                    <div
                      className={`stepper-connector-line ${
                        st.number < currentStage ? 'is-filled' : ''
                      }`}
                      aria-hidden="true"
                    >
                      <ChevronRight size={12} className="stepper-arrow-icon" />
                    </div>
                  )}
                </li>
              )
            })}
          </ol>
        </div>

        {/* Right Stage Context: Live Escrow & Funds Status */}
        <div className="stepper-fund-tracker">
          <div className="fund-tracker-dot pulse" />
          <div className="fund-tracker-text">
            <span className="fund-tracker-label">Relief Fund State</span>
            <span className="fund-tracker-value">{activeFundStatus}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
