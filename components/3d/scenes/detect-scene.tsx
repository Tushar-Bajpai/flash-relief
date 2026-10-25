'use client'

import { TopoSurface } from '../topo-surface'
import { WaterLevel } from '../water-level'
import { LightTower } from '../light-tower'
import { CryptoRings } from '../crypto-rings'

export function DetectScene() {
  return (
    <group scale={0.65} position={[0, -0.15, 0]}>
      {/* Mountain topography */}
      <TopoSurface />

      {/* Surging flood water coming between mountain valleys */}
      <WaterLevel
        color="#08384d"
        emissive="#00e5ff"
        emissiveIntensity={0.65}
        opacity={0.55}
        speed={1.4}
        amplitude={0.15}
        baseOffset={0.72}
        radius={2.7}
      />

      {/* Light Tower at apex pointing upwards with volumetric beam */}
      <LightTower />

      {/* Rotating base telemetry ring */}
      <CryptoRings />

      {/* Atmospheric lighting */}
      <ambientLight intensity={0.6} color="#061c24" />
      <pointLight color="#00e5ff" intensity={7} distance={12} position={[0, 6, 0]} />
      <pointLight color="#00e5ff" intensity={4} distance={9} position={[2.5, 2, 2]} />
      <pointLight color="#ff785f" intensity={3} distance={8} position={[-2.5, 2, -2]} />
    </group>
  )
}
