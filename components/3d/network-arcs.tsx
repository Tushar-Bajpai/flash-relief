'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SIGNAL_PINS, NETWORK_CONNECTIONS } from '@/lib/data'
import { terrainH, BASE_Y } from './terrain-utils'

export function NetworkArcs() {
  const curves = useMemo(() => {
    return NETWORK_CONNECTIONS.map(([iA, iB]) => {
      const a = SIGNAL_PINS[iA]
      const b = SIGNAL_PINS[iB]
      const rA = Math.sqrt(a.x * a.x + a.z * a.z)
      const rB = Math.sqrt(b.x * b.x + b.z * b.z)
      const yA = terrainH(rA) + BASE_Y + 0.52
      const yB = terrainH(rB) + BASE_Y + 0.52

      const midX = (a.x + b.x) / 2
      const midZ = (a.z + b.z) / 2
      const midY = Math.max(yA, yB) + 0.55

      return new THREE.CatmullRomCurve3([
        new THREE.Vector3(a.x, yA, a.z),
        new THREE.Vector3(midX, midY, midZ),
        new THREE.Vector3(b.x, yB, b.z),
      ])
    })
  }, [])

  const packetRefs = useRef<(THREE.Mesh | null)[]>([])
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    const time = timeRef.current
    curves.forEach((curve, i) => {
      const mesh = packetRefs.current[i]
      if (mesh) {
        const u = ((time * 0.4) + (i * 0.22)) % 1
        const pt = curve.getPointAt(u)
        mesh.position.copy(pt)
      }
    })
  })

  return (
    <group>
      {curves.map((curve, i) => (
        <group key={i}>
          {/* Subtle network connection line */}
          <mesh>
            <tubeGeometry args={[curve, 40, 0.009, 6, false]} />
            <meshBasicMaterial color="#72d9e8" transparent opacity={0.35} />
          </mesh>
          {/* Traveling subtle light pulse */}
          <mesh ref={(el) => { packetRefs.current[i] = el }}>
            <sphereGeometry args={[0.038, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
