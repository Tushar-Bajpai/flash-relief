'use client'

import React from 'react'

/**
 * GeographicHalfGlobe
 * Inspired by Anthropic's interactive geographic globe visualization.
 * Rendered as an expansive, wide SVG semi-globe in high-contrast orthographic graticule lines
 * and rich stippled point clouds representing the Indian subcontinent and global telemetry baseline.
 */
export function GeographicHalfGlobe() {
  return (
    <div className="half-globe-container" aria-hidden="true">
      <svg
        className="half-globe-svg"
        viewBox="0 0 1600 720"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          {/* Subtle radial glow centering on India & the Ganges/Brahmaputra basins */}
          <radialGradient id="indiaFocusGlow" cx="51%" cy="56%" r="35%">
            <stop offset="0%" stopColor="rgba(232, 112, 66, 0.55)" />
            <stop offset="50%" stopColor="rgba(232, 112, 66, 0.22)" />
            <stop offset="100%" stopColor="rgba(232, 112, 66, 0)" />
          </radialGradient>

          {/* Spherical inner ambient shading */}
          <radialGradient id="globeSphereShade" cx="50%" cy="30%" r="65%">
            <stop offset="0%" stopColor="rgba(234, 245, 244, 0.15)" />
            <stop offset="70%" stopColor="rgba(7, 23, 29, 0.05)" />
            <stop offset="100%" stopColor="rgba(7, 23, 29, 0.12)" />
          </radialGradient>
        </defs>

        {/* ─── Globe Inner Sphere Fill ────────────────────────────────────── */}
        <path
          d="M 80,720 A 720,720 0 0,1 1520,720 Z"
          fill="url(#globeSphereShade)"
        />

        {/* ─── Globe Outer Sphere Horizon Arc (Bold, clearly visible) ─────── */}
        <path
          d="M 80,720 A 720,720 0 0,1 1520,720"
          stroke="rgba(7, 23, 29, 0.52)"
          strokeWidth="2.5"
          fill="none"
        />
        <path
          d="M 94,720 A 706,706 0 0,1 1506,720"
          stroke="rgba(7, 23, 29, 0.32)"
          strokeWidth="1.5"
          strokeDasharray="5 7"
          fill="none"
        />

        {/* ─── Latitude Parallels (Orthographic Ellipses) ─────────────────── */}
        {/* Polar Circle 70° N */}
        <path
          d="M 440,160 Q 800,230 1160,160"
          stroke="rgba(7, 23, 29, 0.35)"
          strokeWidth="1.5"
          strokeDasharray="4 5"
        />
        {/* 50° N Parallel */}
        <path
          d="M 270,280 Q 800,390 1330,280"
          stroke="rgba(7, 23, 29, 0.42)"
          strokeWidth="1.8"
        />
        {/* 30° N Parallel (Himalayan / Brahmaputra Latitude - Accent Coral) */}
        <path
          d="M 160,420 Q 800,550 1440,420"
          stroke="rgba(232, 112, 66, 0.85)"
          strokeWidth="2.5"
        />
        {/* Tropic of Cancer 23.5° N */}
        <path
          d="M 120,490 Q 800,630 1480,490"
          stroke="rgba(7, 23, 29, 0.45)"
          strokeWidth="1.8"
          strokeDasharray="7 7"
        />
        {/* 10° N Parallel (Peninsular India) */}
        <path
          d="M 88,580 Q 800,725 1512,580"
          stroke="rgba(7, 23, 29, 0.4)"
          strokeWidth="1.8"
        />

        {/* ─── Longitude Meridians ───────────────────────────────────────── */}
        {/* Central Meridian 80° E (Indian Standard Longitude - High Contrast Coral) */}
        <path
          d="M 800,40 L 800,720"
          stroke="rgba(232, 112, 66, 0.9)"
          strokeWidth="2.5"
        />
        {/* Meridian 65° E (Indus Basin) */}
        <path
          d="M 800,40 C 640,190 620,530 680,720"
          stroke="rgba(7, 23, 29, 0.45)"
          strokeWidth="1.8"
        />
        {/* Meridian 95° E (Brahmaputra / Assam) */}
        <path
          d="M 800,40 C 960,190 980,530 920,720"
          stroke="rgba(232, 112, 66, 0.85)"
          strokeWidth="2"
        />
        {/* Meridian 50° E (Arabian Sea / Gulf) */}
        <path
          d="M 800,40 C 470,185 430,520 540,720"
          stroke="rgba(7, 23, 29, 0.38)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        {/* Meridian 110° E (Bay of Bengal / East Asia) */}
        <path
          d="M 800,40 C 1130,185 1170,520 1060,720"
          stroke="rgba(7, 23, 29, 0.38)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        {/* Meridian 35° E */}
        <path
          d="M 800,40 C 310,180 250,510 380,720"
          stroke="rgba(7, 23, 29, 0.32)"
          strokeWidth="1.4"
        />
        {/* Meridian 125° E */}
        <path
          d="M 800,40 C 1290,180 1350,510 1220,720"
          stroke="rgba(7, 23, 29, 0.32)"
          strokeWidth="1.4"
        />
        {/* Meridian 20° E */}
        <path
          d="M 800,40 C 170,180 110,500 220,720"
          stroke="rgba(7, 23, 29, 0.28)"
          strokeWidth="1.2"
        />
        {/* Meridian 140° E */}
        <path
          d="M 800,40 C 1430,180 1490,500 1380,720"
          stroke="rgba(7, 23, 29, 0.28)"
          strokeWidth="1.2"
        />

        {/* ─── Subcontinent Highlight & Radial Focus ─────────────────────── */}
        <circle cx="815" cy="440" r="160" fill="url(#indiaFocusGlow)" />

        {/* Indian Subcontinent Boundary Contour (Crisp, High-Contrast) ──── */}
        <path
          d="M 700,320 
             C 730,295 780,300 830,312 
             C 870,320 910,295 950,325 
             C 975,345 945,370 925,390 
             C 910,410 890,445 875,485 
             C 860,525 840,565 810,605 
             C 780,555 760,505 740,465 
             C 715,415 680,375 700,335 Z"
          fill="rgba(232, 112, 66, 0.16)"
          stroke="rgba(232, 112, 66, 0.95)"
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />

        {/* ─── Stippled Point Clouds (Anthropic Style — Clearly Visible) ─── */}
        <g fill="rgba(232, 112, 66, 0.95)">
          {/* Himalayan Ridge & Upper Catchment */}
          <circle cx="780" cy="295" r="2.5" />
          <circle cx="800" cy="298" r="3" />
          <circle cx="820" cy="294" r="2.5" />
          <circle cx="840" cy="302" r="3" />
          <circle cx="860" cy="306" r="3" />
          <circle cx="880" cy="303" r="3.5" />
          <circle cx="900" cy="310" r="3" />
          <circle cx="920" cy="318" r="3.5" />

          {/* Assam / Brahmaputra Basin Surge Epicenter (Key Pulse Cluster) */}
          <circle cx="895" cy="340" r="5" fill="var(--coral)" />
          <circle cx="910" cy="335" r="3.5" />
          <circle cx="880" cy="345" r="3.5" />
          <circle cx="915" cy="350" r="3" />
          <circle cx="900" cy="355" r="3" />
          <circle cx="930" cy="342" r="2.5" />

          {/* Gangetic Basin & Northern Floodplains */}
          <circle cx="740" cy="340" r="3" />
          <circle cx="765" cy="350" r="3.5" />
          <circle cx="790" cy="355" r="3" />
          <circle cx="815" cy="365" r="3" />
          <circle cx="840" cy="372" r="3" />
          <circle cx="730" cy="360" r="2.5" />
          <circle cx="755" cy="372" r="3" />
          <circle cx="780" cy="382" r="3" />
          <circle cx="805" cy="390" r="3.5" />

          {/* Central & Eastern Basins (Mahanadi / Godavari) */}
          <circle cx="830" cy="405" r="3" />
          <circle cx="850" cy="415" r="3" />
          <circle cx="820" cy="425" r="2.5" />
          <circle cx="795" cy="435" r="3" />
          <circle cx="770" cy="430" r="3" />
          <circle cx="810" cy="450" r="3" />

          {/* Peninsular Deccan & Western Ghats */}
          <circle cx="755" cy="460" r="3" />
          <circle cx="780" cy="470" r="3" />
          <circle cx="805" cy="480" r="3" />
          <circle cx="770" cy="495" r="2.5" />
          <circle cx="795" cy="510" r="3" />
          <circle cx="790" cy="540" r="3" />
          <circle cx="810" cy="555" r="2.5" />
          <circle cx="805" cy="585" r="2.5" />
        </g>

        {/* Surrounding Continental Context Stippling (Crisp Ink Dots) */}
        <g fill="rgba(7, 23, 29, 0.48)">
          {/* East Asia / China Catchments */}
          <circle cx="980" cy="270" r="2" />
          <circle cx="1010" cy="285" r="2" />
          <circle cx="1040" cy="260" r="2" />
          <circle cx="1070" cy="295" r="2.2" />
          <circle cx="1100" cy="275" r="2" />
          <circle cx="1130" cy="305" r="2.2" />
          <circle cx="1160" cy="290" r="2" />

          {/* Southeast Asia / Indochina */}
          <circle cx="970" cy="400" r="2" />
          <circle cx="1000" cy="430" r="2.2" />
          <circle cx="1020" cy="465" r="2" />
          <circle cx="1050" cy="490" r="2" />
          <circle cx="1040" cy="530" r="2" />
          <circle cx="1070" cy="560" r="2" />

          {/* Central & West Asia */}
          <circle cx="640" cy="305" r="2" />
          <circle cx="600" cy="325" r="2" />
          <circle cx="560" cy="345" r="2" />
          <circle cx="585" cy="380" r="2.2" />
          <circle cx="625" cy="405" r="2" />
          <circle cx="520" cy="425" r="2" />
          <circle cx="480" cy="445" r="2" />
        </g>

        {/* ─── Cartographic Telemetry Tags on Globe ───────────────────────── */}
        <g className="globe-telemetry-tags">
          {/* Brahmaputra Coordinate Marker */}
          <line
            x1="895"
            y1="340"
            x2="1050"
            y2="340"
            stroke="var(--coral)"
            strokeWidth="1.8"
            strokeDasharray="3 3"
          />
          <circle cx="895" cy="340" r="8" stroke="var(--coral)" strokeWidth="2.2" fill="none" />
          <circle cx="895" cy="340" r="3" fill="var(--coral)" />
          <text
            x="1065"
            y="345"
            fill="var(--coral)"
            fontFamily="var(--font-space-mono, monospace)"
            fontSize="12"
            fontWeight="700"
            letterSpacing="0.1em"
          >
            ACTIVE BASIN // BRAHMAPUTRA (26.89°N, 94.18°E)
          </text>

          {/* Equatorial Baseline */}
          <text
            x="680"
            y="680"
            fill="rgba(7, 23, 29, 0.65)"
            fontFamily="var(--font-space-mono, monospace)"
            fontSize="11"
            fontWeight="700"
            letterSpacing="0.14em"
          >
            INDIAN OCEAN BASIN · EQUATORIAL RADAR BOUNDARY (0° LATITUDE)
          </text>
        </g>
      </svg>
    </div>
  )
}
