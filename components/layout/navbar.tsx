import { ArrowUpRight } from 'lucide-react'
import { Show } from '@clerk/nextjs'
import { FlashMark } from './flash-mark'

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

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

      {/* Explore the system: routes operators into auth, then the dashboard */}
      {hasClerkKey ? (
        <>
          <Show when="signed-out">
            <a className="nav-cta" href="/sign-in">
              Explore the system <ArrowUpRight size={15} />
            </a>
          </Show>
          <Show when="signed-in">
            <a className="nav-cta" href="/dashboard">
              Open dashboard <ArrowUpRight size={15} />
            </a>
          </Show>
        </>
      ) : (
        <a className="nav-cta" href="#about">
          Explore the system <ArrowUpRight size={15} />
        </a>
      )}
    </nav>
  )
}
