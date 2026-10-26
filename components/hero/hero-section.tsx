import Link from 'next/link'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { ReliefOrb } from '@/components/hero/relief-orb'

export function HeroSection() {
  return (
    <div className="hero-section" id="top">
      <Navbar />

      <div className="hero-content">
        <div className="hero-copy">
          <p className="eyebrow">Flood intelligence for the moments that matter</p>
          <h1>
            Move relief<br />
            <em>before</em> the<br />
            news.
          </h1>
          <p className="hero-description">
            FlashRelief turns early flood signals into accountable action — helping communities detect risk, plan relief and see where every decision lands.
          </p>
          <div className="hero-actions">
            <Link className="primary-action" href="/detect">
              Launch Live Console <ArrowUpRight size={16} />
            </Link>
            <a className="text-action" href="#about">
              See how it works <ChevronDown size={15} />
            </a>
          </div>
        </div>

        <ReliefOrb />
      </div>

      <div className="hero-footer">
        <span>Built for public trust</span>
        <span className="footer-line" />
        <span>Forecast-first / satellite-confirmed</span>
      </div>
    </div>
  )
}
