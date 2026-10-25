'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BASE_Y } from './terrain-utils'

export function WaterLevel() {
  const ref = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (ref.current) {
      ref.current.position.y = BASE_Y + 0.68 + Math.sin(timeRef.current * 0.5) * 0.08
    }
  })

  return (
    <group>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y + 0.68, 0]}>
        <circleGeometry args={[2.6, 96]} />
        <meshStandardMaterial
          color="#063246"
          emissive="#00e5ff"
          emissiveIntensity={0.25}
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.9}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
