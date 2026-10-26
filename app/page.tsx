import { HeroSection } from '@/components/hero/hero-section'
import { ProtocolPillars } from '@/components/protocol/protocol-pillars'
import { WorkflowDeck } from '@/components/protocol/workflow-deck'
import { Footer } from '@/components/layout/footer'
import { StackingDeck } from '@/components/scroll/stacking-deck'

export default function Page() {
  return (
    <main className="site-shell">
      <StackingDeck>
        {/* Card 01: Hero & Realtime Early Signal Radar */}
        <section className="deck-card deck-card-1" id="section-hero">
          <HeroSection />
        </section>

        {/* Card 02: Operating Architecture & Civic Loop */}
        <section className="deck-card deck-card-2" id="about">
          <ProtocolPillars />
        </section>

        {/* Card 03: 4-Stage Workflow (Right-Scroll Stacking Cards) */}
        <section className="deck-card deck-card-workflow" id="workflow-section">
          <WorkflowDeck />
        </section>

        {/* Card 04: Verification, Public Accountability & Ledger */}
        <section className="deck-card deck-card-4" id="section-trust">
          <Footer />
        </section>
      </StackingDeck>
    </main>
  )
}
