'use client'

import { TopoSurface } from '../topo-surface'
import { OracleNode } from '../oracle-node'
import { WaterLevel } from '../water-level'
import { MerkleBeacon } from '../merkle-beacon'
import { CryptoRings } from '../crypto-rings'

const CITIZEN_REPORT_NODES = [
  { x: -1.9, z: -0.4, color: '#10b981', delay: 0.0 }, // Verified Ward 4 report
  { x: 1.4, z: -1.2, color: '#10b981', delay: 0.4 },  // Corroborated relief delivery
  { x: 0.8, z: 1.6, color: '#ff785f', delay: 0.8 },   // Flagged line item #FCS-01
  { x: -0.9, z: 1.7, color: '#10b981', delay: 1.2 },  // Geotagged water tanker confirmation
  { x: 2.1, z: 0.3, color: '#72d9e8', delay: 1.6 },   // Citizen token receipt scan
]

export function ReportScene() {
  return (
    <group scale={0.65} position={[0, -0.15, 0]}>
      {/* Mountain topography */}
      <TopoSurface />

      {/* Receding flood water in lower valley */}
      <WaterLevel
        color="#08383a"
        emissive="#10b981"
        emissiveIntensity={0.3}
        opacity={0.38}
        speed={0.6}
        amplitude={0.06}
        baseOffset={0.65}
        radius={2.6}
      />

      {/* Base audit compass ring */}
      <CryptoRings />

      {/* Multiple citizen reporting nodes with expanding ground pulse waves */}
      {CITIZEN_REPORT_NODES.map((node, i) => (
        <OracleNode key={i} node={node} delay={node.delay} />
      ))}

      {/* Summit public ledger crystal */}
      <MerkleBeacon />

      {/* Public audit verification lighting */}
      <ambientLight intensity={0.55} color="#061c16" />
      <pointLight color="#10b981" intensity={6} distance={10} position={[0, 5, 0]} />
      <pointLight color="#00e5ff" intensity={4} distance={8} position={[-2, 3, 2]} />
      <pointLight color="#ff785f" intensity={3.5} distance={8} position={[2, 2, -2]} />
    </group>
  )
}
