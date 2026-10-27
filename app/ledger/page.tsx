'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import {
  POLYGON_NOTEBOOK_CONFIG,
  NOTEBOOK_ENTRIES_LEDGER,
  PublicNotebookEntry,
  hashPayload,
} from '@/lib/blockchain/public-notebook'
import {
  ShieldCheck,
  Cpu,
  FileCheck2,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  FileSpreadsheet,
  Building2,
  Camera,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Database,
  Lock,
} from 'lucide-react'
import Link from 'next/link'

import { formatNumber } from '@/lib/format'
export default function PublicLedgerPage() {
  const [selectedPageFilter, setSelectedPageFilter] = useState<number | 'ALL'>('ALL')
  const [searchHash, setSearchHash] = useState('')
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [verifyResult, setVerifyResult] = useState<{
    found: boolean
    entry?: PublicNotebookEntry
  } | null>(null)

  const filteredEntries = NOTEBOOK_ENTRIES_LEDGER.filter((entry) => {
    if (selectedPageFilter === 'ALL') return true
    return entry.page === selectedPageFilter
  })

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(text)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchHash.trim()) return

    const normalized = searchHash.trim().toLowerCase()
    const match = NOTEBOOK_ENTRIES_LEDGER.find(
      (entry) =>
        entry.txHash.toLowerCase().includes(normalized) ||
        entry.eventId.toLowerCase().includes(normalized) ||
        entry.contractAddress.toLowerCase().includes(normalized)
    )

    if (match) {
      setVerifyResult({ found: true, entry: match })
    } else {
      setVerifyResult({ found: false })
    }
  }

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Hero Section */}
        <section className="ledger-hero-banner">
          <div className="ledger-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge cyan">POLYGON PoS · IMMUTABLE NOTARIZATION NOTEBOOK</span>
              <span className="live-cadence-pill cyan">
                <Cpu size={11} className="mr-1 inline text-cyan" />
                <span>BLOCK #19,488,110 · 2.1s FINALITY · &lt;$0.005 TX COST</span>
              </span>
            </div>

            <h1 className="ledger-hero-title">
              The Public Notebook &<br />
              <em>Civic Ledger Explorer</em>
            </h1>

            <p className="ledger-hero-desc">
              FlashRelief uses the Polygon PoS blockchain purely as a tamper-proof civic notary. We store cryptographic fingerprints—never raw personal data or volatile tokens. Once stamped, detection timestamps, multi-officer SDRF approvals, departmental fund locks, and citizen grievance countdowns cannot be edited, backdated, or deleted.
            </p>

            <div className="ledger-principles-row">
              <span className="principle-pill">
                <CheckCircle2 size={12} className="text-green" />
                <span>Fingerprints Only (SHA-256)</span>
              </span>
              <span className="principle-pill">
                <CheckCircle2 size={12} className="text-green" />
                <span>Zero Tokens or Speculation</span>
              </span>
              <span className="principle-pill">
                <CheckCircle2 size={12} className="text-green" />
                <span>Zero Citizen Wallet Friction</span>
              </span>
              <span className="principle-pill">
                <CheckCircle2 size={12} className="text-green" />
                <span>100% Publicly Auditable</span>
              </span>
            </div>
          </div>

          <div className="ledger-hero-stats">
            <div className="hero-stat-card primary-ledger">
              <span className="stat-eyebrow">TOTAL AUDITED RELIEF</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">₹7.35</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">100% locked to approved MHA SDRF line items</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">THE THIRD NUMBER (LEAKAGE)</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-green">0.00%</span>
                <span className="stat-unit">leakage</span>
              </div>
              <span className="stat-subtext">₹3.65 Cr disbursed = ₹3.65 Cr mathematically proven</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">DETECTION LEAD-TIME GUARANTEE</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-coral">+11.4h</span>
              </div>
              <span className="stat-subtext">Stamped on-chain before mainstream news media</span>
            </div>
          </div>
        </section>

        {/* Cryptographic Verifier Bar */}
        <section className="ledger-section">
          <div className="hash-verifier-box">
            <div className="verifier-top">
              <div className="flex-align-gap">
                <Search size={16} className="text-cyan" />
                <h3 className="panel-title">INDEPENDENT CAG AUDIT & CRYPTOGRAPHIC VERIFIER</h3>
              </div>
              <span className="verifier-caption">
                Enter any Polygon Tx Hash, Event ID, or Contract Address to audit cryptographic integrity
              </span>
            </div>

            <form onSubmit={handleVerify} className="verifier-form">
              <div className="verifier-input-wrap">
                <input
                  type="text"
                  value={searchHash}
                  onChange={(e) => setSearchHash(e.target.value)}
                  placeholder="Paste Tx Hash (e.g., 0x7a29e1c4...), eventId (fl-2026-brahmaputra), or contract address..."
                  className="verifier-input"
                />
                <button type="submit" className="verifier-submit-btn">
                  <ShieldCheck size={14} />
                  <span>Verify Fingerprint</span>
                </button>
              </div>
            </form>

            {/* Verification Result Display */}
            {verifyResult && (
              <div className={`verification-badge-card ${verifyResult.found ? 'valid' : 'invalid'}`}>
                {verifyResult.found && verifyResult.entry ? (
                  <div className="verify-success-content">
                    <div className="flex-align-gap mb-2">
                      <CheckCircle2 size={18} className="text-green" />
                      <span className="verify-status-title">CRYPTOGRAPHIC INTEGRITY CONFIRMED // MATHEMATICALLY TAMPER-PROOF</span>
                    </div>
                    <p className="verify-proof-text">
                      <strong>{verifyResult.entry.pageName}:</strong> {verifyResult.entry.publicAuditProof}
                    </p>
                    <div className="verify-meta-grid">
                      <div>
                        <span className="v-lbl">CONTRACT:</span>
                        <span className="v-val">{verifyResult.entry.contractName}</span>
                      </div>
                      <div>
                        <span className="v-lbl">POLYGON BLOCK:</span>
                        <span className="v-val">#{formatNumber(verifyResult.entry.blockNumber)}</span>
                      </div>
                      <div>
                        <span className="v-lbl">TIMESTAMP:</span>
                        <span className="v-val">{verifyResult.entry.timestamp}</span>
                      </div>
                      <div>
                        <span className="v-lbl">EXPLORER:</span>
                        <a
                          href={`https://polygonscan.com/tx/${verifyResult.entry.txHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="v-link"
                        >
                          View on PolygonScan <ExternalLink size={11} className="inline" />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="verify-failure-content">
                    <AlertCircle size={18} className="text-coral" />
                    <span>No matching record found on the FlashRelief Public Notebook registry for this query.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5 Pages Filter Navigation */}
        <section className="ledger-section">
          <div className="notebook-pages-header">
            <h2 className="section-title">THE 5 SMART CONTRACT PAGES</h2>
            <span className="section-subtitle">
              Click any page below to filter immutable transactions
            </span>
          </div>

          <div className="pages-filter-grid">
            <button
              type="button"
              onClick={() => setSelectedPageFilter('ALL')}
              className={`page-tab-card ${selectedPageFilter === 'ALL' ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge">ALL PAGES</span>
                <span className="ptab-count">{NOTEBOOK_ENTRIES_LEDGER.length} Records</span>
              </div>
              <h3 className="ptab-name">Complete Civic Notebook</h3>
              <p className="ptab-desc">All notarizations across detection, budget, escrow, delivery & grievances.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageFilter(1)}
              className={`page-tab-card ${selectedPageFilter === 1 ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge page1">PAGE 1</span>
                <span className="ptab-chip">DetectionRegistry.sol</span>
              </div>
              <h3 className="ptab-name">Early Detection</h3>
              <p className="ptab-desc">Proves alert timestamp 11.4h before news media broadcasts.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageFilter(2)}
              className={`page-tab-card ${selectedPageFilter === 2 ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge page2">PAGE 2</span>
                <span className="ptab-chip">BudgetQuorum.sol</span>
              </div>
              <h3 className="ptab-name">Budget Quorum</h3>
              <p className="ptab-desc">3-of-3 ECDSA multi-sig consensus over deterministic SDRF drafts.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageFilter(3)}
              className={`page-tab-card ${selectedPageFilter === 3 ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge page3">PAGE 3</span>
                <span className="ptab-chip">FundEscrowLedger.sol</span>
              </div>
              <h3 className="ptab-name">Fund Escrow</h3>
              <p className="ptab-desc">Programmatic department locks prevent fund diversion to other accounts.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageFilter(4)}
              className={`page-tab-card ${selectedPageFilter === 4 ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge page4">PAGE 4</span>
                <span className="ptab-chip">DeliveryEvidence.sol</span>
              </div>
              <h3 className="ptab-name">Delivery Evidence</h3>
              <p className="ptab-desc">The Third Number audit: GPS geotags & IPFS delivery receipts.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPageFilter(5)}
              className={`page-tab-card ${selectedPageFilter === 5 ? 'active' : ''}`}
            >
              <div className="ptab-top">
                <span className="ptab-badge page5">PAGE 5</span>
                <span className="ptab-chip">GrievanceSLA.sol</span>
              </div>
              <h3 className="ptab-name">Grievance SLA</h3>
              <p className="ptab-desc">Statutory 48-hour response countdown clock. Cannot be paused or deleted.</p>
            </button>
          </div>
        </section>

        {/* Ledger Entries Stream */}
        <section className="ledger-section">
          <div className="entries-stream-header">
            <div className="flex-align-gap">
              <Database size={16} className="text-cyan" />
              <h3 className="panel-title">IMMUTABLE BLOCKCHAIN TRANSACTIONS FEED</h3>
            </div>
            <span className="entries-count-chip">
              SHOWING {filteredEntries.length} OF {NOTEBOOK_ENTRIES_LEDGER.length} NOTARIZED RECORDS
            </span>
          </div>

          <div className="ledger-entries-list">
            {filteredEntries.map((entry, idx) => (
              <div key={idx} className="ledger-entry-card">
                <div className="lcard-header">
                  <div className="lcard-page-meta">
                    <span className={`page-indicator-pill p${entry.page}`}>
                      PAGE {entry.page}
                    </span>
                    <span className="lcard-contract-name">{entry.contractName}</span>
                    <span className="lcard-action-chip">{entry.action}</span>
                  </div>

                  <div className="lcard-block-meta">
                    <span className="block-number">BLOCK #{formatNumber(entry.blockNumber)}</span>
                    <span className="timestamp-text">{entry.timestamp}</span>
                  </div>
                </div>

                <div className="lcard-proof-banner">
                  <ShieldCheck size={14} className="text-green shrink-0 mt-0.5" />
                  <p className="lcard-proof-msg">
                    <strong>Statutory Audit Guarantee:</strong> {entry.publicAuditProof}
                  </p>
                </div>

                {/* Data Payload Highlights */}
                <div className="lcard-payload-box">
                  <span className="payload-title">ON-CHAIN ATTESTED PAYLOAD:</span>
                  <div className="payload-key-values">
                    {Object.entries(entry.dataPayload).map(([key, value]) => {
                      if (typeof value === 'object' && value !== null) {
                        return (
                          <div key={key} className="payload-row complex">
                            <span className="pkey">{key}:</span>
                            <span className="pval code">{JSON.stringify(value)}</span>
                          </div>
                        )
                      }
                      return (
                        <div key={key} className="payload-row">
                          <span className="pkey">{key}:</span>
                          <span className="pval">{String(value)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Card Footer with Hashes & External Link */}
                <div className="lcard-footer">
                  <div className="hash-group">
                    <span className="hash-label">POLYGON TX HASH:</span>
                    <span className="hash-mono">{entry.txHash}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(entry.txHash)}
                      className="copy-btn"
                      title="Copy transaction hash"
                    >
                      {copiedHash === entry.txHash ? (
                        <Check size={12} className="text-green" />
                      ) : (
                        <Copy size={12} />
                      )}
                    </button>
                  </div>

                  <div className="contract-address-group">
                    <span className="hash-label">CONTRACT:</span>
                    <span className="hash-mono">{entry.contractAddress.slice(0, 10)}...{entry.contractAddress.slice(-6)}</span>
                  </div>

                  <a
                    href={`https://polygonscan.com/tx/${entry.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="polygonscan-link-btn"
                  >
                    <span>View on PolygonScan</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Smart Contracts Directory Table */}
        <section className="ledger-section">
          <div className="contracts-table-card">
            <div className="contracts-table-header">
              <div className="flex-align-gap">
                <Lock size={16} className="text-cyan" />
                <h3 className="panel-title">VERIFIED SMART CONTRACTS DIRECTORY // POLYGON POS</h3>
              </div>
              <span className="solidity-version-tag">SOLC 0.8.24 · ZERO PROXY DIVERSION</span>
            </div>

            <div className="contracts-table-wrapper">
              <table className="contracts-table">
                <thead>
                  <tr>
                    <th>Page #</th>
                    <th>Contract Name</th>
                    <th>Polygon Address</th>
                    <th>Cadre / Authority</th>
                    <th>Core Civic Guarantee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="page-indicator-pill p1">1</span></td>
                    <td className="contract-name-cell">DetectionRegistry.sol</td>
                    <td className="mono-addr">{POLYGON_NOTEBOOK_CONFIG.contracts.page1Detection.address}</td>
                    <td>Sensor Oracle</td>
                    <td>Lead-time timestamped 11.4h before news media</td>
                  </tr>
                  <tr>
                    <td><span className="page-indicator-pill p2">2</span></td>
                    <td className="contract-name-cell">BudgetQuorum.sol</td>
                    <td className="mono-addr">{POLYGON_NOTEBOOK_CONFIG.contracts.page2Budget.address}</td>
                    <td>DM (IAS) + NDMA + Finance (IDAS)</td>
                    <td>3-of-3 multi-sig consensus on SDRF allocation</td>
                  </tr>
                  <tr>
                    <td><span className="page-indicator-pill p3">3</span></td>
                    <td className="contract-name-cell">FundEscrowLedger.sol</td>
                    <td className="mono-addr">{POLYGON_NOTEBOOK_CONFIG.contracts.page3Escrow.address}</td>
                    <td>Treasury Finance Officer</td>
                    <td>Anti-diversion locks for Food, PWD, Health</td>
                  </tr>
                  <tr>
                    <td><span className="page-indicator-pill p4">4</span></td>
                    <td className="contract-name-cell">DeliveryEvidence.sol</td>
                    <td className="mono-addr">{POLYGON_NOTEBOOK_CONFIG.contracts.page4Evidence.address}</td>
                    <td>Field Logistics / NGO Contractors</td>
                    <td>The Third Number: GPS geotags & IPFS proof</td>
                  </tr>
                  <tr>
                    <td><span className="page-indicator-pill p5">5</span></td>
                    <td className="contract-name-cell">GrievanceSLA.sol</td>
                    <td className="mono-addr">{POLYGON_NOTEBOOK_CONFIG.contracts.page5Grievance.address}</td>
                    <td>Citizens via Gasless Relayer</td>
                    <td>Statutory 48h response clock; zero ticket deletion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
