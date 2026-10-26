'use client'

import { DeliveryScoreboardData } from '@/lib/deliver-data'
import { Award, ShieldCheck, CheckCircle2, TrendingUp, AlertTriangle, Building2 } from 'lucide-react'

interface DeliveryScoreboardProps {
  scoreboard: DeliveryScoreboardData
}

export function DeliveryScoreboard({ scoreboard }: DeliveryScoreboardProps) {
  return (
    <div className="scoreboard-card">
      <div className="scoreboard-header">
        <div className="flex-align-gap">
          <Award size={16} className="text-green" />
          <h3 className="panel-title">DELIVERY VERIFICATION SCOREBOARD // THE THIRD NUMBER PRINCIPLE</h3>
        </div>

        <span className="proven-pill-badge">
          <ShieldCheck size={11} className="mr-1 inline text-green" />
          <span>PROVEN RATIO: {scoreboard.provenPercentage}% OF TOTAL ALLOCATION</span>
        </span>
      </div>

      {/* 3-Tier Comparison Highlight Banner */}
      <div className="three-tiers-banner">
        <div className="tier-col">
          <span className="tier-eyebrow">1. TOTAL ALLOCATED</span>
          <span className="tier-val">₹{scoreboard.totalAllocatedCrores.toFixed(2)} Cr</span>
          <span className="tier-sub">100% On-chain baseline</span>
        </div>

        <div className="tier-divider">→</div>

        <div className="tier-col">
          <span className="tier-eyebrow">2. DISBURSED TO FIELD</span>
          <span className="tier-val text-yellow">₹{scoreboard.totalDisbursedCrores.toFixed(2)} Cr</span>
          <span className="tier-sub">{scoreboard.disbursedPercentage}% Treasury releases</span>
        </div>

        <div className="tier-divider">→</div>

        <div className="tier-col highlight">
          <span className="tier-eyebrow">3. DELIVERY PROVEN</span>
          <span className="tier-val text-green">₹{scoreboard.totalProvenCrores.toFixed(2)} Cr</span>
          <span className="tier-sub">{scoreboard.provenPercentage}% Geotagged & biometrically verified</span>
        </div>
      </div>

      <div className="civic-principle-quote">
        <span>
          <strong>The Accountability Rule:</strong> Governments usually measure relief by <em>budget allocated</em> or <em>funds disbursed</em>. FlashRelief treats funds as complete only when <em>delivery is proven</em> with non-repudiable ground attestations.
        </span>
      </div>

      {/* Department Breakdown Table */}
      <div className="dept-scoreboard-table-wrap">
        <table className="dept-score-table">
          <thead>
            <tr>
              <th>DEPARTMENT</th>
              <th>ALLOCATED</th>
              <th>DISBURSED</th>
              <th>DELIVERY PROVEN</th>
              <th>PROVEN RATIO</th>
            </tr>
          </thead>
          <tbody>
            {scoreboard.departmentMetrics.map((dept) => (
              <tr key={dept.departmentId}>
                <td className="dept-title-cell">
                  <div className="flex-align-gap">
                    <span className="dept-dot" style={{ backgroundColor: dept.color }} />
                    <span className="dept-tbl-name">{dept.shortName}</span>
                  </div>
                </td>

                <td>
                  <span className="amt-txt">₹{dept.allocatedCrores.toFixed(2)} Cr</span>
                </td>

                <td>
                  <span className="amt-txt text-yellow">₹{dept.disbursedCrores.toFixed(2)} Cr</span>
                </td>

                <td>
                  <span className="amt-txt text-green">₹{dept.provenCrores.toFixed(2)} Cr</span>
                </td>

                <td className="progress-cell">
                  <div className="tbl-progress-bar">
                    <div
                      className="tbl-progress-fill"
                      style={{
                        width: `${dept.provenPct}%`,
                        backgroundColor: dept.provenPct >= 70 ? '#10b981' : dept.provenPct >= 40 ? '#f4c969' : '#ff785f',
                      }}
                    />
                  </div>
                  <span className="progress-pct-num">{dept.provenPct}%</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
