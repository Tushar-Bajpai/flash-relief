'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { MAX_R, BASE_Y } from './terrain-utils'
import { CryptoSprite } from './crypto-sprite'

export function CryptoRings() {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const RR = MAX_R + 0.18

  const ticks = useMemo(() =>
    Array.from({ length: 72 }, (_, i) => ({
      angle: (i / 72) * Math.PI * 2,
      major: i % 18 === 0,
      semi:  i % 9  === 0,
    }))
  , [])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.04
    if (innerRef.current) innerRef.current.rotation.y -= delta * 0.06
  })

  return (
    <group position={[0, BASE_Y + 0.01, 0]}>
      {/* Outer rotating tick ring */}
      <group ref={groupRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[RR, RR + 0.05, 128]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.55} />
        </mesh>
        {ticks.map((t, i) => {
          const rr = RR + 0.08
          return (
            <mesh
              key={i}
              position={[Math.sin(t.angle) * rr, 0.003, Math.cos(t.angle) * rr]}
              rotation={[0, -t.angle, 0]}
            >
              <boxGeometry args={[0.008, 0.004, t.major ? 0.14 : t.semi ? 0.08 : 0.045]} />
              <meshBasicMaterial color={t.major ? '#00e5ff' : t.semi ? '#72d9e8' : '#1e5566'} />
            </mesh>
          )
        })}
        {/* Subtle Cardinal Markers */}
        <CryptoSprite text="N" position={[0, 0.12, RR + 0.38]} scale={[0.3, 0.18, 0.3]} />
        <CryptoSprite text="E" position={[RR + 0.38, 0.12, 0]} scale={[0.3, 0.18, 0.3]} />
        <CryptoSprite text="S" position={[0, 0.12, -(RR + 0.38)]} scale={[0.3, 0.18, 0.3]} />
        <CryptoSprite text="W" position={[-(RR + 0.38), 0.12, 0]} scale={[0.3, 0.18, 0.3]} />
      </group>

      {/* Inner reticle */}
      <group ref={innerRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[RR - 0.2, RR - 0.15, 96]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  )
}
