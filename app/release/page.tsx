'use client'

import { useState, useEffect } from 'react'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
import { ChainBroadcastCard } from '@/components/release/chain-broadcast-card'
import { DepartmentVaultsTable } from '@/components/release/department-vaults-table'
import { SmartContractsRegistryCard } from '@/components/release/smart-contracts-registry-card'
import { SAMPLE_RELEASE_TX, INITIAL_DEPARTMENT_VAULTS, DepartmentVaultAllocation } from '@/lib/release-data'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function ReleasePage() {
  const [vaults, setVaults] = useState<DepartmentVaultAllocation[]>(INITIAL_DEPARTMENT_VAULTS)
  const [releaseTx, setReleaseTx] = useState(SAMPLE_RELEASE_TX)

  useEffect(() => {
    async function loadEventEscrows() {
      try {
        const res = await fetch('/api/events/fl-2026-brahmaputra')
        if (res.ok) {
          const data = await res.json()
          if (data?.event?.budgets?.[0]) {
            const budget = data.event.budgets[0]
            const totalCrores = Number((Number(budget.totalRupees) / 10000000).toFixed(2))
            setReleaseTx((prev) => ({
              ...prev,
              totalAllocatedCrores: totalCrores,
              totalAllocatedPaise: (totalCrores * 10000000 * 100).toString(),
            }))
          }
        }
      } catch (err) {
        console.warn('Failed to load escrow data:', err)
      }
    }
    loadEventEscrows()
  }, [])

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Compact page header */}
        <ConsoleBar
          stage="04"
          name="Release"
          accent="green"
          title={
            <>
              Public ledger &amp; <em>department escrows</em>
            </>
          }
          description="Approved allocations are recorded on a public ledger as non-transferable accounting entries in paise. Actual money moves through treasury channels, each payment anchored to an on-chain reference."
          stats={[
            { label: 'Allocated on-chain', value: `₹${releaseTx.totalAllocatedCrores.toFixed(2)} Cr`, tone: 'green' },
            { label: 'Department vaults', value: '6 active', tone: 'blue' },
          ]}
        />

        {/* Broadcast receipt & quorum signatures */}
        <section className="release-section">
          <ChainBroadcastCard txDetails={releaseTx} />
        </section>

        {/* Departmental treasury sub-vaults */}
        <section className="release-section">
          <DepartmentVaultsTable
            vaults={vaults}
            totalCrores={releaseTx.totalAllocatedCrores}
          />
        </section>

        {/* Verified contract registry */}
        <section className="release-section">
          <SmartContractsRegistryCard />
        </section>

        {/* Stage navigation */}
        <ConsoleNextBar
          backLabel="Stage 03 · Review"
          backHref="/review"
          nextLabel="Stage 05 · Deliver & prove"
        >
          <Link href="/deliver" className="primary-action console-next-forward">
            <span>Proceed to delivery</span>
            <ArrowRight size={14} />
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}
