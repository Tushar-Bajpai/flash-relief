'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { BasinSelector } from '@/components/detect/basin-selector'
import { DepthExposureSlider } from '@/components/estimate/depth-exposure-slider'
import { SdrfBudgetTable } from '@/components/estimate/sdrf-budget-table'
import { DepartmentAllocationCard } from '@/components/estimate/department-allocation-card'
import { BudgetValidationCard } from '@/components/estimate/budget-validation-card'
import { SdrfVectorSearch } from '@/components/estimate/sdrf-vector-search'
import { generateDraftBudget, PercentileChoice, SDRF_NORMS_VERSION } from '@/lib/estimate-data'
import {
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Scale,
  FileSpreadsheet,
  Building2,
  Sliders,
  CheckCircle2,
  Loader2,
  Database,
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
          `Draft budget of ₹${budget.totalBudgetCrores.toFixed(2)} Cr persisted to Neon DB! Ready for Executive Committee sign-off.`
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
        {/* Page Hero Header */}
        <section className="estimate-hero-banner">
          <div className="estimate-hero-left">
            <div className="stage-pill-row">
              <span className="stage-badge yellow">STAGE 02 · EXPOSURE ESTIMATION & BUDGET FORMULATION</span>
              <span className="live-cadence-pill">
                <Scale size={11} className="mr-1 inline text-yellow" />
                <span>OFFICIAL SDRF NORMS SCHEDULE: {SDRF_NORMS_VERSION}</span>
              </span>
            </div>

            <h1 className="estimate-hero-title">
              Exposure Depth Raster &<br />
              <em>SDRF Budget Formulation</em>
            </h1>

            <p className="estimate-hero-desc">
              FlashRelief intersects Sentinel-1 radar inundation polygons and CWC hydrodynamic depth forecasts with WorldPop and land-cover grids. An automated calculator translates physical exposure into an itemized draft relief budget formulated against official Ministry of Home Affairs SDRF norms.
            </p>
          </div>

          <div className="estimate-hero-stats">
            <div className="hero-stat-card primary-estimate">
              <span className="stat-eyebrow">TOTAL DRAFT RELIEF BUDGET</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-yellow">₹{budget.totalBudgetCrores.toFixed(2)}</span>
                <span className="stat-unit">Crores</span>
              </div>
              <span className="stat-subtext">
                {percentile} uncertainty bound · ₹{formatNumber(budget.totalBudgetRupees)}
              </span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">DISPLACED POPULATION</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-coral">{formatNumber(budget.exposure.displacedPopulation)}</span>
                <span className="stat-unit">citizens</span>
              </div>
              <span className="stat-subtext">Requires {budget.exposure.campDays} days gratuitous camp feeding</span>
            </div>

            <div className="hero-stat-card">
              <span className="stat-eyebrow">INUNDATED CROPLAND</span>
              <div className="stat-value-row">
                <span className="stat-huge-value text-green">{formatNumber(budget.exposure.croplandInundatedHa)}</span>
                <span className="stat-unit">hectares</span>
              </div>
              <span className="stat-subtext">Standing Sali paddy (&gt;33% crop loss threshold)</span>
            </div>
          </div>
        </section>

        {/* Basin Catchment Selector */}
        <section className="estimate-section">
          <BasinSelector
            selectedBasinId={basinId}
            onSelectBasin={setBasinId}
          />
        </section>

        {/* Section: Statutory SDRF Legal Norms AI Search (Neon pgvector) */}
        <section className="estimate-section">
          <SdrfVectorSearch />
        </section>

        {/* Section 1: Interactive Depth Slider & JRC Exposure Controller */}
        <section className="estimate-section">
          <DepthExposureSlider
            exposure={budget.exposure}
            waterDepth={waterDepth}
            percentile={percentile}
            onDepthChange={setWaterDepth}
            onPercentileChange={setPercentile}
          />
        </section>

        {/* Section 2: Departmental Treasury Allocation Split */}
        <section className="estimate-section">
          <DepartmentAllocationCard
            departmentSplits={budget.departmentSplits}
            totalCrores={budget.totalBudgetCrores}
          />
        </section>

        {/* Section 3: Detailed SDRF Norms Line Items Table */}
        <section className="estimate-section">
          <SdrfBudgetTable
            lines={budget.lines}
            totalRupees={budget.totalBudgetRupees}
            totalCrores={budget.totalBudgetCrores}
          />
        </section>

        {/* Section 4: Deterministic Validation Guardrails & AI Explanation */}
        <section className="estimate-section">
          <BudgetValidationCard
            validationChecks={budget.validationChecks}
            aiExplanation={budget.aiExplanation}
            totalCrores={budget.totalBudgetCrores}
            selectedPercentile={percentile}
          />
        </section>

        {/* Bottom Navigation Handoff Bar */}
        <section className="stage-handoff-banner">
          <div className="handoff-content">
            <div className="handoff-left">
              <span className="handoff-eyebrow">PIPELINE CONTINUITY</span>
              <h2 className="handoff-title">Next: Stage 03 Multi-Role Officer Review Committee</h2>
              <p className="handoff-desc">
                The validated draft budget package is now staged for authorized executive review by the District Magistrate, State Disaster Management Authority (SDMA), and Finance Commissioner.
              </p>
              {draftSavedNotice && (
                <div className="flex-align-gap mt-3 text-green text-sm">
                  <CheckCircle2 size={16} />
                  <span>{draftSavedNotice}</span>
                </div>
              )}
            </div>

            <div className="handoff-actions-row">
              <Link href="/detect" className="secondary-action">
                <ArrowLeft size={15} />
                <span>Back to Stage 01: Detect</span>
              </Link>

              <button
                type="button"
                onClick={handleCommitDraft}
                disabled={isSavingDraft}
                className="primary-action pulse-glow cursor-pointer"
              >
                {isSavingDraft ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    <span>Committing to Neon DB...</span>
                  </>
                ) : (
                  <>
                    <Database size={16} className="mr-1.5" />
                    <span>Commit Budget & Advance to Review</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
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
