'use client'

import { FileText, ShieldCheck, CheckCircle2, ChevronRight, Hash, Layers } from 'lucide-react'

interface PackageInspectionDrawerProps {
  baseBudgetCrores: number
  adjustedBudgetCrores: number
  threadId: string
  checkpointId: string
  checkpointTimestamp: string
}

export function PackageInspectionDrawer({
  baseBudgetCrores,
  adjustedBudgetCrores,
  threadId,
  checkpointId,
  checkpointTimestamp,
}: PackageInspectionDrawerProps) {
  const delta = adjustedBudgetCrores - baseBudgetCrores

  return (
    <div className="package-drawer-card">
      <div className="drawer-header">
        <div className="flex-align-gap">
          <FileText size={16} className="text-cyan" />
          <h3 className="panel-title">DRAFT RELIEF PACKAGE // DOSSIER INSPECTOR</h3>
        </div>

        <span className="audit-ready-tag">
          <ShieldCheck size={11} className="mr-1 inline text-green" />
          <span>SDRF 2023-26 COMPLIANT</span>
        </span>
      </div>

      <div className="drawer-stats-row">
        <div className="drawer-stat-item">
          <span className="dstat-lbl">BASE ESTIMATED BUDGET</span>
          <span className="dstat-val">₹{baseBudgetCrores.toFixed(2)} Cr</span>
          <span className="dstat-sub">From Stage 02 hydrodynamic raster</span>
        </div>

        <div className="drawer-stat-item">
          <span className="dstat-lbl">COMMITTEE ADJUSTMENTS</span>
          <span className={`dstat-val ${delta > 0 ? 'text-coral' : 'text-muted'}`}>
            {delta > 0 ? `+₹${delta.toFixed(2)} Cr` : '₹0.00 Cr'}
          </span>
          <span className="dstat-sub">Human-in-the-loop modifications</span>
        </div>

        <div className="drawer-stat-item highlight">
          <span className="dstat-lbl">NET AUTHORIZED DISBURSAL</span>
          <span className="dstat-val text-yellow">₹{adjustedBudgetCrores.toFixed(2)} Cr</span>
          <span className="dstat-sub">Staged for multi-sig release</span>
        </div>
      </div>

      <div className="checkpoint-meta-strip">
        <div className="meta-chip">
          <Hash size={11} className="text-cyan" />
          <span>THREAD: {threadId}</span>
        </div>
        <div className="meta-chip">
          <Layers size={11} className="text-muted" />
          <span>CHECKPOINT: {checkpointId}</span>
        </div>
        <div className="meta-chip">
          <span className="text-muted">PAUSED AT: {checkpointTimestamp}</span>
        </div>
      </div>
    </div>
  )
}
