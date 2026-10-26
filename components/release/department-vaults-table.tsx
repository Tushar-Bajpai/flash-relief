'use client'

import { DepartmentVaultAllocation } from '@/lib/release-data'
import { Lock, ShieldCheck, ExternalLink, Building2, Wallet } from 'lucide-react'

import { formatNumber } from '@/lib/format'
interface DepartmentVaultsTableProps {
  vaults: DepartmentVaultAllocation[]
  totalCrores: number
}

export function DepartmentVaultsTable({ vaults, totalCrores }: DepartmentVaultsTableProps) {
  return (
    <div className="vaults-panel-card">
      <div className="vaults-header">
        <div className="flex-align-gap">
          <Wallet size={16} className="text-cyan" />
          <h3 className="panel-title">DEPARTMENTAL SMART ESCROW SUB-VAULTS // ON-CHAIN LEDGER</h3>
        </div>

        <span className="vaults-summary-tag">
          TOTAL PROVISIONED: ₹{totalCrores.toFixed(2)} Cr · 6 SUB-VAULTS ACTIVE
        </span>
      </div>

      <div className="vaults-table-wrapper">
        <table className="vaults-table">
          <thead>
            <tr>
              <th>DEPARTMENT</th>
              <th>SUB-VAULT ADDRESS</th>
              <th>ALLOCATION (CRORES)</th>
              <th>ALLOCATION (PAISE)</th>
              <th>EARMARK RESTRICTION</th>
              <th>SMART ESCROW STATUS</th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => (
              <tr key={vault.departmentId}>
                <td className="vault-dept-cell">
                  <div className="dept-name-group">
                    <span
                      className="dept-color-bar"
                      style={{ backgroundColor: vault.color }}
                    />
                    <div>
                      <span className="vault-dept-title">{vault.departmentName}</span>
                      <span className="vault-dept-short">{vault.shortName}</span>
                    </div>
                  </div>
                </td>

                <td className="vault-address-cell">
                  <span className="vault-addr-mono">{vault.subVaultAddress}</span>
                </td>

                <td className="vault-amount-cell">
                  <span className="vault-crores" style={{ color: vault.color }}>
                    ₹{vault.amountCrores.toFixed(2)} Cr
                  </span>
                  <span className="vault-pct">({vault.percentage}%)</span>
                </td>

                <td className="vault-paise-cell">
                  <span className="paise-mono">{formatNumber(vault.amountPaise)} paise</span>
                </td>

                <td className="vault-restriction-cell">
                  <p className="restriction-text">{vault.earmarkRestriction}</p>
                </td>

                <td className="vault-status-cell">
                  <div className="lock-status-badge">
                    <Lock size={10} className="text-yellow" />
                    <span>LOCKED · AUDITED USE ONLY</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
