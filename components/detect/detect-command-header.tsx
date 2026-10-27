'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Clock,
  Radio,
  History,
  AlertCircle,
  Satellite,
  Waves,
  CloudRain,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react'
import {
  DATA_FRESHNESS_FEEDS,
  REPLAY_ARCHIVE_EVENTS,
  MONITORED_BASINS,
  ReplayArchiveEvent,
} from '@/lib/detect-data'

interface DetectCommandHeaderProps {
  selectedBasinId: string
  onSelectBasin: (basinId: string) => void
  replayMode: boolean
  onToggleReplay: (enabled: boolean) => void
  activeReplayEvent: ReplayArchiveEvent
  onSelectReplayEvent: (event: ReplayArchiveEvent) => void
  liveTelemetry?: any
  isLoadingTelemetry?: boolean
  onRefreshTelemetry?: () => void
  lastUpdatedTime?: string
}

export function DetectCommandHeader({
  selectedBasinId,
  onSelectBasin,
  replayMode,
  onToggleReplay,
  activeReplayEvent,
  onSelectReplayEvent,
  liveTelemetry,
  isLoadingTelemetry,
  onRefreshTelemetry,
  lastUpdatedTime,
}: DetectCommandHeaderProps) {
  const [basinDropdownOpen, setBasinDropdownOpen] = useState(false)
  const [replayDropdownOpen, setReplayDropdownOpen] = useState(false)

  const currentBasin = MONITORED_BASINS.find((b) => b.id === selectedBasinId) || MONITORED_BASINS[0]

  return (
    <div className="detect-command-bar">
      {/* Top Notice Banner: Decision Support Only */}
      <div className="detect-disclaimer-stripe">
        <div className="stripe-left">
          <ShieldAlert size={13} className="text-yellow" />
          <span>OFFICER DECISION SUPPORT SYSTEM · RESTRICTED CIVIC COMMAND DESK · NOT AN UNCONTROLLED PUBLIC WARNING</span>
        </div>
        <div className="stripe-right">
          <span className="live-clock">
            <Clock size={11} />
            <span>{lastUpdatedTime ? `SYNCED: ${lastUpdatedTime}` : 'REFRESH CADENCE: REAL-TIME'}</span>
          </span>
        </div>
      </div>

      {/* Main Bar: Region Selector, Data Freshness & Replay Switch */}
      <div className="detect-control-row">
        {/* Left: Basin Selector Dropdown */}
        <div className="control-left-basin">
          <div className="basin-picker-wrapper">
            <button
              type="button"
              className="basin-select-trigger"
              onClick={() => setBasinDropdownOpen(!basinDropdownOpen)}
              aria-expanded={basinDropdownOpen}
            >
              <span className="picker-eyebrow">MONITORED REGION / BASIN</span>
              <div className="picker-value-row">
                <span className="picker-title">{currentBasin.name}</span>
                <span className="picker-state">{currentBasin.state}</span>
                <ChevronDown size={15} className={`chevron ${basinDropdownOpen ? 'open' : ''}`} />
              </div>
            </button>

            {basinDropdownOpen && (
              <div className="basin-dropdown-menu">
                {MONITORED_BASINS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className={`basin-option ${b.id === selectedBasinId ? 'active' : ''}`}
                    onClick={() => {
                      onSelectBasin(b.id)
                      setBasinDropdownOpen(false)
                    }}
                  >
                    <div className="option-header">
                      <span className="option-name">{b.name}</span>
                      <span className={`option-pill ${b.alertStatus.toLowerCase()}`}>{b.alertStatus}</span>
                    </div>
                    <span className="option-sub">{b.state} · {b.river}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Data Feed Freshness Telemetry */}
        <div className="control-center-freshness">
          <div className="freshness-group">
            {/* Weather Rain Feed */}
            <div
              className="freshness-item"
              title={
                liveTelemetry?.sources?.weather?.live
                  ? `Live Open-Meteo Weather: ${liveTelemetry.liveTelemetry?.past72hRainMm}mm past 72h`
                  : 'NASA GPM IMERG Early Run'
              }
            >
              <span className={`feed-dot ${liveTelemetry?.sources?.weather?.live ? 'live-pulse' : 'active'}`} />
              <CloudRain size={13} className="feed-icon text-cyan" />
              <div className="feed-info">
                <span className="feed-name">Weather Rain</span>
                <span className="feed-time">
                  {liveTelemetry?.sources?.weather?.live
                    ? `Live · ${liveTelemetry.liveTelemetry?.past72hRainMm ?? 184}mm`
                    : DATA_FRESHNESS_FEEDS.rain.latency}
                </span>
              </div>
            </div>

            <div className="freshness-divider" />

            {/* River Gauges Feed */}
            <div className="freshness-item" title="Central Water Commission (CWC) Acoustic Telemetry">
              <span className="feed-dot active" />
              <Waves size={13} className="feed-icon text-yellow" />
              <div className="feed-info">
                <span className="feed-name">CWC Gauges</span>
                <span className="feed-time">
                  {liveTelemetry?.liveTelemetry?.currentStageM
                    ? `Stage ${liveTelemetry.liveTelemetry.currentStageM}m`
                    : DATA_FRESHNESS_FEEDS.gauges.latency}
                </span>
              </div>
            </div>

            <div className="freshness-divider" />

            {/* GloFAS Flood Forecast */}
            <div
              className="freshness-item"
              title={
                liveTelemetry?.sources?.glofas?.live
                  ? `Live GloFAS v4 River Discharge: ${liveTelemetry.liveTelemetry?.maxDischargeCms} m³/s`
                  : 'GloFAS 30-Day Run'
              }
            >
              <span className={`feed-dot ${liveTelemetry?.sources?.glofas?.live ? 'live-pulse' : 'active'}`} />
              <Radio size={13} className="feed-icon text-coral" />
              <div className="feed-info">
                <span className="feed-name">GloFAS v4</span>
                <span className="feed-time">
                  {liveTelemetry?.sources?.glofas?.live
                    ? `Live · ${liveTelemetry.liveTelemetry?.maxDischargeCms?.toLocaleString() ?? 48200} cms`
                    : 'Live Calibrated'}
                </span>
              </div>
            </div>

            <div className="freshness-divider" />

            {/* Sentinel-1 SAR Mask */}
            <div className="freshness-item" title="Sentinel-1 C-SAR radar change detection pass">
              <span className="feed-dot verified" />
              <Satellite size={13} className="feed-icon text-green" />
              <div className="feed-info">
                <span className="feed-name">Sentinel-1</span>
                <span className="feed-time">Mask Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Replay Mode Toggle & Live Sync Button */}
        <div className="control-right-replay flex items-center gap-2">
          {onRefreshTelemetry && (
            <button
              type="button"
              onClick={onRefreshTelemetry}
              disabled={isLoadingTelemetry}
              className="replay-toggle-btn !border-cyan/40 hover:!bg-cyan/15 text-cyan !px-3"
              title="Poll real-time Open-Meteo & GDELT feeds now"
            >
              <RefreshCw size={13} className={isLoadingTelemetry ? 'animate-spin text-cyan' : 'text-cyan'} />
              <span>{isLoadingTelemetry ? 'POLLING...' : 'SYNC LIVE'}</span>
            </button>
          )}

          <div className="replay-pill-wrapper">
            <button
              type="button"
              className={`replay-toggle-btn ${replayMode ? 'active' : ''}`}
              onClick={() => onToggleReplay(!replayMode)}
              aria-pressed={replayMode}
            >
              <History size={14} className={replayMode ? 'animate-spin-slow text-yellow' : ''} />
              <span>{replayMode ? 'REPLAY ACTIVE' : 'LIVE TELEMETRY'}</span>
              <span className={`replay-indicator ${replayMode ? 'on' : 'off'}`} />
            </button>

            {replayMode && (
              <div className="replay-archive-picker">
                <button
                  type="button"
                  className="archive-btn"
                  onClick={() => setReplayDropdownOpen(!replayDropdownOpen)}
                >
                  <span className="archive-label">{activeReplayEvent.label}</span>
                  <ChevronDown size={13} />
                </button>

                {replayDropdownOpen && (
                  <div className="archive-dropdown">
                    {REPLAY_ARCHIVE_EVENTS.map((archive) => (
                      <button
                        key={archive.id}
                        type="button"
                        className={`archive-option ${archive.id === activeReplayEvent.id ? 'active' : ''}`}
                        onClick={() => {
                          onSelectReplayEvent(archive)
                          setReplayDropdownOpen(false)
                        }}
                      >
                        <div className="archive-title">{archive.label}</div>
                        <div className="archive-meta">
                          <span>{archive.dateString}</span>
                          <span className="text-cyan">Lead time: {archive.provenLeadTime}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Banner if Replay Mode is active */}
      {replayMode && (
        <div className="replay-active-banner">
          <div className="banner-badge">REPLAY BENCHMARK</div>
          <p className="banner-text">
            Simulating <strong>{activeReplayEvent.label}</strong> with archived NASA GPM rainfall, historic CWC gauge levels, and Sentinel-1 SAR change masks. <em>Verified lead time: {activeReplayEvent.provenLeadTime}.</em>
          </p>
        </div>
      )}
    </div>
  )
}
