export const SIGMA  = 1.35
export const MAX_H  = 2.7
export const MAX_R  = 3.8
export const BASE_Y = -1.35

/**
 * Computes Gaussian elevation profile that smoothly approaches 0 at MAX_R,
 * preventing any vertical steps or outer boundaries.
 */
export function terrainH(r: number): number {
  if (r >= MAX_R) return 0
  const raw = MAX_H * Math.exp(-(r * r) / (2 * SIGMA * SIGMA))
  const cutoff = MAX_H * Math.exp(-(MAX_R * MAX_R) / (2 * SIGMA * SIGMA))
  return Math.max(0, (raw - cutoff) / (1 - cutoff / MAX_H))
}

/**
 * Inverse radius function for placing contour rings at height h.
 */
export function radiusAt(h: number): number {
  if (h >= MAX_H) return 0
  if (h <= 0) return MAX_R
  const normalizedH = Math.max(1e-6, h / MAX_H)
  const cutoff = Math.exp(-(MAX_R * MAX_R) / (2 * SIGMA * SIGMA))
  const effectiveRatio = normalizedH * (1 - cutoff) + cutoff
  return Math.min(MAX_R, SIGMA * Math.sqrt(-2 * Math.log(Math.max(effectiveRatio, 1e-6))))
}
