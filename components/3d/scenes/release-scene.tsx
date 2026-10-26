'use client'

import { TopoSurface } from '../topo-surface'
import { CryptoRings } from '../crypto-rings'
import { NetworkArcs } from '../network-arcs'
import { OracleNode } from '../oracle-node'
import { MerkleBeacon } from '../merkle-beacon'

const OFFICER_NODES = [
  { x: -1.8, z: 0.6, color: '#ff785f', delay: 0.0 }, // District Magistrate
  { x: 1.6, z: 0.8, color: '#00e5ff', delay: 0.5 },  // Finance Secretary
  { x: 0.0, z: -1.9, color: '#f4c969', delay: 1.0 }, // Disaster Comm
]

export function ReleaseScene() {
  return (
    <group scale={0.65} position={[0, -0.15, 0]}>
      {/* Mountain topography */}
      <TopoSurface />

      {/* Rotating cryptographic consensus rings */}
      <CryptoRings />

      {/* Multi-sig communication arcs connecting officer quorum */}
      <NetworkArcs />

      {/* 3 Officer Authorization Nodes with expanding verification pulses */}
      {OFFICER_NODES.map((node, i) => (
        <OracleNode key={i} node={node} delay={node.delay} />
      ))}

      {/* Summit datum crystal */}
      <MerkleBeacon />

      {/* Cryptographic authorization lighting */}
      <ambientLight intensity={0.5} color="#061c24" />
      <pointLight color="#ff785f" intensity={6} distance={10} position={[0, 4, 2]} />
      <pointLight color="#00e5ff" intensity={5} distance={9} position={[2, 3, -2]} />
      <pointLight color="#f4c969" intensity={4} distance={8} position={[-2, 3, -1]} />
    </group>
  )
}
