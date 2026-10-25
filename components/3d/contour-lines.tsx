'use client'

import { useMemo } from 'react'
import { MAX_H, MAX_R, BASE_Y, radiusAt } from './terrain-utils'

export function ContourLines() {
  const lines = useMemo(() => {
    const res: { h: number; r: number }[] = []
    for (let i = 1; i <= 14; i++) {
      const h = (i / 15) * MAX_H
      const r = radiusAt(h)
      if (r > 0.05 && r < MAX_R) res.push({ h, r })
    }
    return res
  }, [])

  return (
    <>
      {lines.map((c, i) => (
        <mesh key={i} position={[0, c.h + BASE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[c.r - 0.009, c.r + 0.009, 128]} />
          <meshBasicMaterial
            color={i < 4 ? '#00e5ff' : i < 8 ? '#1992a7' : '#0f4856'}
            transparent
            opacity={i < 4 ? 0.95 : 0.72}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  )
}
