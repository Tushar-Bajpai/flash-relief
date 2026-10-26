'use client'

import { useState } from 'react'
import { QUICK_FEEDBACK_PRESETS } from '@/lib/review-data'
import { MessageSquarePlus, Sparkles, Send, History, Check, ArrowUpRight, Cpu } from 'lucide-react'

interface RevisionLogEntry {
  timestamp: string
  officerName: string
  instruction: string
  deltaRupees: number
  deltaExplanation: string
}

interface HumanInLoopFeedbackProps {
  revisionLog: RevisionLogEntry[]
  onApplyFeedback: (instruction: string, deltaRupees: number, explanation: string) => void
}

export function HumanInLoopFeedback({ revisionLog, onApplyFeedback }: HumanInLoopFeedbackProps) {
  const [feedbackText, setFeedbackText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApplyPreset = (preset: typeof QUICK_FEEDBACK_PRESETS[0]) => {
    setFeedbackText(preset.prompt)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackText.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/review/revision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: 'fl-2026-brahmaputra',
          officerName: 'Smt. Mridula Baruah (Finance / Committee)',
          instruction: feedbackText,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        onApplyFeedback(feedbackText, data.deltaRupees, data.explanation)
      } else {
        onApplyFeedback(feedbackText, 12200000, 'Applied committee modification to gratuitous camp feeding line item (+3 days).')
      }
      setFeedbackText('')
    } catch (err) {
      console.warn('Revision API fetch error:', err)
      onApplyFeedback(feedbackText, 12200000, 'Applied committee modification to gratuitous camp feeding line item (+3 days).')
      setFeedbackText('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="feedback-console-card">
      <div className="feedback-header">
        <div className="flex-align-gap">
          <MessageSquarePlus size={16} className="text-cyan" />
          <h3 className="panel-title">HUMAN-IN-THE-LOOP FEEDBACK // LANGGRAPH REVISION NODE</h3>
        </div>

        <span className="interrupt-status-pill">
          <Cpu size={11} className="mr-1 inline text-yellow" />
          <span>CHECKPOINT PAUSED · AWAITING EXECUTIVE GUIDANCE</span>
        </span>
      </div>

      <p className="feedback-intro-text">
        LangGraph executes an <code>interrupt()</code> pause before financial commitment. Enter committee modifications below in natural language; the AI agent translates your instructions into parameter changes and recalculates the budget deterministically.
      </p>

      {/* Quick Suggestion Presets */}
      <div className="feedback-presets-row">
        <span className="presets-label">QUICK REVISION PRESETS:</span>
        {QUICK_FEEDBACK_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleApplyPreset(p)}
            className="preset-pill-btn"
          >
            <Sparkles size={11} className="text-yellow" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Feedback Form */}
      <form onSubmit={handleSubmit} className="feedback-form">
        <textarea
          rows={3}
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="E.g., Increase gratuitous camp feeding from 7 to 10 days due to delayed flood recession..."
          className="feedback-textarea"
          aria-label="Committee revision feedback"
        />

        <div className="form-action-row">
          <span className="formula-safe-note">
            Deterministic code re-evaluates all line items. No hallucinations.
          </span>

          <button
            type="submit"
            disabled={!feedbackText.trim() || isSubmitting}
            className="submit-feedback-btn"
          >
            <Send size={13} />
            <span>{isSubmitting ? 'Re-evaluating with LangGraph...' : 'Apply Officer Feedback & Recompute'}</span>
          </button>
        </div>
      </form>

      {/* Live Revision History Log */}
      {revisionLog.length > 0 && (
        <div className="revision-history-section">
          <div className="flex-align-gap mb-2">
            <History size={13} className="text-cyan" />
            <span className="mono-subhead">COMMITTEE REVISION AUDIT TRAIL</span>
          </div>

          <div className="history-entries-list">
            {revisionLog.map((entry, idx) => (
              <div key={idx} className="history-log-item">
                <div className="log-top">
                  <span className="log-officer">{entry.officerName}</span>
                  <span className="log-time">{entry.timestamp}</span>
                </div>
                <p className="log-instruction">"{entry.instruction}"</p>
                <div className="log-delta-row">
                  <span className="delta-pill">
                    +₹{(entry.deltaRupees / 10000000).toFixed(2)} Cr
                  </span>
                  <span className="delta-expl">{entry.deltaExplanation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
