'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_H, BASE_Y } from './terrain-utils'

export function LightTower() {
  const crystalRef = useRef<THREE.Mesh>(null)
  const outerWireRef = useRef<THREE.Mesh>(null)
  const pulseRingsRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  const apexY = MAX_H + BASE_Y + 0.16
  const beamHeight = 5.2

  useFrame((_, delta) => {
    timeRef.current += delta

    // Rotate apex crystal
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 0.9
      crystalRef.current.rotation.x += delta * 0.3
    }
    if (outerWireRef.current) {
      outerWireRef.current.rotation.y -= delta * 0.6
      outerWireRef.current.rotation.z += delta * 0.4
    }

    // Ascend pulse rings up the vertical beam
    if (pulseRingsRef.current) {
      pulseRingsRef.current.children.forEach((child, i) => {
        const mesh = child as THREE.Mesh
        const offset = (i * (beamHeight / 3))
        const progress = ((timeRef.current * 1.6 + offset) % beamHeight) / beamHeight // 0 -> 1
        mesh.position.y = progress * beamHeight
        const scale = 1 + progress * 2.2
        mesh.scale.set(scale, scale, 1)
        const mat = mesh.material as THREE.MeshBasicMaterial
        if (mat) {
          mat.opacity = (1 - progress) * 0.75
        }
      })
    }
  })

  return (
    <group position={[0, apexY, 0]}>
      {/* ─── Summit Crystal Core ────────────────────────────────────────── */}
      <mesh ref={crystalRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={1.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Outer rotating crystal cage */}
      <mesh ref={outerWireRef}>
        <octahedronGeometry args={[0.34, 0]} />
        <meshBasicMaterial color="#ff785f" wireframe transparent opacity={0.6} />
      </mesh>

      {/* ─── Vertical Volumetric Light Beam Pointing Upwards ────────────── */}
      <group position={[0, beamHeight / 2 + 0.1, 0]}>
        {/* Soft wide volumetric cone beam */}
        <mesh>
          <cylinderGeometry args={[0.04, 0.48, beamHeight, 32, 1, true]} />
          <meshBasicMaterial
            color="#00e5ff"
            transparent
            opacity={0.32}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Concentrated high-intensity inner beam */}
        <mesh>
          <cylinderGeometry args={[0.015, 0.09, beamHeight, 16, 1, true]} />
          <meshBasicMaterial
            color="#eaf5f4"
            transparent
            opacity={0.75}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ─── Ascending Signal Pulse Rings ─────────────────────────────────── */}
      <group ref={pulseRingsRef} position={[0, 0.2, 0]}>
        {[0, 1, 2].map((idx) => (
          <mesh key={idx} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[0.1, 0.14, 32]} />
            <meshBasicMaterial
              color="#00e5ff"
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      {/* Base ground beacon anchor ring */}
      <mesh position={[0, -0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 32]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.7}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* High-intensity summit point light */}
      <pointLight color="#00e5ff" intensity={8} distance={8} />
    </group>
  )
}
