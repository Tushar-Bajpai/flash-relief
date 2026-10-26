'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { FloodCryptoScene } from '@/components/3d/flood-scene'

export function ReliefOrb() {
  return (
    <div className="hero-visual" id="signal">
      <div className="hero-visual-glow" aria-hidden="true" />

      {/* 3D Scene with Transparent Background & Seamless Merging */}
      <div className="orb-scene" aria-label="Topographic flood intelligence map" role="img">
        <Canvas
          dpr={[1, 1.8]}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2,
          }}
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera makeDefault position={[0, 5.8, 8.4]} fov={36} />
          <FloodCryptoScene />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.3}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.7}
          />
        </Canvas>

        {/* Minimal Civic Telemetry Labels */}
        <span className="orb-label label-top">LIVE SIGNAL / 04</span>
        <span className="orb-label label-bottom">PREDICT · VERIFY · RESPOND</span>
      </div>
    </div>
  )
}
