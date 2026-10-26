'use client'

import { useState } from 'react'
import { ReleaseTxDetails, SMART_CONTRACTS } from '@/lib/release-data'
import { Radio, ShieldCheck, CheckCircle2, ExternalLink, Cpu, Copy, ArrowRight, Zap, Hash } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface ChainBroadcastCardProps {
  txDetails: ReleaseTxDetails
  onBroadcastComplete?: () => void
}

export function ChainBroadcastCard({ txDetails, onBroadcastComplete }: ChainBroadcastCardProps) {
  const [broadcastState, setBroadcastState] = useState<'IDLE' | 'BROADCASTING' | 'CONFIRMED'>('CONFIRMED')
  const [copied, setCopied] = useState(false)

  const handleBroadcast = () => {
    setBroadcastState('BROADCASTING')
    setTimeout(() => {
      setBroadcastState('CONFIRMED')
      if (onBroadcastComplete) onBroadcastComplete()
    }, 1200)
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(txDetails.txHash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="broadcast-card">
      <div className="broadcast-header">
        <div className="flex-align-gap">
          <Zap size={16} className="text-cyan" />
          <h3 className="panel-title">ON-CHAIN MULTI-SIG BROADCAST // POLYGON POS LEDGER</h3>
        </div>

        <div className="network-status-tag">
          <span className="live-dot-green" />
          <span>POLYGON POS (CHAIN ID: {txDetails.chainId})</span>
        </div>
      </div>

      {/* Main Broadcast Status Container */}
      <div className="broadcast-status-grid">
        <div className="broadcast-left-telemetry">
          <div className="broadcast-state-pill-row">
            <span className="state-badge green">STATUS: RECORDED ON-CHAIN (CONFIRMED)</span>
            <span className="gas-metric-tag">GAS: {txDetails.gasUsed.split('(')[1].replace(')', '')}</span>
          </div>

          <div className="broadcast-tx-hash-box">
            <div className="tx-lbl-row">
              <span className="mono-subhead">TRANSACTION HASH</span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="copy-hash-btn"
                title="Copy hash to clipboard"
              >
                {copied ? <CheckCircle2 size={11} className="text-green" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <span className="tx-hash-mono">{txDetails.txHash}</span>
          </div>

          <div className="telemetry-compact-grid">
            <div className="t-col">
              <span className="t-lbl">POLYGON BLOCK</span>
              <span className="t-val text-cyan">#{formatNumber(txDetails.blockNumber)}</span>
            </div>

            <div className="t-col">
              <span className="t-lbl">BLOCK TIMESTAMP</span>
              <span className="t-val">{txDetails.blockTimestamp}</span>
            </div>

            <div className="t-col">
              <span className="t-lbl">LEDGER MINT VALUE</span>
              <span className="t-val text-yellow">₹{txDetails.totalAllocatedCrores.toFixed(2)} Cr</span>
            </div>

            <div className="t-col">
              <span className="t-lbl">NON-TRANSFERABLE PAISE</span>
              <span className="t-val text-muted">{txDetails.totalAllocatedPaise}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Cryptographic Merkle State & Quorum Signers */}
        <div className="broadcast-right-proof">
          <span className="proof-box-title">CONSTITUTIONAL SIGNATURES ANCHORED</span>
          <div className="quorum-signers-list">
            {txDetails.approversQuorum.map((approver, idx) => (
              <div key={idx} className="signer-row">
                <ShieldCheck size={13} className="text-green flex-shrink-0" />
                <span className="signer-mono">{approver}</span>
              </div>
            ))}
          </div>

          <div className="merkle-root-box">
            <span className="merkle-lbl">APPROVED BUDGET STATE MERKLE ROOT</span>
            <span className="merkle-mono">{txDetails.stateMerkleRoot}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
