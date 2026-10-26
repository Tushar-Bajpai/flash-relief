'use client'

import { AlertTriangle, CheckCircle2, Eye, ShieldAlert, Waves, Satellite, ArrowUpRight } from 'lucide-react'
import { SubBasinAlert } from '@/lib/detect-data'

interface AlertsQueueProps {
  alerts: SubBasinAlert[]
  selectedAlertId: string
  onSelectAlert: (alertId: string) => void
}

export function AlertsQueue({
  alerts,
  selectedAlertId,
  onSelectAlert,
}: AlertsQueueProps) {
  // Sort alerts by severity: CONFIRMED (0) -> WARNING (1) -> WATCH (2) -> CLEAR (3)
  const priorityMap: Record<string, number> = {
    CONFIRMED: 0,
    WARNING: 1,
    WATCH: 2,
    CLEAR: 3,
  }

  const sortedAlerts = [...alerts].sort(
    (a, b) => priorityMap[a.level] - priorityMap[b.level] || b.probability - a.probability
  )

  const renderBadge = (level: SubBasinAlert['level']) => {
    switch (level) {
      case 'CONFIRMED':
        return (
          <span className="alert-badge confirmed">
            <span className="dot pulse" />
            <ShieldAlert size={12} />
            <span>CONFIRMED</span>
          </span>
        )
      case 'WARNING':
        return (
          <span className="alert-badge warning">
            <span className="dot" />
            <AlertTriangle size={12} />
            <span>WARNING</span>
          </span>
        )
      case 'WATCH':
        return (
          <span className="alert-badge watch">
            <span className="dot" />
            <Eye size={12} />
            <span>WATCH</span>
          </span>
        )
      case 'CLEAR':
        return (
          <span className="alert-badge clear">
            <CheckCircle2 size={12} />
            <span>CLEAR</span>
          </span>
        )
    }
  }

  return (
    <div className="alerts-queue-card">
      <div className="queue-header">
        <div className="queue-title-group">
          <span className="queue-eyebrow">ACTIVE INUNDATION SIGNALS</span>
          <h3 className="queue-title">Sub-Basin Alert Queue</h3>
        </div>
        <div className="queue-counter-tag">
          <span>{alerts.filter((a) => a.level !== 'CLEAR').length} ACTIVE ESCALATIONS</span>
        </div>
      </div>

      <div className="queue-list" role="list">
        {sortedAlerts.map((alert) => {
          const isSelected = alert.id === selectedAlertId
          const probPercent = Math.round(alert.probability * 100)

          return (
            <button
              key={alert.id}
              type="button"
              className={`queue-item ${alert.level.toLowerCase()} ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAlert(alert.id)}
              aria-selected={isSelected}
            >
              <div className="item-top-row">
                {renderBadge(alert.level)}
                <div className="item-probability">
                  <span className="prob-label">P(FLOOD)</span>
                  <span className={`prob-value ${alert.level.toLowerCase()}`}>
                    {alert.probability.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="item-body">
                <h4 className="item-block-name">{alert.blockName}</h4>
                <p className="item-district">{alert.district}</p>
              </div>

              <div className="item-metrics-grid">
                <div className="metric-box">
                  <span className="metric-lbl">EXPECTED CREST</span>
                  <span className="metric-val text-ink">{alert.expectedPeak.split(' ')[0]}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">RIVER GAUGE</span>
                  <span className="metric-val text-yellow">{alert.gaugeStageMeters.toFixed(2)}m</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">72H RAIN (GPM)</span>
                  <span className="metric-val text-cyan">{alert.rain72hMm.toFixed(0)} mm</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">SAR RADAR</span>
                  <span className={`metric-val ${alert.satelliteConfirmed ? 'text-green' : 'text-muted'}`}>
                    {alert.satelliteConfirmed ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Linear probability mini-bar */}
              <div className="item-prob-bar-track">
                <div
                  className={`item-prob-bar-fill ${alert.level.toLowerCase()}`}
                  style={{ width: `${probPercent}%` }}
                />
              </div>

              <div className="item-footer">
                <span className="item-hash-tag">
                  TX: {alert.polygonTxHash.slice(0, 10)}...{alert.polygonTxHash.slice(-6)}
                </span>
                <span className="item-view-prompt">
                  <span>Inspect Explainability</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
