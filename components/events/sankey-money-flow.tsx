'use client'

import { useState } from 'react'
import { MoneyFlowNode, MoneyFlowLink } from '@/lib/events-data'
import { ArrowRight, Layers, Coins, Landmark, Building2, MapPin, Users, CheckCircle2 } from 'lucide-react'

interface SankeyMoneyFlowProps {
  nodes: MoneyFlowNode[]
  links: MoneyFlowLink[]
  totalAllocatedCrores: number
}

export function SankeyMoneyFlow({ nodes, links, totalAllocatedCrores }: SankeyMoneyFlowProps) {
  const [activeTier, setActiveTier] = useState<string>('all')

  const treasuryNodes = nodes.filter((n) => n.category === 'treasury')
  const departmentNodes = nodes.filter((n) => n.category === 'department')
  const circleNodes = nodes.filter((n) => n.category === 'circle')
  const citizenNodes = nodes.filter((n) => n.category === 'citizens')

  return (
    <div className="sankey-panel-card">
      <div className="sankey-header">
        <div className="flex-align-gap">
          <Landmark size={16} className="text-cyan" />
          <h2 className="panel-title">DISASTER TREASURY TO CITIZEN // MULTI-TIER MONEY FLOW</h2>
        </div>

        <span className="audit-ready-tag">
          <Coins size={11} className="mr-1 inline text-green" />
          <span>NON-TRANSFERABLE PAISE ACCOUNTING</span>
        </span>
      </div>

      <p className="sankey-desc">
        Visual flow of the ₹{totalAllocatedCrores.toFixed(2)} Crores statutory SDRF package from the state treasury into departmental sub-vaults, onwards to revenue circles, and finally to verified citizen relief shelters with zero middleman slippage.
      </p>

      {/* 4-Tier Interactive Flow Visualization */}
      <div className="sankey-tiers-grid">
        {/* Tier 1: State SDRF Treasury */}
        <div className="sankey-tier-col">
          <div className="tier-header">
            <span className="tier-num">TIER 01</span>
            <span className="tier-name">STATE TREASURY</span>
          </div>

          <div className="tier-cards-list">
            {treasuryNodes.map((node) => (
              <div key={node.id} className="sankey-node-card treasury">
                <div className="node-icon-row">
                  <Landmark size={14} className="text-cyan" />
                  <span className="node-cat-pill">STATUTORY POOL</span>
                </div>
                <h4 className="node-title">{node.label}</h4>
                <div className="node-amount-row">
                  <span className="node-amount-big text-cyan">₹{node.amountCrores.toFixed(2)}</span>
                  <span className="node-unit">Cr</span>
                </div>
                <span className="node-meta-foot">Sanctioned under MHA SDRF Norms</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Connector 1 */}
        <div className="sankey-connector-col">
          <div className="connector-line-pulse" />
          <ArrowRight size={16} className="connector-arrow" />
        </div>

        {/* Tier 2: Line Departments */}
        <div className="sankey-tier-col wide">
          <div className="tier-header">
            <span className="tier-num">TIER 02</span>
            <span className="tier-name">DEPARTMENT SUB-VAULTS</span>
          </div>

          <div className="tier-cards-list">
            {departmentNodes.map((node) => {
              const pct = Math.round((node.amountCrores / totalAllocatedCrores) * 100)
              return (
                <div key={node.id} className="sankey-node-card department">
                  <div className="node-top-row">
                    <span className="node-title-compact">{node.label}</span>
                    <span className="node-amount-compact" style={{ color: node.color }}>
                      ₹{node.amountCrores.toFixed(2)} Cr
                    </span>
                  </div>
                  <div className="node-progress-bar">
                    <div
                      className="node-progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: node.color }}
                    />
                  </div>
                  <div className="node-pct-row">
                    <span className="node-pct-lbl">{pct}% of total fund</span>
                    <span className="node-escrow-tag">ON-CHAIN ESCROW</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tier Connector 2 */}
        <div className="sankey-connector-col">
          <div className="connector-line-pulse" />
          <ArrowRight size={16} className="connector-arrow" />
        </div>

        {/* Tier 3: Revenue Circles / Shelters */}
        <div className="sankey-tier-col">
          <div className="tier-header">
            <span className="tier-num">TIER 03</span>
            <span className="tier-name">REVENUE CIRCLES</span>
          </div>

          <div className="tier-cards-list">
            {circleNodes.map((node) => (
              <div key={node.id} className="sankey-node-card circle">
                <div className="node-icon-row">
                  <MapPin size={13} className="text-yellow" />
                  <span className="node-cat-pill yellow">FIELD DISBURSAL</span>
                </div>
                <h4 className="node-title-compact">{node.label}</h4>
                <div className="node-amount-row">
                  <span className="node-amount-big text-yellow">₹{node.amountCrores.toFixed(2)}</span>
                  <span className="node-unit">Cr</span>
                </div>
                <span className="node-meta-foot">Executive Magistrate custody</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Connector 3 */}
        <div className="sankey-connector-col">
          <div className="connector-line-pulse" />
          <ArrowRight size={16} className="connector-arrow" />
        </div>

        {/* Tier 4: Verified Beneficiaries */}
        <div className="sankey-tier-col">
          <div className="tier-header">
            <span className="tier-num">TIER 04</span>
            <span className="tier-name">VERIFIED CITIZENS</span>
          </div>

          <div className="tier-cards-list">
            {citizenNodes.map((node) => (
              <div key={node.id} className="sankey-node-card citizens">
                <div className="node-icon-row">
                  <Users size={14} className="text-green" />
                  <span className="node-cat-pill green">DELIVERY PROVEN</span>
                </div>
                <h4 className="node-title">{node.label}</h4>
                <div className="node-amount-row">
                  <span className="node-amount-big text-green">₹{node.amountCrores.toFixed(2)}</span>
                  <span className="node-unit">Cr</span>
                </div>
                <div className="citizen-proof-pills">
                  <div className="c-proof-pill">
                    <CheckCircle2 size={10} className="text-green mr-1 inline" />
                    <span>IPFS + GPS Attested</span>
                  </div>
                  <div className="c-proof-pill">
                    <CheckCircle2 size={10} className="text-green mr-1 inline" />
                    <span>Biometric Rosters</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
