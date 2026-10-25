import { ArrowUpRight } from 'lucide-react'
import { FlashMark } from './flash-mark'

export function Navbar() {
  return (
    <nav className="nav-wrap" aria-label="Main navigation">
      <a className="brand" href="#top" aria-label="FlashRelief home">
        <FlashMark />
        <span>flash<span>relief</span></span>
      </a>
      <div className="nav-links">
        <a href="#about">How it works</a>
        <a href="#signal">The signal</a>
      </div>
      <a className="nav-cta" href="#about">
        Explore the system <ArrowUpRight size={15} />
      </a>
    </nav>
  )
}
