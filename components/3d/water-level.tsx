'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BASE_Y } from './terrain-utils'

export interface WaterLevelProps {
  color?: string
  emissive?: string
  emissiveIntensity?: number
  opacity?: number
  speed?: number
  amplitude?: number
  baseOffset?: number
  radius?: number
}

export function WaterLevel({
  color = '#063246',
  emissive = '#00e5ff',
  emissiveIntensity = 0.25,
  opacity = 0.35,
  speed = 0.5,
  amplitude = 0.08,
  baseOffset = 0.68,
  radius = 2.6,
}: WaterLevelProps) {
  const ref = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (ref.current) {
      ref.current.position.y = BASE_Y + baseOffset + Math.sin(timeRef.current * speed) * amplitude
    }
  })

  return (
    <group>
      <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, BASE_Y + baseOffset, 0]}>
        <circleGeometry args={[radius, 96]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          roughness={0.1}
          metalness={0.85}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
