'use client'

import { DraftBudgetSummary } from '@/lib/estimate-data'
import { Building2, ShieldCheck, ArrowUpRight, Wallet } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface DepartmentAllocationCardProps {
  departmentSplits: DraftBudgetSummary['departmentSplits']
  totalCrores: number
}

export function DepartmentAllocationCard({ departmentSplits, totalCrores }: DepartmentAllocationCardProps) {
  return (
    <div className="dept-allocation-card">
      <div className="allocation-header">
        <div className="flex-align-gap">
          <Building2 size={16} className="text-cyan" />
          <h3 className="panel-title">DEPARTMENTAL TREASURY ALLOCATION // INTER-AGENCY SPLIT</h3>
        </div>
        <span className="escrow-mode-tag">
          <Wallet size={11} className="mr-1 inline text-green" />
          <span>EARMARKED ESCROW READY</span>
        </span>
      </div>

      {/* Visual Horizontal Stacked Progress Bar */}
      <div className="dept-stacked-bar-wrapper">
        <div className="dept-stacked-bar">
          {departmentSplits.map((dept) => (
            <div
              key={dept.departmentId}
              className="dept-bar-segment"
              style={{
                width: `${dept.percentageOfTotal}%`,
                backgroundColor: dept.color,
              }}
              title={`${dept.shortName}: ₹${dept.totalCrores} Cr (${dept.percentageOfTotal}%)`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="dept-bar-legend">
          {departmentSplits.map((dept) => (
            <div key={dept.departmentId} className="legend-entry">
              <span className="legend-dot" style={{ backgroundColor: dept.color }} />
              <span className="legend-name">{dept.shortName}</span>
              <span className="legend-pct">({dept.percentageOfTotal}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="dept-cards-grid">
        {departmentSplits.map((dept) => (
          <div key={dept.departmentId} className="dept-allocation-item">
            <div className="item-top">
              <div className="item-title-col">
                <span className="dept-full-name">{dept.departmentName}</span>
                <span className="officer-title">NODAL: {dept.departmentId === 'revenue_dm' ? 'District Magistrate & DDMA' : dept.departmentId === 'food_supplies' ? 'District Food Controller' : dept.departmentId === 'agriculture' ? 'District Agricultural Officer' : dept.departmentId === 'animal_husbandry' ? 'Chief Veterinary Officer' : dept.departmentId === 'health_family' ? 'Chief Medical & Health Officer' : 'Executive Engineer (Water Resources)'}</span>
              </div>
              <span
                className="dept-share-tag"
                style={{
                  color: dept.color,
                  borderColor: `${dept.color}44`,
                  background: `${dept.color}14`,
                }}
              >
                {dept.percentageOfTotal}% SHARE
              </span>
            </div>

            <div className="item-amount-row">
              <div className="amount-col">
                <span className="amount-eyebrow">APPROVED ALLOCATION</span>
                <span className="amount-crores" style={{ color: dept.color }}>
                  ₹{dept.totalCrores.toFixed(2)} Cr
                </span>
                <span className="amount-raw">₹{formatNumber(dept.totalRupees)}</span>
              </div>

              <div className="escrow-status-pill">
                <ShieldCheck size={12} className="text-green" />
                <span>On-Chain Sub-Vault</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
