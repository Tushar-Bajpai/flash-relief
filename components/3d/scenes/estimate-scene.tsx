'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { TopoSurface } from '../topo-surface'
import { ContourLines } from '../contour-lines'
import { WaterLevel } from '../water-level'
import { MerkleBeacon } from '../merkle-beacon'
import { BASE_Y } from '../terrain-utils'

export function EstimateScene() {
  const scanRingRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (scanRingRef.current) {
      const p = (Math.sin(timeRef.current * 1.2) + 1) / 2 // 0 -> 1
      scanRingRef.current.position.y = BASE_Y + 0.4 + p * 1.1
      const mat = scanRingRef.current.material as THREE.MeshBasicMaterial
      if (mat) {
        mat.opacity = 0.4 + Math.sin(timeRef.current * 2) * 0.25
      }
    }
  })

  return (
    <group scale={0.65} position={[0, -0.15, 0]}>
      {/* Mountain topography */}
      <TopoSurface />

      {/* Amber / gold elevation depth scanning contour lines */}
      <ContourLines color="#f4c969" accentColor="#ff785f" opacity={0.88} />

      {/* Simulated flood extent water layer */}
      <WaterLevel
        color="#3a2a0a"
        emissive="#f4c969"
        emissiveIntensity={0.5}
        opacity={0.48}
        speed={0.8}
        amplitude={0.09}
        baseOffset={0.7}
        radius={2.55}
      />

      {/* Dynamic hydrodynamic scanning plane elevation ring */}
      <mesh ref={scanRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y + 0.5, 0]}>
        <ringGeometry args={[0.3, 2.45, 64]} />
        <meshBasicMaterial
          color="#f4c969"
          transparent
          opacity={0.5}
          wireframe
          depthWrite={false}
        />
      </mesh>

      {/* Summit datum crystal */}
      <MerkleBeacon />

      {/* Atmospheric amber / cyan lighting */}
      <ambientLight intensity={0.55} color="#1c1606" />
      <pointLight color="#f4c969" intensity={6} distance={10} position={[0, 5, 0]} />
      <pointLight color="#ff785f" intensity={3.5} distance={8} position={[2.5, 2, -2]} />
      <pointLight color="#00e5ff" intensity={3} distance={8} position={[-2.5, 2, 2]} />
    </group>
  )
}
