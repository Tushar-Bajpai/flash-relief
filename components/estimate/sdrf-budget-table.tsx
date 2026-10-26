'use client'

import { useState } from 'react'
import { BudgetLineItem, DEPARTMENTS, SDRF_NORMS_VERSION } from '@/lib/estimate-data'
import { FileSpreadsheet, Calculator, Info, ChevronDown, ChevronUp, Layers, CheckCircle } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface SdrfBudgetTableProps {
  lines: BudgetLineItem[]
  totalRupees: number
  totalCrores: number
}

export function SdrfBudgetTable({ lines, totalRupees, totalCrores }: SdrfBudgetTableProps) {
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all')
  const [expandedLineId, setExpandedLineId] = useState<string | null>(null)

  const filteredLines = selectedDeptFilter === 'all'
    ? lines
    : lines.filter((l) => l.departmentId === selectedDeptFilter)

  const formatRupees = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`
    }
    return `₹${formatNumber(amount)}`
  }

  return (
    <div className="sdrf-table-card">
      <div className="table-top-bar">
        <div className="flex-align-gap">
          <FileSpreadsheet size={16} className="text-cyan" />
          <h3 className="panel-title">MHA SDRF RELIEF NORMS SCHEDULE // DETERMINISTIC BUDGET</h3>
        </div>

        <div className="norm-version-pill">
          <CheckCircle size={11} className="text-green" />
          <span>NORMS SCHEDULE: {SDRF_NORMS_VERSION}</span>
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="dept-filter-tabs">
        <button
          type="button"
          onClick={() => setSelectedDeptFilter('all')}
          className={`dept-tab-btn ${selectedDeptFilter === 'all' ? 'active' : ''}`}
        >
          <span>All Departments ({lines.length})</span>
        </button>
        {Object.values(DEPARTMENTS).map((dept) => {
          const count = lines.filter((l) => l.departmentId === dept.id).length
          if (count === 0) return null
          return (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDeptFilter(dept.id)}
              className={`dept-tab-btn ${selectedDeptFilter === dept.id ? 'active' : ''}`}
            >
              <span>{dept.shortName}</span>
              <span className="dept-count-badge">({count})</span>
            </button>
          )
        })}
      </div>

      {/* Main Budget Data Table */}
      <div className="budget-table-wrapper">
        <table className="sdrf-data-table">
          <thead>
            <tr>
              <th>NORM CODE</th>
              <th>RELIEF LINE ITEM</th>
              <th>DEPARTMENT</th>
              <th>QUANTITY</th>
              <th>UNIT RATE</th>
              <th>TOTAL ALLOCATION</th>
              <th>FORMULA</th>
            </tr>
          </thead>
          <tbody>
            {filteredLines.map((line) => {
              const dept = DEPARTMENTS[line.departmentId]
              const isExpanded = expandedLineId === line.id

              return (
                <tr key={line.id} className={isExpanded ? 'expanded-row' : ''}>
                  <td className="norm-code-cell">
                    <span className="norm-code-badge">{line.normCode}</span>
                  </td>

                  <td className="desc-cell">
                    <span className="line-desc-text">{line.description}</span>
                    {isExpanded && (
                      <div className="line-expanded-details">
                        <div className="detail-field">
                          <span className="detail-lbl">QUANTITY PROVENANCE:</span>
                          <span className="detail-txt">
                            Raster intersection of Sentinel-1 radar water mask with Census 2011 / WorldPop grid.
                          </span>
                        </div>
                        <div className="detail-field">
                          <span className="detail-lbl">MHA NORM REFERENCE:</span>
                          <span className="detail-txt">
                            Notification No. 33-02/2023-NDM-I under Disaster Management Act, 2005 Section 46.
                          </span>
                        </div>
                        <div className="detail-field">
                          <span className="detail-lbl">UNCERTAINTY BOUNDS:</span>
                          <span className="detail-txt text-cyan">
                            P10: {formatRupees(line.percentileRange.p10Rupees)} · P50: {formatRupees(line.percentileRange.p50Rupees)} · P90: {formatRupees(line.percentileRange.p90Rupees)}
                          </span>
                        </div>
                      </div>
                    )}
                  </td>

                  <td>
                    <span
                      className="dept-pill"
                      style={{
                        borderColor: `${dept.color}55`,
                        color: dept.color,
                        background: `${dept.color}15`,
                      }}
                    >
                      {dept.shortName}
                    </span>
                  </td>

                  <td className="qty-cell">
                    <span className="qty-val">{formatNumber(line.quantity)}</span>
                    <span className="qty-unit">{line.unitLabel}</span>
                  </td>

                  <td className="rate-cell">
                    <span className="rate-val">₹{formatNumber(line.ratePerUnit)}</span>
                    <span className="rate-unit">/{line.unitLabel.split(' ')[0]}</span>
                  </td>

                  <td className="cost-cell">
                    <span className="cost-val">{formatRupees(line.totalCostRupees)}</span>
                    <span className="cost-raw">₹{formatNumber(line.totalCostRupees)}</span>
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => setExpandedLineId(isExpanded ? null : line.id)}
                      className="formula-inspect-btn"
                      title="Inspect formula & provenance"
                    >
                      <Calculator size={11} className="text-cyan" />
                      <span>{line.formulaString}</span>
                      {isExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="table-total-row">
              <td colSpan={5} className="total-label-cell">
                TOTAL DRAFT RELIEF DISBURSAL (EXACT ARITHMETIC SUM)
              </td>
              <td colSpan={2} className="total-amount-cell">
                <span className="huge-total-crores">₹{totalCrores.toFixed(2)} Crores</span>
                <span className="raw-total-rupees">(₹{formatNumber(totalRupees)})</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
