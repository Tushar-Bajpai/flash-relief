'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { DeliveryScoreboard } from '@/components/deliver/delivery-scoreboard'
import { LineItemDeliveryCard } from '@/components/deliver/line-item-delivery-card'
import { AttachProofModal } from '@/components/deliver/attach-proof-modal'
import { DELIVERY_LINE_ITEMS, DELIVERY_SCOREBOARD, DeliveryProofItem } from '@/lib/deliver-data'
import { ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2, Truck, Award, Camera, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function DeliverPage() {
  const [items, setItems] = useState<DeliveryProofItem[]>(DELIVERY_LINE_ITEMS)
  const [scoreboard, setScoreboard] = useState(DELIVERY_SCOREBOARD)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function loadDeliveries() {
      try {
        const res = await fetch('/api/events/fl-2026-brahmaputra')
        if (res.ok) {
          const data = await res.json()
          if (data?.event?.budgets?.[0]?.lineItems) {
            const lineItems = data.event.budgets[0].lineItems
            let dbProvenCount = 0
            lineItems.forEach((li: any) => {
              if (li.deliveries && li.deliveries.length > 0) {
                dbProvenCount += li.deliveries.length
              }
            })
            if (dbProvenCount > 0) {
              setScoreboard((prev) => {
                const totalProven = Number((prev.totalProvenCrores + 0.45 * dbProvenCount).toFixed(2))
                return {
                  ...prev,
                  totalProvenCrores: Math.min(prev.totalAllocatedCrores, totalProven),
                  provenPercentage: Number(((totalProven / prev.totalAllocatedCrores) * 100).toFixed(1)),
                }
              })
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load deliveries from DB:', err)
      }
    }
    loadDeliveries()
  }, [])

  const handleProofSuccess = (newProof: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.lineItemId === newProof.selectedLine) {
          return {
            ...item,
            status: 'PROVEN' as const,
            ipfsHash: newProof.ipfsHash,
            evidenceTxHash: newProof.evidenceTxHash,
            attestedBy: 'Executive Magistrate (Field Attested)',
            attestationTimestamp: 'Just now',
          }
        }
        return item
      })
    )

    setScoreboard((prev) => {
      const newProvenCrores = Number((prev.totalProvenCrores + 1.25).toFixed(2))
      const newProvenPct = Number(((newProvenCrores / prev.totalAllocatedCrores) * 100).toFixed(1))
      return {
        ...prev,
        totalProvenCrores: newProvenCrores,
        provenPercentage: newProvenPct,
      }
    })
  }

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Page Hero Header */}
        <section className="deliver-hero-banner">
          <div className="deliver-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge green">STAGE 05 · EXECUTION & PROOF OF DELIVERY</span>
              <span className="live-cadence-pill green">
                <Truck size={11} className="mr-1 inline text-green" />
                <span>IPFS CONTENT HASHER · EVIDENCE REGISTRY ANCHORED</span>
              </span>
            </div>

            <h1 className="deliver-hero-title">
              Field Execution &<br />
              <em>Proof of Delivery</em>
            </h1>

            <p className="deliver-hero-desc">
              Every disbursed rupee is tied to verified field evidence. Large files and geotagged photographs stay off-chain on decentralized storage (IPFS), while their SHA-256 cryptographic fingerprints are anchored into <code>EvidenceRegistry.sol</code> on Polygon. Governments typically measure money spent; FlashRelief measures delivery proven.
            </p>
          </div>

          <div className="deliver-hero-stats">
            <div className="hero-stat-card primary-deliver">
              <span className="stat-eyebrow">DELIVERY PROVEN VALUE</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-green">₹{scoreboard.totalProvenCrores.toFixed(2)}</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">
                {scoreboard.provenPercentage}% of total package verified with biometric/GPS proofs
              </span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">DISBURSED TO FIELD</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-yellow">₹{scoreboard.totalDisbursedCrores.toFixed(2)}</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">Active across 6 revenue circles in Dibrugarh</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">PROOF OF DELIVERY STANDARD</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-cyan">IPFS + GPS</span>
              </div>
              <span className="stat-subtext">Zero unverified self-declarations permitted</span>
            </div>
          </div>
        </section>

        {/* Section 1: 3-Tier Delivery Scoreboard */}
        <section className="deliver-section">
          <DeliveryScoreboard scoreboard={scoreboard} />
        </section>

        {/* Section 2: Line Items Delivery & Proof Inspector */}
        <section className="deliver-section">
          <LineItemDeliveryCard
            items={items}
            onOpenAttachModal={() => setIsModalOpen(true)}
          />
        </section>

        {/* Modal: Attach Field Evidence */}
        <AttachProofModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleProofSuccess}
        />

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">FINAL PIPELINE STAGE</span>
              <h2 className="handoff-title">Next: Stage 06 Public Grievance Dashboard & Ledger Explorer</h2>
              <p className="handoff-desc">
                Citizens and civic observers can now inspect the public ledger down to the individual line item and file timestamped grievances for aid that never arrived.
              </p>
            </div>

            <div className="handoff-actions-row">
              <Link href="/release" className="secondary-action">
                <ArrowLeft size={15} />
                <span>Back to Stage 04: Release</span>
              </Link>

              <Link href="/report" className="primary-action">
                <span>Proceed to Stage 06: Report & Grievances</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
