# FlashRelief — Design System & Visual Specification

> *"Move relief before the news."*  
> **FlashRelief** turns early flood signals into accountable action — helping communities detect risk, plan relief and see where every decision lands.

---

## 1. Visual Philosophy & Voice

FlashRelief exists at the intersection of **civic public trust** and **quiet technological precision**.
- **Human-First Civic Dignity**: Clean, poetic, and purposeful prose. No tacky crypto-bro slang or artificial hype. The system is designed for civil officers, relief workers, and citizens.
- **Atmospheric Depth**: A deep obsidian space (`#07171d`) where real sensor telemetry, rainfall feeds, and topographic contours float naturally without rigid boundaries.
- **Seamless WebGL Merging**: The 3D visualization is not an isolated canvas or widget — it is a borderless, organic holographic projection that dissolves directly into the page atmosphere.
- **Verifiable Transparency**: A timestamped public ledger connects allocations, deliveries, and citizen reports without distracting UI noise.

---

## 2. Color Palette & Tokens

| Token | Hex / HSL | Semantic Role |
| :--- | :--- | :--- |
| **`--paper`** | `#07171d` | Obsidian void; main page background and deep shadows |
| **`--surface`** | `#0b2229` | Atmospheric gradient midtone |
| **`--ink`** | `#eaf5f4` | High-contrast mint-white text, borders, and primary headings |
| **`--blue`** | `#00e5ff` / `#72d9e8` | Cyber cyan; topographic wireframes, connection arcs, sensor pulses |
| **`--coral`** | `#ff785f` | Brand signal bars, urgency highlights, primary call-to-actions |
| **`--green`** | `#10b981` | Proof verified, sensor active, public ledger signal |
| **`--yellow`** | `#f4c969` | Relief budget warning, human authorization indicator |
| **`--line`** | `rgba(234, 245, 244, 0.2)` | Structural civic gridlines and subtle dividers |

---

## 3. Typography & Text Hierarchy

### Type Styles
1. **Headings**: Modern geometric sans (`Arial, Helvetica, sans-serif`) with tight letter-spacing (`-0.075em`), accented with classical editorial italic serif (`Georgia, serif`) for emotive keywords (`<em>before</em>`, `<em>Prove everything</em>`).
2. **Body & Descriptions**: Clean, high-legibility sans with generous line-height (`1.6`) and muted opacity (`rgba(234, 245, 244, 0.72)`).
3. **Telemetry & Coordinates**: Monospace typography with uppercase tracking (`0.12em`) for coordinate marks (`N`, `E`, `S`, `W`) and live signal telemetry (`LIVE SIGNAL / 04`).

---

## 4. 3D WebGL Visualization Architecture

The centerpiece of the hero experience is an interactive 3D digital-twin terrain rendered using **Three.js** and **React Three Fiber**.

### A. Seamless Edge Integration (Anti-Box Design)
- **Zero Square Boundaries**: The WebGL `<Canvas>` is initialized with `gl={{ alpha: true }}` and `style={{ background: 'transparent' }}`.
- **Frustum Safe Margin**: The 3D scene group is scaled to `scale={0.65}` and viewed by a perspective camera at `position={[0, 5.8, 8.4]}` with `fov={36}`. The maximum radius of any 3D node or ring ($r \approx 2.9$) occupies only $\sim 70\%$ of the viewport width, ensuring no geometry ever touches or clips at the canvas edges during 360° rotation.
- **Feathered Falloff**: The container uses a soft radial gradient mask (`mask-image: radial-gradient(circle at 50% 50%, #000 60%, rgba(0,0,0,0.4) 85%, transparent 98%)`) so any subtle ambient glow dissolves imperceptibly into the page.

### B. Topographic Elevation Model
- Built using a smooth Gaussian curve revolution (`THREE.LatheGeometry`):
  $$h(r) = \max\left(0, \frac{h_{\text{raw}} - h_{\text{cutoff}}}{1 - h_{\text{cutoff}} / MAX\_H}\right)$$
  where $h_{\text{raw}} = MAX\_H \cdot \exp\left(-\frac{r^2}{2\sigma^2}\right)$.
- Smoothly tapers to elevation 0 at $r = MAX\_R$ without vertical steps, drop-offs, or bottom plate wireframes.
- Material: Obsidian standard material (`#05151c`) layered with an ethereal wireframe mesh (`#00e5ff`, opacity `0.11`).

### C. Signal Station Topology
Pins placed across topographic elevation coordinates:
- Sensor Station 1 (`#ff785f`, Coral signal)
- Sensor Station 2 (`#72d9e8`, Cyan gauge)
- Sensor Station 3 (`#f4c969`, Yellow alert zone)
- Sensor Station 4 (`#8bc7a1`, Green verified post)
- Sensor Station 5 (`#72d9e8`, Cyan station)

Each pin features a glowing beacon head, slender alloy stem, and expanding ground pulse waves.

### D. Network Arcs & Signal Flow
- Arcs are rendered as 3D `THREE.CatmullRomCurve3` splines arching between signal points.
- In `useFrame`, animated subtle light pulses traverse the curves in continuous loops, visualizing live telemetry exchange.

### E. Rotating Telemetry Rings
- Concentric rings at the base with 72 tick marks and subtle cardinal markers (`N`, `E`, `S`, `W`).
- Outer ring rotates continuously at `+0.04 rad/s`; inner reticle counter-rotates at `-0.06 rad/s`.

### F. Summit Apex Crystal
- Positioned at the apex of the mountain ($h = MAX\_H$).
- Dual-layer rotating octahedron: an inner emissive cyan crystalline core and an outer coral wireframe cage, symbolizing the central datum point.

---

## 5. UI Architecture & Components

### 1. Hero Telemetry Overlay
- Minimal corner labels:
  - Top-left: `LIVE SIGNAL / 04`
  - Bottom-right: `PREDICT · VERIFY · RESPOND`
- Civic note:
  - `01 When water moves fast, clarity must move faster.`

### 2. Civic Pillars Grid (`.pillars-grid`)
- 2x2 high-contrast responsive grid separated by 1px hairline dividers:
  - `01` **See it sooner** — Fuse rainfall, river gauges, terrain and satellite confirmation into one clear flood signal.
  - `02` **Plan with proof** — Turn predicted impact into explainable relief budgets, with ranges instead of guesses.
  - `03` **Keep humans in control** — Officers review, change and approve every release. AI proposes. People decide.
  - `04` **Make every rupee visible** — A timestamped public ledger connects allocations, deliveries and citizen reports.

---

## 6. Micro-Interactions & Animation Guidelines

1. **Camera Controls**: OrbitControls enabled with smooth auto-rotation (`0.3 rad/s`), with polar angle restricted between `π/6` and `π/2.7` so the user can never dip beneath the terrain.
2. **Ground Pulse**: Concentric sine-wave scaling and opacity fade for beacon pins.
3. **Action Links**: Pill-shaped action buttons with smooth color shifts from `--ink` to `--coral` on hover, accompanied by directional arrow glyphs.

---

## 7. Sticky Stacking Sections ("Deck of Cards" Effect)

1. **LocomotiveScroll Integration**:
   - Built on `locomotive-scroll` v5 (Lenis physics engine).
   - Dynamic client-side initialization with `lerp: 0.085`, `duration: 1.1`, and RAF tick synchronization.
2. **Physical Page Stacking Mechanics**:
   - **Section 01 (Hero & Live Telemetry Radar)**: Sticks at `top: 0` (`z-index: 10`).
   - **Section 02 (Operating Architecture / Civic Loop)**: Slides up from viewport bottom (`z-index: 20`) with rounded top edges (`36px`), deep obsidian drop-shadow, and a tactile civic index tab handle. As Section 02 covers Section 01, Section 01 dynamically scales down (`1.0 -> 0.95`), dims (`1.0 -> 0.75 brightness`), and settles into the background stack.
   - **Section 03 (Public Trust & Verification Ledger)**: High-contrast mint-white card (`z-index: 30`) that slides over Section 02, freezing at the top with tactile index handle `03 / 03`. Section 02 scales down and dims into the deck stack while Section 01 is pushed deeper (`scale: 0.91`, `brightness: 0.60`).
3. **Continuous Reversible Physics**:
   - Scrolling back up smoothly unfreezes and expands cards back to full scale (`scale: 1.0`, `brightness: 1.0`), ensuring an authentic physical deck feel in both directions.

---

## 8. Horizontal Scroll Marquee Reel (`WorkflowDeck`)

As the user scrolls down through Section 03, the section locks in place (`position: sticky; top: 0; height: 100vh`) and transforms vertical scroll input into a smooth horizontal marquee reel:

1. **Kinetic Marquee Ticker Rail**:
   - A parallax-driven ticker strip runs across the top with stage highlights:
     `01 DETECT · LANGGRAPH AGENT SWARM // DOPPLER & SAR FUSION · 02 ESTIMATE & DRAFT · HYDRODYNAMIC INUNDATION & SDRF NORMS · 03 RELEASE · MULTI-SIG OFFICER QUORUM · 04 REPORT · CITIZEN PUBLIC GRIEVANCE AUDIT`
2. **Scroll-Driven Horizontal Track**:
   - The 4 cards are positioned in a continuous horizontal marquee ribbon (`display: flex; gap: 4vw`).
   - As the user scrolls vertically down, the track smoothly glides horizontally (`translate3d(-Xpx, 0, 0)`), bringing each stage card into view from the right.
3. **Proximity-Based Focal Zoom**:
   - The card closest to the center of the viewport dynamically scales to `1.0` with full opacity and illuminated cyan/amber/coral/green border glow (`.in-focus`).
   - Cards entering or leaving the viewport gracefully ease to `scale: 0.95` and fade to `0.65 opacity`.
4. **The 4 Core Lifecycle Stages**:
   - **01 — Detect** (`AI workflow (LangGraph)`): Multi-source hydrology synthesis & 94.6% confidence level.
   - **02 — Estimate & Draft** (`AI workflow`): Flood depth extent modeling & ₹7.35 Cr draft relief budget mapped to SDRF norms.
   - **03 — Release** (`Officers sign, smart contracts record`): 3-of-3 multi-signature quorum & on-chain smart contract disbursal.
   - **04 — Report** (`Citizens`): Field grievance dashboard linking citizen complaints to exact public ledger line items.

