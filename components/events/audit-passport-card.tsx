'use client'

import { DisasterEventDossier } from '@/lib/events-data'
import { ShieldCheck, Hash, Key, ExternalLink, CheckCircle2, QrCode, FileText, Lock } from 'lucide-react'

interface AuditPassportCardProps {
  event: DisasterEventDossier
}

export function AuditPassportCard({ event }: AuditPassportCardProps) {
  return (
    <div className="audit-passport-container">
      <div className="passport-inner-card">
        {/* Passport Header Strip */}
        <div className="passport-header-strip">
          <div className="passport-brand-col">
            <div className="flex-align-gap">
              <ShieldCheck size={18} className="text-green" />
              <span className="passport-title-text">FLASHRELIEF // IMMUTABLE PUBLIC AUDIT PASSPORT</span>
            </div>
            <span className="passport-subhead">
              OFFICIAL CIVIC DISASTER LEDGER · STATE OF {event.state.toUpperCase()}
            </span>
          </div>

          <div className="passport-seal-badge">
            <span className="seal-text">VERIFIED & SEALED</span>
            <span className="seal-block">POLYGON #{event.polygonBlockNumber}</span>
          </div>
        </div>

        {/* Passport Body Grid */}
        <div className="passport-body-grid">
          {/* Left Column: Cryptographic Hashes */}
          <div className="passport-hashes-col">
            <h3 className="section-eyebrow">CRYPTOGRAPHIC STATE PROOFS</h3>

            <div className="hash-item-box">
              <span className="hash-item-lbl">EARLY DETECTION STATE FINGERPRINT (SHA-256)</span>
              <div className="hash-mono-val">{event.detectionHash}</div>
              <span className="hash-item-desc">Anchored to DetectionRegistry.sol at flood signal inception</span>
            </div>

            <div className="hash-item-box">
              <span className="hash-item-lbl">POLYGON POS TRANSACTION RECEIPT</span>
              <div className="hash-mono-val">{event.polygonTxHash}</div>
              <div className="hash-foot-links">
                <a
                  href={`https://amoy.polygonscan.com/tx/${event.polygonTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  <span>Inspect on Polygonscan</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="hash-item-box">
              <span className="hash-item-lbl">DECENTRALIZED IPFS EVIDENCE DIRECTORY (CIDv1)</span>
              <div className="hash-mono-val">{event.evidenceCid}</div>
              <div className="hash-foot-links">
                <a
                  href={`https://ipfs.io/ipfs/${event.evidenceCid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hash-link"
                >
                  <span>Browse IPFS Evidence Directory</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Multi-Officer Quorum Endorsement */}
          <div className="passport-officers-col">
            <h3 className="section-eyebrow">CONSTITUTIONAL MULTI-SIG COMMITTEE SIGNERS</h3>

            <div className="officers-signature-list">
              {event.officerSigners.map((officer, oIdx) => (
                <div key={oIdx} className="passport-officer-row">
                  <div className="p-officer-icon">
                    <Key size={13} className="text-cyan" />
                  </div>

                  <div className="p-officer-info">
                    <div className="p-officer-name-row">
                      <span className="p-officer-name">{officer.name}</span>
                      <span className="p-officer-role">{officer.role}</span>
                    </div>

                    <div className="p-officer-key-mono">
                      <span>PUBKEY: {officer.publicKey}</span>
                    </div>

                    <div className="p-officer-signed-stamp">
                      <CheckCircle2 size={10} className="text-green mr-1 inline" />
                      <span>Endorsed: {officer.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Public Trust Guarantee Note */}
            <div className="passport-guarantee-note">
              <Lock size={13} className="text-green flex-shrink-0" />
              <p>
                <strong>Zero Speculative Tokens:</strong> FlashRelief records non-transferable accounting proofs in statutory Indian Rupees (Paise). Any citizen or oversight body can verify these cryptographic signatures independently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
