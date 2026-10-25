import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { FlashMark } from './flash-mark'

export function Footer() {
  return (
    <div className="closing-section">
      <div className="closing-body">
        <div className="closing-stamp">
          <ShieldCheck size={19} />
          <span>Human-led<br />by design</span>
        </div>
        <div className="closing-copy">
          <p className="eyebrow">A better emergency response</p>
          <h2>
            Prepare early.<br />
            <em>Prove everything.</em>
          </h2>
        </div>
        <div className="closing-side">
          <p>
            FlashRelief gives the people responsible for relief a shared picture of what&apos;s coming — and gives the people it serves a way to verify what happened.
          </p>
          <a className="primary-action dark-action" href="#top">
            Start a conversation <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <footer>
        <a className="brand footer-brand" href="#top">
          <FlashMark />
          <span>flash<span>relief</span></span>
        </a>
        <span>AI-assisted. Human-approved. Publicly accountable.</span>
        <span>© 2026 FlashRelief</span>
      </footer>
    </div>
  )
}
