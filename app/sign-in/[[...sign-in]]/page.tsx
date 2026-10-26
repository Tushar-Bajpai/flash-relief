import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'
import { FlashMark } from '@/components/layout/flash-mark'
import { clerkAppearance } from '@/lib/clerk-theme'

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <Link href="/" className="auth-brand" aria-label="Return home">
          <FlashMark />
          <span>flash<span>relief</span></span>
        </Link>
        <p className="auth-eyebrow">FlashRelief Command Desk</p>
        <h1 className="auth-title">
          Sign in to <em>run relief</em>.
        </h1>
        <p className="auth-description">
          Detection, allocation and delivery in one accountable civic console.
        </p>
        <SignIn
          appearance={clerkAppearance}
          fallbackRedirectUrl="/detect"
          forceRedirectUrl="/detect"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  )
}
