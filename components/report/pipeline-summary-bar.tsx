'use client'

import Link from 'next/link'
import { Radio, Sliders, UserCheck, Lock, Truck, AlertCircle, CheckCircle2 } from 'lucide-react'

const PIPELINE_STAGES = [
  { id: 'detect', label: '1. DETECT', path: '/detect', icon: Radio, status: 'DONE' },
  { id: 'estimate', label: '2. ESTIMATE', path: '/estimate', icon: Sliders, status: 'DONE' },
  { id: 'review', label: '3. REVIEW', path: '/review', icon: UserCheck, status: 'DONE' },
  { id: 'release', label: '4. RELEASE', path: '/release', icon: Lock, status: 'DONE' },
  { id: 'deliver', label: '5. DELIVER', path: '/deliver', icon: Truck, status: 'DONE' },
  { id: 'report', label: '6. REPORT & AUDIT', path: '/report', icon: AlertCircle, status: 'ACTIVE' },
]

export function PipelineSummaryBar() {
  return (
    <div className="pipeline-stepper-card">
      <div className="stepper-title-row">
        <span className="mono-subhead">CIVIC LIFECYCLE PIPELINE // END-TO-END AUDIT TRAIL</span>
        <span className="loop-closed-tag">
          <CheckCircle2 size={11} className="mr-1 inline text-green" />
          <span>FULL ACCOUNTABILITY LOOP ACTIVE</span>
        </span>
      </div>

      <div className="stepper-track">
        {PIPELINE_STAGES.map((stage, idx) => {
          const Icon = stage.icon
          const isActive = stage.status === 'ACTIVE'
          const isDone = stage.status === 'DONE'

          return (
            <Link
              key={stage.id}
              href={stage.path}
              className={`stepper-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
            >
              <div className="step-icon-disc">
                <Icon size={12} />
              </div>
              <span className="step-label">{stage.label}</span>
              {idx < PIPELINE_STAGES.length - 1 && <span className="step-arrow">→</span>}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
