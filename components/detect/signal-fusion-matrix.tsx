'use client'

import { Cpu, CheckCircle, AlertTriangle, Layers, Activity } from 'lucide-react'
import { FUSION_SIGNALS, FusionSignal } from '@/lib/detect-data'

export function SignalFusionMatrix() {
  return (
    <div className="fusion-matrix-panel">
      {/* Header Bar */}
      <div className="fusion-header">
        <div className="flex-align-gap">
          <Cpu size={15} className="text-cyan" />
          <h3 className="panel-title">MULTI-SIGNAL FUSION ENGINE // SPATIAL ALERT ALGORITHM</h3>
        </div>
        <span className="fusion-badge">FUSION CONFIDENCE: 94.6%</span>
      </div>

      {/* Algorithm Logic Banner */}
      <div className="fusion-formula-strip">
        <span className="formula-code">
          P(flood) = σ(w₀ + w_R·Rainfall + w_H·Gauges + w_S·Soil + w_T·Terrain + w_C·Crowd)
        </span>
        <span className="formula-note">Hysteresis: WARNING fires when P ≥ 0.60 for 2 cycles</span>
      </div>

      {/* 5 Input Streams Grid */}
      <div className="fusion-signals-list">
        {FUSION_SIGNALS.map((sig) => {
          const isAlert = sig.status === 'ALERT'
          const isConfirmed = sig.status === 'CONFIRMED'

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
                  <span className="metric-val text-cyan">{(sig.score * 100).toFixed(0)}%</span>
                </div>

                <div className="signal-status-pill-wrap">
                  <span className={`status-pill ${sig.status.toLowerCase()}`}>
                    {isAlert && <AlertTriangle size={11} className="mr-1 inline" />}
                    {isConfirmed && <CheckCircle size={11} className="mr-1 inline" />}
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
