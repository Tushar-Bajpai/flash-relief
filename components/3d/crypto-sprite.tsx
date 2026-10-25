'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

interface CryptoSpriteProps {
  text: string
  position: [number, number, number]
  color?: string
  scale?: [number, number, number]
}

export function CryptoSprite({
  text,
  position,
  color = '#72d9e8',
  scale = [0.42, 0.21, 0.42],
}: CryptoSpriteProps) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 160
    canvas.height = 48
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, 160, 48)

    // Dark pill backing
    ctx.fillStyle = 'rgba(5, 20, 26, 0.88)'
    ctx.beginPath()
    ctx.roundRect(4, 4, 152, 40, 8)
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = color
    ctx.stroke()

    // Text
    ctx.fillStyle = '#eaf5f4'
    ctx.font = 'bold 15px ui-monospace, Menlo, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 80, 25)

    return new THREE.CanvasTexture(canvas)
  }, [text, color])

  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  )
}
