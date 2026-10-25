'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import { MAX_R, BASE_Y, terrainH } from './terrain-utils'

export function TopoSurface() {
  const geo = useMemo(() => {
    const pts: THREE.Vector2[] = []
    for (let i = 0; i <= 52; i++) {
      const r = (i / 52) * MAX_R
      pts.push(new THREE.Vector2(r, terrainH(r)))
    }
    return new THREE.LatheGeometry(pts, 72)
  }, [])

  return (
    <group position={[0, BASE_Y, 0]}>
      {/* Dark cyber-obsidian solid core */}
      <mesh geometry={geo}>
        <meshStandardMaterial
          color="#05151c"
          roughness={0.75}
          metalness={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Cybernetic topological wireframe overlay */}
      <mesh geometry={geo} position={[0, 0.003, 0]}>
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={0.11}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
