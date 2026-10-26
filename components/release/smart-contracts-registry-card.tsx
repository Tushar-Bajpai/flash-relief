'use client'

import { SMART_CONTRACTS } from '@/lib/release-data'
import { FileCode, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react'

export function SmartContractsRegistryCard() {
  return (
    <div className="contracts-registry-card">
      <div className="registry-header">
        <div className="flex-align-gap">
          <FileCode size={16} className="text-cyan" />
          <h3 className="panel-title">VERIFIED CORE SMART CONTRACTS // POLYGON ARCHITECTURE</h3>
        </div>

        <span className="evm-standard-tag">
          <CheckCircle2 size={11} className="mr-1 inline text-green" />
          <span>EVM COMPATIBLE · SOLIDITY 0.8.24</span>
        </span>
      </div>

      <div className="contracts-grid">
        {Object.entries(SMART_CONTRACTS).map(([key, contract]) => (
          <div key={key} className="contract-box">
            <div className="contract-top-row">
              <span className="contract-filename">{contract.name}</span>
              <span className="contract-role-badge">VERIFIED</span>
            </div>

            <p className="contract-desc">{contract.description}</p>

            <div className="contract-address-bar">
              <span className="contract-addr-mono">{contract.address}</span>
              <a
                href={contract.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="explorer-link-btn"
                title="View on Polygonscan"
              >
                <ExternalLink size={11} />
                <span>Explorer</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
