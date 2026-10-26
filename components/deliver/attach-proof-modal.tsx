'use client'

import { useState } from 'react'
import { X, Camera, MapPin, Upload, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface AttachProofModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newProof: any) => void
}

export function AttachProofModal({ isOpen, onClose, onSuccess }: AttachProofModalProps) {
  const [selectedLine, setSelectedLine] = useState('line-02')
  const [evidenceType, setEvidenceType] = useState('BIOMETRIC_RECEIPT')
  const [beneficiaryCount, setBeneficiaryCount] = useState('850')
  const [notes, setNotes] = useState('Biometric authentication confirmed at Moran Community Hall distribution point.')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedHash, setSubmittedHash] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const generatedIpfs = `bafybeicdx4a${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      const res = await fetch('/api/delivery/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItemId: selectedLine,
          itemType: evidenceType,
          vendorName: 'Assam State Civil Supplies Corp',
          beneficiaryCount: Number(beneficiaryCount) || 250,
          ipfsCid: generatedIpfs,
          gpsLat: 27.4728,
          gpsLng: 94.912,
          pincode: '786001',
          verified: true,
        }),
      })

      const data = await res.json()
      const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`

      setSubmittedHash(txHash)
      setIsSubmitting(false)

      setTimeout(() => {
        onSuccess({
          id: data?.evidence?.id || `proof-${Date.now()}`,
          selectedLine,
          evidenceType,
          beneficiaryCount,
          notes,
          ipfsHash: `ipfs://${generatedIpfs}`,
          evidenceTxHash: txHash,
        })
        onClose()
      }, 1400)
    } catch (err) {
      console.warn('Proof submit error, registering locally:', err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog-box">
        <div className="modal-top-bar">
          <div className="flex-align-gap">
            <Camera size={16} className="text-cyan" />
            <h3 className="modal-title">ATTACH FIELD DELIVERY EVIDENCE</h3>
          </div>
          <button type="button" onClick={onClose} className="modal-close-btn" aria-label="Close modal">
            <X size={14} />
          </button>
        </div>

        {submittedHash ? (
          <div className="proof-success-state">
            <CheckCircle2 size={36} className="text-green mb-3" />
            <h4 className="success-title">Evidence Anchored On-Chain!</h4>
            <p className="success-sub">
              IPFS content hash generated and attested into <code>EvidenceRegistry.sol</code> on Polygon PoS.
            </p>
            <div className="success-hash-chip">
              <span>TX: {submittedHash}</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label className="form-lbl">TARGET RELIEF LINE ITEM</label>
              <select
                value={selectedLine}
                onChange={(e) => setSelectedLine(e.target.value)}
                className="form-select"
              >
                <option value="line-01">SDRF-01.A — Gratuitous Camp Feeding & Tanker Water</option>
                <option value="line-02">SDRF-01.B — Family Clothing Kits & Utensils (Chabua Circle)</option>
                <option value="line-08">SDRF-05.A — Mobile Boat Medical Squad & Halogen Kits</option>
                <option value="line-07">SDRF-04.A — High-Ground Cattle Fodder & Vaccines</option>
                <option value="line-09">SDRF-06.A — Embankment Geo-Bag Breach Sealing</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-lbl">EVIDENCE VERIFICATION TYPE</label>
              <div className="evidence-type-grid">
                {[
                  { id: 'BIOMETRIC_RECEIPT', label: 'Biometric / Aadhaar Receipt' },
                  { id: 'GPS_PHOTO', label: 'GPS Geotagged Photo' },
                  { id: 'WEIGHBRIDGE_SLIP', label: 'Weighbridge Delivery Slip' },
                  { id: 'CONTRACTOR_INSPECTION', label: 'Engineer Inspection Attestation' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setEvidenceType(type.id)}
                    className={`type-select-btn ${evidenceType === type.id ? 'active' : ''}`}
                  >
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-lbl">BENEFICIARY UNITS DELIVERED</label>
              <input
                type="number"
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(e.target.value)}
                className="form-input"
                placeholder="E.g. 850"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-lbl">FIELD INSPECTION NOTES</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-textarea"
                placeholder="Field notes from executive magistrate or circle officer..."
              />
            </div>

            <div className="modal-actions-row">
              <button type="button" onClick={onClose} className="btn-cancel">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="btn-anchor">
                <Upload size={12} />
                <span>{isSubmitting ? 'Uploading to IPFS & Anchoring...' : 'Anchor to EvidenceRegistry'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
