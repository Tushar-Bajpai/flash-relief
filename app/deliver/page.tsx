'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
import { DeliveryScoreboard } from '@/components/deliver/delivery-scoreboard'
import { LineItemDeliveryCard } from '@/components/deliver/line-item-delivery-card'
import { AttachProofModal } from '@/components/deliver/attach-proof-modal'
import { DELIVERY_LINE_ITEMS, DELIVERY_SCOREBOARD, DeliveryProofItem } from '@/lib/deliver-data'
import { ArrowRight } from 'lucide-react'
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
        {/* Compact page header */}
        <ConsoleBar
          stage="05"
          name="Deliver"
          accent="green"
          title={
            <>
              Field execution &amp; <em>proof of delivery</em>
            </>
          }
          description="Departments attach geotagged photos and beneficiary receipts to every line item. The files stay off-chain; their fingerprints are anchored to the EvidenceRegistry so nothing can be altered afterwards."
          stats={[
            { label: 'Delivery proven', value: `₹${scoreboard.totalProvenCrores.toFixed(2)} Cr`, tone: 'green' },
            { label: 'Disbursed to field', value: `₹${scoreboard.totalDisbursedCrores.toFixed(2)} Cr`, tone: 'yellow' },
            { label: 'Proven share', value: `${scoreboard.provenPercentage}%`, tone: 'blue' },
          ]}
        />

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

        {/* Stage navigation */}
        <ConsoleNextBar
          backLabel="Stage 04 · Release"
          backHref="/release"
          nextLabel="Stage 06 · Public grievances"
        >
          <Link href="/report" className="primary-action console-next-forward">
            <span>Open grievance portal</span>
            <ArrowRight size={14} />
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}
