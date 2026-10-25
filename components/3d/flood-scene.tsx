'use client'

import { SIGNAL_PINS } from '@/lib/data'
import { TopoSurface } from './topo-surface'
import { ContourLines } from './contour-lines'
import { CryptoRings } from './crypto-rings'
import { MerkleBeacon } from './merkle-beacon'
import { WaterLevel } from './water-level'
import { NetworkArcs } from './network-arcs'
import { OracleNode } from './oracle-node'

export function FloodCryptoScene() {
  return (
    <group scale={0.65} position={[0, -0.1, 0]}>
      <TopoSurface />
      <ContourLines />
      <CryptoRings />
      <MerkleBeacon />
      <WaterLevel />
      <NetworkArcs />
      {SIGNAL_PINS.map((node, i) => (
        <OracleNode key={i} node={node} delay={node.delay ?? i * 0.4} />
      ))}

      {/* Atmospheric lighting */}
      <ambientLight intensity={0.5} color="#061c24" />
      <pointLight color="#00e5ff" intensity={5} distance={10} position={[0, 5, 0]} />
      <pointLight color="#10b981" intensity={3.5} distance={8} position={[3, 2, -2]} />
      <pointLight color="#ff785f" intensity={3} distance={7} position={[-2.5, 2, 2]} />
      <pointLight color="#00e5ff" intensity={2.5} distance={6} position={[0, -2, 0]} />
    </group>
  )
}
