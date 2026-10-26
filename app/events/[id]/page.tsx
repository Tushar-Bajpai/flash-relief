import { getDisasterEventById, ALL_DISASTER_EVENTS } from '@/lib/events-data'
import { AppHeader } from '@/components/layout/app-header'
import { EventHeroBanner } from '@/components/events/event-hero-banner'
import { EventTimeline } from '@/components/events/event-timeline'
import { SankeyMoneyFlow } from '@/components/events/sankey-money-flow'
import { AuditPassportCard } from '@/components/events/audit-passport-card'
import { ArrowLeft, ArrowRight, ShieldCheck, MapPin, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'

export function generateStaticParams() {
  return ALL_DISASTER_EVENTS.map((event) => ({
    id: event.id,
  }))
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const event = getDisasterEventById(id)

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Event Quick Breadcrumb */}
        <div className="event-breadcrumb-strip">
          <Link href="/report" className="breadcrumb-back-link">
            <ArrowLeft size={13} />
            <span>Back to Public Ledger</span>
          </Link>

          <div className="event-switcher-pills">
            <span className="switcher-lbl">SWITCH FLOOD EVENT:</span>
            {ALL_DISASTER_EVENTS.map((ev) => {
              const isCurrent = ev.id === event.id
              return (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className={`event-switch-btn ${isCurrent ? 'active' : ''}`}
                >
                  <span>{ev.name.split(' ')[0]}</span>
                  <span className="ev-state-pill">{ev.state}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Section 1: Event Hero & Core Telemetry Banner */}
        <EventHeroBanner event={event} />

        {/* Section 2: Chronological Disaster Lifecycle Timeline (00:00 to +36h) */}
        <section className="event-section">
          <EventTimeline milestones={event.milestones} />
        </section>

        {/* Section 3: Multi-Tier Money Flow (Treasury -> Departments -> Circles -> Citizens) */}
        <section className="event-section">
          <SankeyMoneyFlow
            nodes={event.moneyFlow.nodes}
            links={event.moneyFlow.links}
            totalAllocatedCrores={event.totalAllocatedCrores}
          />
        </section>

        {/* Section 4: Public Audit Passport & Merkle Cryptographic Proofs */}
        <section className="event-section">
          <AuditPassportCard event={event} />
        </section>

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">FLASHRELIEF ECOSYSTEM</span>
              <h2 className="handoff-title">Inspect Individual Disaster Stages</h2>
              <p className="handoff-desc">
                Dive deep into any stage of the FlashRelief pipeline to test interactive parameters, multi-basin gauge telemetry, official SDRF calculators, officer review signatures, and field delivery evidence.
              </p>
            </div>

            <div className="handoff-actions-row">
              <Link href="/detect" className="secondary-action">
                <span>01 Detect Radar</span>
              </Link>
              <Link href="/estimate" className="secondary-action">
                <span>02 Estimate SDRF</span>
              </Link>
              <Link href="/review" className="secondary-action">
                <span>03 Officer Review</span>
              </Link>
              <Link href="/release" className="secondary-action">
                <span>04 On-Chain Release</span>
              </Link>
              <Link href="/deliver" className="secondary-action">
                <span>05 Delivery Proofs</span>
              </Link>
              <Link href="/report" className="primary-action">
                <span>06 Grievances</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
