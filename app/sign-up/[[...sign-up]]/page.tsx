import { SignUp } from '@clerk/nextjs'
import Link from 'next/link'
import { FlashMark } from '@/components/layout/flash-mark'
import { clerkAppearance } from '@/lib/clerk-theme'

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <Link href="/" className="auth-brand" aria-label="Return home">
          <FlashMark />
          <span>flash<span>relief</span></span>
        </Link>
        <p className="auth-eyebrow">FlashRelief Operations Seat</p>
        <h1 className="auth-title">
          Open your <em>operations</em> seat.
        </h1>
        <p className="auth-description">
          Create an operator account to coordinate early flood intelligence and multi-sig disbursal.
        </p>
        <SignUp
          appearance={clerkAppearance}
          fallbackRedirectUrl="/detect"
          forceRedirectUrl="/detect"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  )
}
