'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { ConsoleBar, ConsoleNextBar } from '@/components/layout/console-bar'
import { BasinSelector } from '@/components/detect/basin-selector'
import { DepthExposureSlider } from '@/components/estimate/depth-exposure-slider'
import { SdrfBudgetTable } from '@/components/estimate/sdrf-budget-table'
import { DepartmentAllocationCard } from '@/components/estimate/department-allocation-card'
import { BudgetValidationCard } from '@/components/estimate/budget-validation-card'
import { SdrfVectorSearch } from '@/components/estimate/sdrf-vector-search'
import { generateDraftBudget, PercentileChoice, SDRF_NORMS_VERSION } from '@/lib/estimate-data'
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'

import { formatNumber } from '@/lib/format'
function EstimateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const basinParam = searchParams.get('basin') || 'brahmaputra'
  const depthParam = searchParams.get('depth')
  const initialDepth = depthParam ? parseFloat(depthParam) : 1.8

  const [waterDepth, setWaterDepth] = useState<number>(initialDepth)
  const [percentile, setPercentile] = useState<PercentileChoice>('P50')
  const [basinId, setBasinId] = useState<string>(basinParam)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [draftSavedNotice, setDraftSavedNotice] = useState<string | null>(null)

  useEffect(() => {
    if (depthParam) {
      const parsed = parseFloat(depthParam)
      if (!isNaN(parsed)) setWaterDepth(parsed)
    }
    if (basinParam) {
      setBasinId(basinParam)
    }
  }, [depthParam, basinParam])

  const budget = generateDraftBudget(waterDepth, percentile, basinId)

  const handleCommitDraft = async () => {
    setIsSavingDraft(true)
    try {
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'fl-2026-brahmaputra',
          waterDepthMeters: waterDepth,
          populationAtRisk: budget.exposure.displacedPopulation,
          inundationSqKm: budget.exposure.floodedAreaSqKm,
          percentile,
        }),
      })

      if (res.ok) {
        setDraftSavedNotice(
          `Draft budget of ₹${budget.totalBudgetCrores.toFixed(2)} Cr committed. Advancing to officer review…`
        )
        setTimeout(() => {
          router.push('/review')
        }, 1200)
      }
    } catch (err) {
      console.warn('Error saving draft budget to database:', err)
      router.push('/review')
    } finally {
      setIsSavingDraft(false)
    }
  }

  return (
    <div className="product-page-shell">
      {/* Top Application Navigation */}
      <AppHeader />

      <main className="product-page-main">
        {/* Compact page header */}
        <ConsoleBar
          stage="02"
          name="Estimate"
          accent="yellow"
          title={
            <>
              Exposure &amp; <em>SDRF budget draft</em>
            </>
          }
          description={`Flood depth and inundation extent are converted into an itemized relief budget using the official MHA norms schedule (${SDRF_NORMS_VERSION}). Every rate comes from the notification — never from the model.`}
          stats={[
            { label: 'Draft budget', value: `₹${budget.totalBudgetCrores.toFixed(2)} Cr`, tone: 'yellow' },
            { label: 'Displaced', value: formatNumber(budget.exposure.displacedPopulation), tone: 'coral' },
            { label: 'Cropland flooded', value: `${formatNumber(budget.exposure.croplandInundatedHa)} ha`, tone: 'green' },
          ]}
        />

        {/* Basin catchment selector */}
        <section className="estimate-section">
          <BasinSelector
            selectedBasinId={basinId}
            onSelectBasin={setBasinId}
          />
        </section>

        {/* Statutory SDRF norms search */}
        <section className="estimate-section">
          <SdrfVectorSearch />
        </section>

        {/* Interactive depth slider & exposure model */}
        <section className="estimate-section">
          <DepthExposureSlider
            exposure={budget.exposure}
            waterDepth={waterDepth}
            percentile={percentile}
            onDepthChange={setWaterDepth}
            onPercentileChange={setPercentile}
          />
        </section>

        {/* Departmental allocation split */}
        <section className="estimate-section">
          <DepartmentAllocationCard
            departmentSplits={budget.departmentSplits}
            totalCrores={budget.totalBudgetCrores}
          />
        </section>

        {/* SDRF line-item table */}
        <section className="estimate-section">
          <SdrfBudgetTable
            lines={budget.lines}
            totalRupees={budget.totalBudgetRupees}
            totalCrores={budget.totalBudgetCrores}
          />
        </section>

        {/* Validation guardrails & AI explanation */}
        <section className="estimate-section">
          <BudgetValidationCard
            validationChecks={budget.validationChecks}
            aiExplanation={budget.aiExplanation}
            totalCrores={budget.totalBudgetCrores}
            selectedPercentile={percentile}
          />
        </section>

        {/* Stage navigation & commit action */}
        <ConsoleNextBar
          backLabel="Stage 01 · Detect"
          backHref="/detect"
          nextLabel="Stage 03 · Officer review"
        >
          {draftSavedNotice && (
            <span className="flex-align-gap text-green text-sm">
              <CheckCircle2 size={16} />
              <span>{draftSavedNotice}</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleCommitDraft}
            disabled={isSavingDraft}
            className="primary-action cursor-pointer"
          >
            {isSavingDraft ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                <span>Committing draft…</span>
              </>
            ) : (
              <>
                <span>Commit draft &amp; advance to review</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
          <Link href="/review" className="console-next-forward" style={{ background: 'transparent', color: 'var(--ink)', border: '1px solid rgba(234,245,244,0.2)' }}>
            Preview review →
          </Link>
        </ConsoleNextBar>
      </main>
    </div>
  )
}

export default function EstimatePage() {
  return (
    <Suspense
      fallback={
        <div className="product-page-shell flex items-center justify-center min-h-screen text-cyan">
          <Loader2 size={32} className="animate-spin" />
        </div>
      }
    >
      <EstimateContent />
    </Suspense>
  )
}
