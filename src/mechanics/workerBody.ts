import type { BodyMeasurements } from '../types'

const round2 = (n: number) => Math.round(n * 100) / 100
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

// Small daily shifts reflect nutrition and housing. Height remains fixed for adult NPCs.
export function updateBodyForDay(current: BodyMeasurements, baseline: BodyMeasurements, calorieRatio: number, housing: 'cage' | 'barrack' | 'hut'): BodyMeasurements {
  const delta = clamp((calorieRatio - 1) * 0.16, -0.16, 0.24) + (housing === 'cage' ? -0.01 : housing === 'hut' ? 0.01 : 0)
  const weightKg = round2(clamp(current.weightKg + delta, baseline.weightKg * .75, baseline.weightKg * 1.35))
  const difference = weightKg - current.weightKg
  return {
    heightCm: baseline.heightCm,
    weightKg,
    chestCm: round2(clamp(current.chestCm + difference * .22, baseline.chestCm - 10, baseline.chestCm + 12)),
    waistCm: round2(clamp(current.waistCm + difference * .45, baseline.waistCm - 12, baseline.waistCm + 18)),
    hipsCm: round2(clamp(current.hipsCm + difference * .3, baseline.hipsCm - 10, baseline.hipsCm + 14))
  }
}

// Surgery may alter recorded measurements; each procedure must supply a medically defined delta.
export function applyProcedureMeasurements(body: BodyMeasurements, delta: Partial<BodyMeasurements>): BodyMeasurements {
  return {
    heightCm: body.heightCm,
    weightKg: round2(Math.max(1, body.weightKg + (delta.weightKg ?? 0))),
    chestCm: round2(Math.max(1, body.chestCm + (delta.chestCm ?? 0))),
    waistCm: round2(Math.max(1, body.waistCm + (delta.waistCm ?? 0))),
    hipsCm: round2(Math.max(1, body.hipsCm + (delta.hipsCm ?? 0)))
  }
}
