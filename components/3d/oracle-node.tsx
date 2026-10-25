'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { type SignalPin } from '@/lib/data'
import { terrainH, BASE_Y } from './terrain-utils'

interface OracleNodeProps {
  node: SignalPin
  delay?: number
}

export function OracleNode({ node, delay = 0 }: OracleNodeProps) {
  const rr = Math.sqrt(node.x * node.x + node.z * node.z)
  const gndY = terrainH(rr) + BASE_Y
  const stemH = 0.52
  const headY = gndY + stemH

  const headRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(delay)

  useFrame((_, delta) => {
    timeRef.current += delta
    const t = timeRef.current
    if (headRef.current) {
      headRef.current.position.y = headY + Math.sin(t * 2) * 0.04
    }
    if (ringRef.current) {
      const p = (Math.sin(t * 2.2) + 1) / 2
      ringRef.current.scale.set(1 + p * 0.9, 1 + p * 0.9, 1)
      ;(ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.65 - p * 0.45
    }
  })

  return (
    <group>
      {/* Ground pulse ring */}
      <mesh ref={ringRef} position={[node.x, gndY + 0.015, node.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.28, 36]} />
        <meshBasicMaterial color={node.color} transparent opacity={0.6} depthWrite={false} />
      </mesh>
      {/* Node stem */}
      <mesh position={[node.x, gndY + stemH / 2, node.z]}>
        <cylinderGeometry args={[0.015, 0.015, stemH, 8]} />
        <meshStandardMaterial color="#355e6d" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Glowing signal beacon head */}
      <mesh ref={headRef} position={[node.x, headY, node.z]}>
        <sphereGeometry args={[0.13, 20, 20]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={1.2}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}
