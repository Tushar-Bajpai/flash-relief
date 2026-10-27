'use client'

import type { ReactNode } from 'react'

export type ConsoleTone = 'blue' | 'yellow' | 'green' | 'coral'

export interface ConsoleStat {
  label: string
  value: ReactNode
  tone?: ConsoleTone
}

/**
 * Compact page header for the operations console — replaces the oversized
 * hero banners. One line of context, the title, a short plain-language
 * description, and up to three small status chips on the right.
 */
export function ConsoleBar({
  stage,
  name,
  title,
  description,
  accent = 'blue',
  stats = [],
  children,
}: {
  stage: string
  name: string
  title: ReactNode
  description?: string
  accent?: ConsoleTone
  stats?: ConsoleStat[]
  children?: ReactNode
}) {
  return (
    <section className={`console-bar accent-${accent}`}>
      <div className="console-bar-main">
        <p className="console-eyebrow">
          Stage {stage} · {name}
        </p>
        <h1 className="console-title">{title}</h1>
        {description && <p className="console-description">{description}</p>}
        {children && <div className="console-actions">{children}</div>}
      </div>

      {stats.length > 0 && (
        <div className="console-chips">
          {stats.map((stat) => (
            <div key={stat.label} className="console-chip">
              <span className="console-chip-label">{stat.label}</span>
              <span className={`console-chip-value ${stat.tone ? `text-${stat.tone === 'blue' ? 'cyan' : stat.tone}` : ''}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/**
 * Slim footer navigation between stages — replaces the large handoff banners.
 */
export function ConsoleNextBar({
  backHref,
  backLabel,
  nextHref,
  nextLabel,
  children,
}: {
  backHref?: string
  backLabel?: string
  nextHref?: string
  nextLabel?: string
  children?: ReactNode
}) {
  return (
    <section className="console-next-bar">
      <div className="console-next-left">
        {backHref && (
          <a href={backHref} className="console-next-back">
            ← {backLabel}
          </a>
        )}
        {nextHref && nextLabel && (
          <span className="console-next-upnote">Next: {nextLabel}</span>
        )}
      </div>
      <div className="console-next-right">
        {children}
        {nextHref && nextLabel && (
          <a href={nextHref} className="console-next-forward">
            {nextLabel} →
          </a>
        )}
      </div>
    </section>
  )
}
