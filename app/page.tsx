import { HeroSection } from '@/components/hero/hero-section'
import { ProtocolPillars } from '@/components/protocol/protocol-pillars'
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
          <div className="card-top-handle">
            <div className="card-sheet-tab">
              <span className="card-tab-dot cyan-dot" />
              <span className="card-tab-index">02 / 03</span>
              <span className="card-tab-label">Operating Architecture</span>
            </div>
            <div className="card-stamp-indicator">
              <span>Civic Loop Layer</span>
            </div>
          </div>
          <ProtocolPillars />
        </section>

        {/* Card 03: Verification, Public Accountability & Ledger */}
        <section className="deck-card deck-card-3" id="section-trust">
          <div className="card-top-handle light-handle">
            <div className="card-sheet-tab light-sheet-tab">
              <span className="card-tab-dot coral-dot" />
              <span className="card-tab-index light-index">03 / 03</span>
              <span className="card-tab-label light-label">Public Trust & Ledger</span>
            </div>
            <div className="card-stamp-indicator light-stamp">
              <span>Auditable Proof</span>
            </div>
          </div>
          <Footer />
        </section>
      </StackingDeck>
    </main>
  )
}
