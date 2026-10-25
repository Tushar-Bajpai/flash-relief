import { ArrowUpRight } from 'lucide-react'
import { PILLARS } from '@/lib/data'

export function ProtocolPillars() {
  return (
    <div className="about-section" id="about">
      <div className="section-heading">
        <p className="eyebrow">What it&apos;s about</p>
        <h2>
          One clear loop<br />
          <em>from risk to relief.</em>
        </h2>
        <p className="heading-note">
          A civic operating layer for faster decisions and a more visible response.
        </p>
      </div>
      <div className="pillars-grid">
        {PILLARS.map((pillar) => (
          <article className={`pillar-card ${pillar.accent}`} key={pillar.number}>
            <span className="pillar-number">{pillar.number}</span>
            <h3>{pillar.title}</h3>
            <p>{pillar.text}</p>
            <span className="pillar-arrow">
              <ArrowUpRight size={17} />
            </span>
          </article>
        ))}
      </div>
    </div>
  )
}
