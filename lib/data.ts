export interface PillarItem {
  number: string
  title: string
  text: string
  accent: 'coral' | 'blue' | 'yellow' | 'green'
}

export interface SignalPin {
  x: number
  z: number
  color: string
  delay?: number
}

export const PILLARS: PillarItem[] = [
  {
    number: '01',
    title: 'See it sooner',
    text: 'Fuse rainfall, river gauges, terrain and satellite confirmation into one clear flood signal.',
    accent: 'coral',
  },
  {
    number: '02',
    title: 'Plan with proof',
    text: 'Turn predicted impact into explainable relief budgets, with ranges instead of guesses.',
    accent: 'blue',
  },
  {
    number: '03',
    title: 'Keep humans in control',
    text: 'Officers review, change and approve every release. AI proposes. People decide.',
    accent: 'yellow',
  },
  {
    number: '04',
    title: 'Make every rupee visible',
    text: 'A timestamped public ledger connects allocations, deliveries and citizen reports.',
    accent: 'green',
  },
]

export const SIGNAL_PINS: SignalPin[] = [
  { x: -2.2, z:  0.5,  color: '#ff785f', delay: 0.0 },
  { x: -1.2, z: -1.5,  color: '#72d9e8', delay: 0.6 },
  { x:  0.6, z: -2.4,  color: '#f4c969', delay: 1.1 },
  { x:  2.1, z:  0.9,  color: '#8bc7a1', delay: 1.6 },
  { x:  0.1, z:  1.7,  color: '#72d9e8', delay: 0.4 },
]

export const NETWORK_CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 0],
  [0, 2],
]

