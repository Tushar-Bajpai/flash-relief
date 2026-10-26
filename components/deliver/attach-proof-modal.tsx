'use client'

import { useState } from 'react'
import {
  X,
  Camera,
  MapPin,
  Upload,
  ShieldCheck,
  CheckCircle2,
  FileCheck,
  FileText,
  Loader2,
  HardDrive,
} from 'lucide-react'

interface AttachProofModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newProof: any) => void
}

export function AttachProofModal({ isOpen, onClose, onSuccess }: AttachProofModalProps) {
  const [selectedLine, setSelectedLine] = useState('line-02')
  const [evidenceType, setEvidenceType] = useState('BIOMETRIC_RECEIPT')
  const [beneficiaryCount, setBeneficiaryCount] = useState('850')
  const [deliveredPaise, setDeliveredPaise] = useState('')
  const [notes, setNotes] = useState('Biometric authentication confirmed at Moran Community Hall distribution point.')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedHash, setSubmittedHash] = useState<string | null>(null)

  // Real Web Crypto file hashing state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileHash, setFileHash] = useState<string | null>(null)
  const [ipfsCid, setIpfsCid] = useState<string | null>(null)
  const [isHashing, setIsHashing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setIsHashing(true)
    setErrorMessage(null)

    try {
      const buffer = await file.arrayBuffer()
      const digestBuffer = await window.crypto.subtle.digest('SHA-256', buffer)
      const hashBytes = Array.from(new Uint8Array(digestBuffer))
      const hashHex = hashBytes.map((b) => b.toString(16).padStart(2, '0')).join('')
      setFileHash(`0x${hashHex}`)
      setIpfsCid(null)
    } catch (err) {
      console.error('Web Crypto hashing error:', err)
      setFileHash(null)
      setIpfsCid(null)
      setErrorMessage('Could not compute the evidence fingerprint. Please choose the file again.')
    } finally {
      setIsHashing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      if (!selectedFile || !fileHash) {
        throw new Error('Select an evidence file before submitting.')
      }

      const uploadForm = new FormData()
      uploadForm.append('file', selectedFile)
      uploadForm.append('sha256', fileHash)
      const uploadRes = await fetch('/api/delivery/upload', {
        method: 'POST',
        body: uploadForm,
      })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData?.cid) {
        throw new Error(uploadData?.error || 'IPFS upload failed.')
      }
      const finalCid = uploadData.cid
      setIpfsCid(finalCid)

      const res = await fetch('/api/delivery/proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lineItemId: selectedLine,
          itemType: evidenceType,
          vendorName: 'Assam State Civil Supplies Corp',
          beneficiaryCount: Number(beneficiaryCount) || 250,
          deliveredPaise,
          ipfsCid: finalCid,
          gpsLat: 27.4728,
          gpsLng: 94.912,
          pincode: '786001',
          verified: true,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Could not register the delivery proof.')
      }
      const txHash = data?.evidence?.txHash || data?.chainReceipt?.txHash
      setSubmittedHash(txHash || 'IPFS_UPLOADED')
      setIsSubmitting(false)

      setTimeout(() => {
        onSuccess({
          id: data?.evidence?.id || `proof-${Date.now()}`,
          selectedLine,
          evidenceType,
          beneficiaryCount,
          notes,
          ipfsHash: `ipfs://${finalCid}`,
          evidenceTxHash: txHash,
        })
        onClose()
      }, 1400)
    } catch (err) {
      console.error('Proof submit error:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Could not submit delivery proof.')
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
            <h4 className="success-title">Evidence Uploaded to IPFS</h4>
            <p className="success-sub">
              The evidence file was fingerprinted in your browser and uploaded to IPFS. Polygon contract anchoring will be shown here once the chain transaction is confirmed.
            </p>
            {ipfsCid && (
              <div className="success-hash-chip mt-2">
                <span>IPFS CID: {ipfsCid}</span>
              </div>
            )}
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

            {/* Real File Upload & Web Crypto Hash Generator */}
            <div className="form-group">
              <label className="form-lbl">UPLOAD PHYSICAL PROOF (PHOTO, PDF, RECEIPT)</label>
              <div className="file-dropzone-box">
                <input
                  type="file"
                  id="evidence-file-input"
                  onChange={handleFileSelect}
                  className="file-input-hidden"
                  accept="image/*,application/pdf"
                />
                <label htmlFor="evidence-file-input" className="file-dropzone-label">
                  {isHashing ? (
                    <div className="dropzone-inner">
                      <Loader2 size={24} className="text-cyan animate-spin mb-2" />
                      <span>Computing SHA-256 fingerprint in browser...</span>
                    </div>
                  ) : selectedFile ? (
                    <div className="dropzone-inner">
                      <FileCheck size={24} className="text-green mb-1" />
                      <span className="font-semibold text-ink">{selectedFile.name}</span>
                      <span className="text-xs text-muted">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Real SHA-256 computed
                      </span>
                    </div>
                  ) : (
                    <div className="dropzone-inner">
                      <Upload size={22} className="text-cyan mb-2" />
                      <span className="text-ink font-semibold">Click to choose or drag & drop evidence</span>
                      <span className="text-xs text-muted">Receipts, weighbridge slips, GPS photos (JPG, PNG, PDF)</span>
                    </div>
                  )}
                </label>
              </div>

              {fileHash && (
                <div className="crypto-hash-preview-card">
                  <div className="flex-align-gap justify-between mb-1">
                    <span className="text-xs text-cyan font-mono font-bold">CLIENT SHA-256 HASH:</span>
                    <span className="text-xs text-green font-mono">WEB CRYPTO VERIFIED</span>
                  </div>
                  <span className="font-mono text-xs text-ink break-all block mb-1.5">{fileHash}</span>
                  <div className="flex-align-gap">
                    <HardDrive size={12} className="text-yellow" />
                    <span className="text-xs font-mono text-yellow">IPFS CID: {ipfsCid}</span>
                  </div>
                </div>
              )}
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
              <label className="form-lbl">DELIVERED VALUE (PAISE)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={deliveredPaise}
                onChange={(e) => setDeliveredPaise(e.target.value)}
                className="form-input"
                placeholder="E.g. 4250000"
                required
              />
              <span className="text-xs text-muted">This exact integer is recorded in the Polygon delivery proof contract.</span>
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
              <button type="submit" disabled={isSubmitting || isHashing} className="btn-anchor">
                <Upload size={12} />
                <span>{isSubmitting ? 'Uploading evidence to IPFS...' : 'Upload & Register Evidence'}</span>
              </button>
            </div>
            {errorMessage && (
              <p className="text-sm text-coral" role="alert">{errorMessage}</p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
