'use client'

import { AppHeader } from '@/components/layout/app-header'
import { ChainBroadcastCard } from '@/components/release/chain-broadcast-card'
import { DepartmentVaultsTable } from '@/components/release/department-vaults-table'
import { SmartContractsRegistryCard } from '@/components/release/smart-contracts-registry-card'
import { SAMPLE_RELEASE_TX, INITIAL_DEPARTMENT_VAULTS } from '@/lib/release-data'
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Lock, Radio, Layers, Coins } from 'lucide-react'
import Link from 'next/link'

export default function ReleasePage() {
  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Page Hero Header */}
        <section className="release-hero-banner">
          <div className="release-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge green">STAGE 04 · ON-CHAIN RECORDING & TREASURY ALLOCATION</span>
              <span className="live-cadence-pill green">
                <Radio size={11} className="pulse-icon text-green" />
                <span>POLYGON POS BLOCK #19,482,850 · AMOY TESTNET</span>
              </span>
            </div>

            <h1 className="release-hero-title">
              On-Chain Ledger &<br />
              <em>Departmental Escrows</em>
            </h1>

            <p className="release-hero-desc">
              The blockchain serves as the public, tamper-proof ledger of record. Non-transferable accounting entries recorded in paise establish immutable departmental escrow boundaries on Polygon PoS. Real money moves through official treasury channels, with every disbursement permanently anchored to an on-chain transaction hash.
            </p>
          </div>

          <div className="release-hero-stats">
            <div className="hero-stat-card primary-release">
              <span className="stat-eyebrow">TOTAL ALLOCATED ON-CHAIN</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-green">₹{SAMPLE_RELEASE_TX.totalAllocatedCrores.toFixed(2)}</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">29,670,000,000 non-transferable paise</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">DEPARTMENTAL VAULTS</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">6 Vaults</span>
                <span className="stat-unit">active</span>
              </div>
              <span className="stat-subtext">Smart escrow contracts provisioned</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">NETWORK TRANSACTION COST</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-muted">&lt; 0.002</span>
                <span className="stat-unit">MATIC</span>
              </div>
              <span className="stat-subtext">Sub-penny public ledger verification</span>
            </div>
          </div>
        </section>

        {/* Section 1: Polygon PoS Broadcast Receipt & Quorum Signatures */}
        <section className="release-section">
          <ChainBroadcastCard txDetails={SAMPLE_RELEASE_TX} />
        </section>

        {/* Section 2: Departmental Treasury Sub-Vaults Table */}
        <section className="release-section">
          <DepartmentVaultsTable
            vaults={INITIAL_DEPARTMENT_VAULTS}
            totalCrores={SAMPLE_RELEASE_TX.totalAllocatedCrores}
          />
        </section>

        {/* Section 3: Verified Core Smart Contracts Registry */}
        <section className="release-section">
          <SmartContractsRegistryCard />
        </section>

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">PIPELINE CONTINUITY</span>
              <h2 className="handoff-title">Next: Stage 05 Departmental Delivery & Evidence Verification</h2>
              <p className="handoff-desc">
                With funds locked in departmental escrows, line departments (Food, Health, Revenue, Agriculture) now execute field relief and attach GPS-geotagged delivery evidence and biometric beneficiary attestations.
              </p>
            </div>

            <div className="handoff-actions-row">
              <Link href="/review" className="secondary-action">
                <ArrowLeft size={15} />
                <span>Back to Stage 03: Review</span>
              </Link>

              <Link href="/deliver" className="primary-action">
                <span>Proceed to Stage 05: Deliver & Prove</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
