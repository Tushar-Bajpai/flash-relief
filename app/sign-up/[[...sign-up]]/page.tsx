import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="auth-eyebrow">FlashRelief operations</p>
        <h1 className="auth-title">
          Open your <em>operations</em> seat.
        </h1>
        <p className="auth-description">
          Create an operator account to coordinate flood response end to end.
        </p>
        <SignUp />
      </div>
    </div>
  )
}
