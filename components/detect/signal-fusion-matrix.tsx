'use client'

import { Cpu, CheckCircle, AlertTriangle, Layers, Activity, Radio } from 'lucide-react'
import { getSignalsForBasin, getBasinById, FusionSignal } from '@/lib/detect-data'

interface SignalFusionMatrixProps {
  selectedBasinId?: string
}

export function SignalFusionMatrix({ selectedBasinId = 'brahmaputra' }: SignalFusionMatrixProps) {
  const basin = getBasinById(selectedBasinId)
  const signals = getSignalsForBasin(selectedBasinId)

  // Calculate composite probability P
  const weightedSum = signals.reduce((acc, sig) => acc + sig.score * sig.weight, 0)
  const isWarning = basin.alertStatus === 'WARNING'
  const isWatch = basin.alertStatus === 'WATCH'

  return (
    <div className={`fusion-matrix-panel ${basin.alertStatus.toLowerCase()}`}>
      {/* Header Bar */}
      <div className="fusion-header">
        <div className="flex-align-gap">
          <Cpu size={15} className="text-cyan" />
          <h3 className="panel-title">
            MULTI-SIGNAL FUSION ENGINE // {basin.name.toUpperCase()}
          </h3>
        </div>
        <span className={`fusion-badge ${basin.alertStatus.toLowerCase()}`}>
          FUSION CONFIDENCE: {basin.confidence}% · {basin.alertStatus}
        </span>
      </div>

      {/* Algorithm Logic Banner */}
      <div className="fusion-formula-strip">
        <span className="formula-code">
          P(flood) = σ(w₀ + w_R·Rainfall + w_H·Gauges + w_S·Soil + w_T·Terrain + w_C·Crowd)
        </span>
        <span className="formula-note">
          Hysteresis: WARNING fires when P ≥ 0.60 for 2 cycles · Current P = {(weightedSum).toFixed(2)}
        </span>
      </div>

      {/* 5 Input Streams Grid */}
      <div className="fusion-signals-list">
        {signals.map((sig) => {
          const isAlert = sig.status === 'ALERT'
          const isConfirmed = sig.status === 'CONFIRMED'
          const isNormal = sig.status === 'NORMAL'

          return (
            <div key={sig.id} className={`fusion-signal-row ${sig.status.toLowerCase()}`}>
              <div className="signal-main-meta">
                <div className="signal-name-row">
                  <span className="signal-name">{sig.name}</span>
                  <span className="signal-source">· {sig.source}</span>
                </div>
                <p className="signal-reading">{sig.reading}</p>
                <span className="signal-desc">{sig.description}</span>
              </div>

              <div className="signal-metrics-group">
                <div className="signal-metric-box">
                  <span className="metric-lbl">WEIGHT</span>
                  <span className="metric-val">{(sig.weight * 100).toFixed(0)}%</span>
                </div>

                <div className="signal-metric-box">
                  <span className="metric-lbl">SCORE</span>
                  <span className={`metric-val ${isAlert ? 'text-coral' : isNormal ? 'text-green' : 'text-cyan'}`}>
                    {(sig.score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="signal-status-pill-wrap">
                  <span className={`status-pill ${sig.status.toLowerCase()}`}>
                    {isAlert && <AlertTriangle size={11} className="mr-1 inline" />}
                    {isConfirmed && <CheckCircle size={11} className="mr-1 inline" />}
                    {isNormal && <Activity size={11} className="mr-1 inline" />}
                    <span>{sig.status}</span>
                  </span>
                  <span className="signal-latency">{sig.latency}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
