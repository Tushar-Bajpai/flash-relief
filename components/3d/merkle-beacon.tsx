'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_H, BASE_Y } from './terrain-utils'

export function MerkleBeacon() {
  const crystalRef = useRef<THREE.Mesh>(null)
  const outerWireRef = useRef<THREE.Mesh>(null)
  const apexY = MAX_H + BASE_Y + 0.16

  useFrame((_, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.7
      crystalRef.current.rotation.x += delta * 0.25
    }
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y -= delta * 0.45
      outerWireRef.current.rotation.z += delta * 0.35
    }
  })

  return (
    <group position={[0, apexY, 0]}>
      {/* Inner crystal core */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.18, 0]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={1.2}
          roughness={0.15}
          metalness={0.9}
        />
      </mesh>
      {/* Outer rotating subtle cage */}
      <mesh ref={outerWireRef}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshBasicMaterial color="#ff785f" wireframe transparent opacity={0.5} />
      </mesh>
      {/* Ground anchor pulse */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.28, 32]} />
        <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  )
}
