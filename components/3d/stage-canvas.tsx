'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { DetectScene } from './scenes/detect-scene'
import { EstimateScene } from './scenes/estimate-scene'
import { ReleaseScene } from './scenes/release-scene'
import { ReportScene } from './scenes/report-scene'

interface StageCanvasProps {
  stageIndex: number
  label?: string
  accent?: 'blue' | 'yellow' | 'coral' | 'green'
}

export function StageCanvas({ stageIndex, label, accent = 'blue' }: StageCanvasProps) {
  const renderScene = () => {
    switch (stageIndex) {
      case 0:
        return <DetectScene />
      case 1:
        return <EstimateScene />
      case 2:
        return <ReleaseScene />
      case 3:
        return <ReportScene />
      default:
        return <DetectScene />
    }
  }

  const getHudNote = () => {
    switch (stageIndex) {
      case 0:
        return 'SURGING VALLEY WATER · LIGHT TOWER BEAM ACTIVE'
      case 1:
        return 'HYDRODYNAMIC CONTOUR SCAN · ₹7.35 CR INUNDATION EXPOSURE'
      case 2:
        return 'MULTI-SIG QUORUM ARCS · 3 OF 3 OFFICER SIGNATURES VERIFIED'
      case 3:
        return 'GEOTAGGED CITIZEN GROUND AUDIT · LINE-ITEM VERIFICATION'
      default:
        return '3D TOPOGRAPHIC TWIN'
    }
  }

  return (
    <div className={`stage-3d-wrapper ${accent}`}>
      <div className="stage-3d-glow" aria-hidden="true" />

      {/* 3D WebGL Canvas with Transparent Background & Radial Masking */}
      <div className="stage-3d-scene" role="img" aria-label={label || 'Stage 3D interactive twin'}>
        <Canvas
          dpr={[1, 1.8]}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.25,
          }}
          style={{ background: 'transparent' }}
        >
          <PerspectiveCamera makeDefault position={[0, 5.6, 8.4]} fov={36} />
          {renderScene()}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.35}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2.7}
          />
        </Canvas>

        {/* Minimal Subtle HUD Watermarks */}
        <div className="stage-hud-top">
          <span className={`hud-dot ${accent}`} />
          <span className="hud-mono">3D DIGITAL TWIN // STAGE 0{stageIndex + 1}</span>
        </div>

        <div className="stage-hud-bottom">
          <span className="hud-note-text">{getHudNote()}</span>
        </div>
      </div>
    </div>
  )
}
