'use client'

import { useState } from 'react'
import { EventMilestone } from '@/lib/events-data'
import {
  Clock,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Hash,
  ExternalLink,
  Layers,
  ArrowRight,
  Cpu,
  Satellite,
  UserCheck,
  Radio,
  Truck,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'

interface EventTimelineProps {
  milestones: EventMilestone[]
}

export function EventTimeline({ milestones }: EventTimelineProps) {
  const [expandedIndices, setExpandedIndices] = useState<number[]>([0, 1, 3])

  const toggleExpand = (index: number) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    )
  }

  const getActorIcon = (actorType: EventMilestone['actorType']) => {
    switch (actorType) {
      case 'AI_SWARM':
        return <Cpu size={14} className="text-cyan" />
      case 'SATELLITE':
        return <Satellite size={14} className="text-blue" />
      case 'OFFICERS':
        return <UserCheck size={14} className="text-yellow" />
      case 'BLOCKCHAIN':
        return <Radio size={14} className="text-green" />
      case 'FIELD_TEAMS':
        return <Truck size={14} className="text-cyan" />
      case 'CITIZENS':
        return <MessageSquare size={14} className="text-coral" />
    }
  }

  const getStageLink = (stageNumber: string) => {
    switch (stageNumber) {
      case '01':
      case '01b':
        return { href: '/detect', label: 'Stage 01: Detect Radar' }
      case '02':
        return { href: '/estimate', label: 'Stage 02: Estimate SDRF' }
      case '03':
        return { href: '/review', label: 'Stage 03: Officer Review' }
      case '04':
        return { href: '/release', label: 'Stage 04: On-Chain Release' }
      case '05':
        return { href: '/deliver', label: 'Stage 05: Proof of Delivery' }
      case '06':
        return { href: '/report', label: 'Stage 06: Grievance System' }
      default:
        return { href: '/detect', label: 'Explore Stage' }
    }
  }

  return (
    <div className="event-timeline-panel">
      <div className="timeline-panel-header">
        <div className="flex-align-gap">
          <Clock size={16} className="text-cyan" />
          <h2 className="panel-title">CHRONOLOGICAL DISASTER LIFECYCLE // 00:00 TO +36H</h2>
        </div>

        <div className="timeline-status-pills">
          <span className="timeline-counter-tag">
            {milestones.length} VERIFIED STAGE MILESTONES
          </span>
        </div>
      </div>

      <div className="vertical-timeline-tree">
        {milestones.map((m, idx) => {
          const isExpanded = expandedIndices.includes(idx)
          const stageLink = getStageLink(m.stageNumber)

          return (
            <div key={idx} className={`timeline-milestone-node ${m.status.toLowerCase()}`}>
              {/* Left Column: Timeline Markers */}
              <div className="milestone-time-col">
                <span className="milestone-hour-offset">{m.hourOffset}</span>
                <span className="milestone-utc-stamp">{m.timestamp.split(',')[1]?.trim() || m.timestamp}</span>
                <div className="milestone-node-disc">
                  <span className="node-center-dot" />
                </div>
              </div>

              {/* Right Column: Milestone Content Card */}
              <div className="milestone-card">
                <div className="milestone-card-header">
                  <div className="milestone-stage-tag-row">
                    <span className="milestone-stage-num">STAGE {m.stageNumber}</span>
                    <div className="milestone-actor-badge">
                      {getActorIcon(m.actorType)}
                      <span>{m.actor}</span>
                    </div>
                  </div>

                  <span className={`milestone-badge ${m.telemetrySnippet.badgeColor}`}>
                    {m.telemetrySnippet.label}: <strong>{m.telemetrySnippet.value}</strong>
                  </span>
                </div>

                <h3 className="milestone-title">{m.title}</h3>
                <p className="milestone-summary">{m.summary}</p>

                {/* Cryptographic Hash Badge */}
                {m.hashProof && (
                  <div className="milestone-hash-chip">
                    <Hash size={12} className="text-cyan flex-shrink-0" />
                    <span className="hash-label">{m.hashProof.label}:</span>
                    <span className="hash-val-mono">{m.hashProof.hash}</span>
                  </div>
                )}

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="milestone-expanded-details">
                    <span className="details-eyebrow">STAGE AUDIT VERIFICATION METRICS:</span>
                    <ul className="details-list">
                      {m.details.map((detail, dIdx) => (
                        <li key={dIdx} className="details-item">
                          <span className="bullet-dot" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Card Footer Actions */}
                <div className="milestone-footer-row">
                  <button
                    type="button"
                    onClick={() => toggleExpand(idx)}
                    className="milestone-toggle-btn"
                  >
                    <span>{isExpanded ? 'Hide Technical Details' : 'View Technical Details'}</span>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  <Link href={stageLink.href} className="milestone-jump-link">
                    <span>{stageLink.label}</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
