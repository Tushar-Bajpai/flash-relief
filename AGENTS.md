<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# FlashRelief — Agent Development Guide

Welcome to the **FlashRelief** repository. FlashRelief is a flood intelligence and civic relief platform that pairs satellite confirmation with timestamped public ledgers to automate fast, auditable disaster disbursals.

This guide outlines core principles, architecture, component patterns, and guidelines for AI coding agents working on this project.

---

## 1. Project Overview & Architecture

- **Framework**: Next.js (App Router, React 19, TypeScript).
- **Styling**: Vanilla CSS tokens and custom utility classes in [`app/globals.css`](file:///Users/utsavsingh/code/flashrelief/app/globals.css) with Tailwind CSS v4 support.
- **3D Engine**: Three.js (`three`), `@react-three/fiber`, and `@react-three/drei`.
- **Icons**: `lucide-react`.

### Directory Layout
```text
flashrelief/
├── app/
│   ├── favicon.ico             # Multi-size brand favicon
│   ├── globals.css             # Structured design system tokens, layout, telemetry styles
│   ├── icon.svg                # Native SVG brand icon
│   ├── layout.tsx              # Root HTML layout, viewport & metadata
│   └── page.tsx                # Clean Server Component composing the page
├── components/
│   ├── 3d/
│   │   ├── terrain-utils.ts    # Elevation mathematics & Gaussian constants
│   │   ├── topo-surface.tsx    # Obsidian Lathe surface & wireframe overlay
│   │   ├── contour-lines.tsx   # Concentric glowing elevation rings
│   │   ├── crypto-rings.tsx    # Rotating compass rings & cardinal tick markers
│   │   ├── crypto-sprite.tsx   # Monospace canvas sprite texture generator
│   │   ├── merkle-beacon.tsx   # Summit dual-layer rotating octahedron crystal
│   │   ├── light-tower.tsx     # Summit beacon with upward volumetric light beam
│   │   ├── oracle-node.tsx     # Beacon node pins with ground pulse waves
│   │   ├── network-arcs.tsx    # 3D bezier curves with live pulse packets
│   │   ├── water-level.tsx     # Translucent oscillating flood extent disk
│   │   ├── flood-scene.tsx     # Scene group orchestrating all 3D entities
│   │   ├── stage-canvas.tsx    # Responsive 3D Canvas wrapper for workflow marquee
│   │   └── scenes/
│   │       ├── detect-scene.tsx   # Stage 1: Mountain flood surge & upward light tower
│   │       ├── estimate-scene.tsx # Stage 2: Hydrodynamic contour depth scan & water plane
│   │       ├── release-scene.tsx  # Stage 3: Multi-sig officer consensus arcs & quorum nodes
│   │       └── report-scene.tsx   # Stage 4: Ground citizen report nodes & public ledger
│   ├── hero/
│   │   ├── relief-orb.tsx      # Transparent WebGL Canvas wrapper & telemetry labels
│   │   └── hero-section.tsx    # Hero copy, action links, and visual container
│   ├── layout/
│   │   ├── navbar.tsx          # Navigation header with brand mark & links
│   │   ├── footer.tsx          # Public trust stamp & closing audit footer
│   │   └── flash-mark.tsx      # FlashRelief brand emblem
│   ├── protocol/
│   │   ├── protocol-pillars.tsx# 4 core civic architecture cards
│   │   └── workflow-deck.tsx   # 4-stage horizontal right-scroll stacking deck
│   └── scroll/
│       └── stacking-deck.tsx   # LocomotiveScroll Lenis integration & 3D deck depth scaler
├── lib/
│   ├── data.ts                 # Signal pin configs, pillars data, connection pairs
│   └── utils.ts                # Class merging utility (cn)
├── public/
│   ├── icon.svg                # High-res vector brand favicon
│   ├── apple-icon.png          # 180x180 iOS touch icon
│   ├── icon-light-32x32.png    # 32x32 light theme favicon
│   └── favicon.ico             # Multi-size browser ICO
├── design.md                   # Master visual design & design system specifications
└── AGENTS.md                   # Agent instructions and codebase guidelines
```

---

## 2. Core Development Rules

### Rule 1: Seamless 3D Integration (No Hard Box or Square Corners)
- The Three.js canvas in [`components/hero/relief-orb.tsx`](file:///Users/utsavsingh/code/flashrelief/components/hero/relief-orb.tsx) **must always blend seamlessly** into the page background.
- **Never** add opaque background colors (`<color attach="background" />` is forbidden on the main canvas).
- The Canvas must have `gl={{ alpha: true, antialias: true }}` and `style={{ background: 'transparent' }}`.
- **Frustum & Sizing**: The 3D scene group must be scaled (e.g. `scale={0.65}`) and the camera backed up (e.g. `position={[0, 5.8, 8.4]}`) such that the entire geometry, outer rings, and floating labels remain completely inside the viewport frustum with generous margins. The geometry must never hit the canvas edges during 360° rotation.
- **Masking**: Use a soft radial falloff mask (`mask-image: radial-gradient(circle at 50% 50%, #000 60%, rgba(0,0,0,0.4) 85%, transparent 98%)`) to guarantee soft edge feathering.

### Rule 2: Authentic Civic Voice (No Artificial Crypto Jargon)
- Maintain the dignified, poetic, and human-first civic product voice:
  - Do NOT clutter the UI or 3D scene with fake crypto buzzwords (e.g., "0xORACLE", "480 ETH", "GAS", "ZK-ORACLE CONSENSUS").
  - Retain the clean, authentic civic copy: "Flood intelligence for the moments that matter", "Move relief before the news", "A timestamped public ledger connects allocations, deliveries and citizen reports."
  - Keep 3D pins clean and visual (colored beacon heads, ground pulse waves, subtle cardinal coordinates).

### Rule 3: Three.js Animation Performance
- Use delta accumulation (`useFrame((_, delta) => { timeRef.current += delta })`) instead of `THREE.Clock` or deprecated APIs.
- Memoize heavy geometries (`LatheGeometry`, `CatmullRomCurve3`, `TubeGeometry`) and canvas textures with `useMemo`.
- Avoid recreating materials or textures inside render loops.

### Rule 4: Preserving Agent Rules & Integrity
- Always preserve the `<!-- BEGIN:nextjs-agent-rules -->` block in [`AGENTS.md`](file:///Users/utsavsingh/code/flashrelief/AGENTS.md).
- Keep `app/page.tsx` as a lean Server Component.

### Rule 5: Git Policy (Strict User Control & Branch Isolation)
- **Do NOT push** unless explicitly instructed by the user (`dont push untill i say so`).
- **Do NOT pull** unless explicitly instructed by the user (`dont pull unless i say so`).
- **One feature, one branch**: Maintain strict branch isolation for each feature (`one feature one branch`).


---

## 3. Brand Design Tokens

| Token | Hex / Value | Usage |
| :--- | :--- | :--- |
| **`--paper`** | `#07171d` | Obsidian void primary background |
| **`--ink`** | `#eaf5f4` | High-contrast mint-white text & marks |
| **`--blue`** | `#00e5ff` / `#72d9e8` | Cyber cyan, primary data glow, wireframe, connection lines |
| **`--coral`** | `#ff785f` | Brand signal bars, urgency highlights, primary actions |
| **`--green`** | `#10b981` | Proof verified, sensor active, ledger signal |
| **`--yellow`** | `#f4c969` | Warnings, human authorization indicator |
| **`--line`** | `rgba(234, 245, 244, 0.2)` | Hairline civic dividers |

---

## 4. Verification Workflow

Before completing tasks:
1. Verify Next.js dev server status: ensure zero syntax errors and clean compile (`✓ Compiled in ...ms`).
2. Verify HTTP response: `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/` returns `200`.
3. Check browser console logs for any Three.js deprecations or hydration mismatches.
