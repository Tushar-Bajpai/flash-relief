'use client'

import { Cpu, CheckCircle, AlertTriangle, Layers, Activity, Radio } from 'lucide-react'
import { getSignalsForBasin, getBasinById, FusionSignal } from '@/lib/detect-data'

interface SignalFusionMatrixProps {
  selectedBasinId?: string
  liveTelemetry?: any
}

export function SignalFusionMatrix({
  selectedBasinId = 'brahmaputra',
  liveTelemetry,
}: SignalFusionMatrixProps) {
  const basin = getBasinById(selectedBasinId)
  const defaultSignals = getSignalsForBasin(selectedBasinId)

  // Augment signals dynamically when real-time Open-Meteo / GloFAS telemetry is active
  const signals = defaultSignals.map((sig) => {
    if (!liveTelemetry) return sig
    const m = liveTelemetry.liveTelemetry || liveTelemetry.metrics

    if (sig.id === 'sig-01' && m?.past72hRainMm !== undefined) {
      return {
        ...sig,
        reading: `${m.past72hRainMm} mm (72h obs) + ${m.forecast24hRainMm || 34} mm fcast`,
        score: Math.min(1.0, (m.past72hRainMm + (m.forecast24hRainMm || 0) * 0.5) / 200),
        status: m.past72hRainMm > 150 ? ('ALERT' as const) : ('ACTIVE' as const),
        latency: `Live (${liveTelemetry.freshness?.fetchLatencyMs || 220}ms Open-Meteo)`,
      }
    }
    if (sig.id === 'sig-02' && m?.currentStageM !== undefined) {
      return {
        ...sig,
        reading: `${m.currentStageM.toFixed(2)} m (Warning: ${m.warningStageM?.toFixed(1) || '104.9'} m)`,
        score: Math.min(1.0, Math.max(0.2, (m.currentStageM - (m.warningStageM || 104)) / 2)),
        status: m.currentStageM >= (m.dangerStageM || 105.7) ? ('CONFIRMED' as const) : ('ALERT' as const),
        latency: 'Live (CWC Acoustic)',
      }
    }
    if (sig.id === 'sig-03' && m?.soilMoistureVwc !== undefined) {
      return {
        ...sig,
        reading: `${m.soilMoistureVwc} m³/m³ (${m.soilSaturationPct || Math.round(m.soilMoistureVwc / 0.5 * 100)}% Saturation)`,
        score: Math.min(1.0, m.soilMoistureVwc / 0.50),
        status: m.soilMoistureVwc >= 0.42 ? ('ALERT' as const) : ('ACTIVE' as const),
        latency: 'Live (SMAP + Open-Meteo)',
      }
    }
    if (sig.id === 'sig-04' && m?.maxDischargeCms !== undefined) {
      return {
        ...sig,
        reading: `${m.maxDischargeCms.toLocaleString('en-IN')} m³/s GloFAS hydrodynamic runoff`,
        score: Math.min(1.0, m.maxDischargeCms / 52000),
        status: m.maxDischargeCms > 35000 ? ('ALERT' as const) : ('ACTIVE' as const),
        latency: 'Live (GloFAS v4 Ensemble)',
      }
    }
    return sig
  })

  const currentProbability = liveTelemetry?.probability ?? liveTelemetry?.fusion?.probability ?? signals.reduce((acc, sig) => acc + sig.score * sig.weight, 0)
  const currentConfidence = liveTelemetry?.confidenceScore ? Math.round(liveTelemetry.confidenceScore * 100) : Math.round(currentProbability * 100)
  const currentStatus = liveTelemetry?.alertLevel ?? basin.alertStatus

  return (
    <div className={`fusion-matrix-panel ${currentStatus.toLowerCase()}`}>
      {/* Header Bar */}
      <div className="fusion-header">
        <div className="flex-align-gap">
          <Cpu size={15} className="text-cyan" />
          <h3 className="panel-title">
            MULTI-SIGNAL FUSION ENGINE // {basin.name.toUpperCase()}
          </h3>
        </div>
        <span className={`fusion-badge ${currentStatus.toLowerCase()}`}>
          FUSION CONFIDENCE: {currentConfidence}% · {currentStatus}
        </span>
      </div>

      {/* Algorithm Logic Banner */}
      <div className="fusion-formula-strip">
        <span className="formula-code">
          P(flood) = σ(w₀ + w_R·Rainfall + w_H·Gauges + w_S·Soil + w_T·Terrain + w_C·Crowd)
        </span>
        <span className="formula-note">
          Hysteresis: WARNING fires when P ≥ 0.60 for 2 cycles · Current P = {Number(currentProbability).toFixed(2)}
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
