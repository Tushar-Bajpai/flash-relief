import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Show, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { FlashMark } from './flash-mark'

export function Navbar() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

  return (
    <nav className="nav-wrap" aria-label="Main navigation">
      <Link className="brand" href="/" aria-label="FlashRelief home">
        <FlashMark />
        <span>flash<span>relief</span></span>
      </Link>
      <div className="nav-links">
        {hasClerk ? (
          <Show when="signed-in">
            <Link href="/detect">Live Stages</Link>
            <Link href="/ledger">Public Notebook</Link>
            <Link href="/events/fl-2026-brahmaputra">Event Dossier</Link>
          </Show>
        ) : null}
      </div>

      <div className="nav-right-actions">
        {hasClerk ? (
          <>
            <Show when="signed-out">
              <SignInButton mode="modal" fallbackRedirectUrl="/detect" forceRedirectUrl="/detect">
                <button type="button" className="nav-auth-link">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal" fallbackRedirectUrl="/detect" forceRedirectUrl="/detect">
                <button type="button" className="nav-cta">
                  Sign up <ArrowUpRight size={15} />
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link className="nav-auth-link" href="/dashboard">
                Operations
              </Link>
              <UserButton />
            </Show>
          </>
        ) : (
          <>
            <Link className="nav-auth-link" href="/sign-in">
              Sign in
            </Link>
            <Link className="nav-cta" href="/sign-up">
              Sign up <ArrowUpRight size={15} />
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
