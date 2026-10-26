import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="auth-eyebrow">FlashRelief operations</p>
        <h1 className="auth-title">
          Sign in to <em>run relief</em>.
        </h1>
        <p className="auth-description">
          Detection, allocation and delivery in one accountable console.
        </p>
        <SignIn />
      </div>
    </div>
  )
}
