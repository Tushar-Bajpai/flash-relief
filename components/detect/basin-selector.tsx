'use client'

import { AlertTriangle, CheckCircle2, Radio, Compass } from 'lucide-react'
import { MONITORED_BASINS } from '@/lib/detect-data'

interface BasinSelectorProps {
  selectedBasinId: string
  onSelectBasin: (basinId: string) => void
}

export function BasinSelector({ selectedBasinId, onSelectBasin }: BasinSelectorProps) {
  return (
    <div className="basin-selector-container">
      <div className="basin-selector-label-row">
        <div className="flex-align-gap">
          <Compass size={14} className="text-cyan" />
          <span className="mono-subhead">MONITORED RIVER BASINS // TELEMETRY GRID</span>
        </div>
        <span className="basin-live-clock">30-MIN INGEST CADENCE</span>
      </div>

      <div className="basin-card-grid">
        {MONITORED_BASINS.map((basin) => {
          const isSelected = selectedBasinId === basin.id
          const isWarning = basin.alertStatus === 'WARNING'
          const isWatch = basin.alertStatus === 'WATCH'

          return (
            <button
              key={basin.id}
              type="button"
              onClick={() => onSelectBasin(basin.id)}
              className={`basin-select-card ${isSelected ? 'active' : ''} ${basin.alertStatus.toLowerCase()}`}
            >
              <div className="basin-card-top">
                <div className="basin-name-group">
                  <h3 className="basin-card-title">{basin.name}</h3>
                  <span className="basin-card-state">{basin.state}</span>
                </div>

                <span className={`status-pill ${basin.alertStatus.toLowerCase()}`}>
                  {isWarning && <AlertTriangle size={11} className="mr-1 inline" />}
                  {isWatch && <Radio size={11} className="mr-1 inline" />}
                  {!isWarning && !isWatch && <CheckCircle2 size={11} className="mr-1 inline" />}
                  <span>{basin.alertStatus}</span>
                </span>
              </div>

              <div className="basin-card-stats">
                <div className="basin-stat-col">
                  <span className="basin-stat-label">AI CONFIDENCE</span>
                  <span className="basin-stat-val text-cyan">{basin.confidence}%</span>
                </div>
                <div className="basin-stat-col">
                  <span className="basin-stat-label">LEAD TIME</span>
                  <span className="basin-stat-val text-coral">{basin.leadTime}</span>
                </div>
                <div className="basin-stat-col">
                  <span className="basin-stat-label">GAUGES CRITICAL</span>
                  <span className="basin-stat-val">{basin.dangerGaugesCount}</span>
                </div>
              </div>

              {isSelected && <div className="basin-card-glow" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
