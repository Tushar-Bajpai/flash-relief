import { HeroSection } from '@/components/hero/hero-section'
import { ProtocolPillars } from '@/components/protocol/protocol-pillars'
import { Footer } from '@/components/layout/footer'

export default function Page() {
  return (
    <main className="site-shell">
      <HeroSection />
      <ProtocolPillars />
      <Footer />
    </main>
  )
}
