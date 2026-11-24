import type { Job } from '../types'
import type { Worker } from '../store/game'

export type Disobedience = 'unauthorizedAbsence' | 'refuseDuty' | null

export function resolveDisobedience(worker: Worker, job: Job, roll: number): Disobedience {
  if (job === 'rest') return null
  if ((worker.guaranteedShiftsLeft ?? 0) > 0) return null
  const wageGap = worker.contract === 'paid' ? Math.max(0, worker.requestedWage - worker.wage) : 0
  const special = job === 'layEggs' || job === 'milking'
  const chance = Math.max(0, Math.min(.45, .085 + wageGap * .015 + (worker.housing === 'cage' ? .04 : 0) + (worker.health < 40 ? .05 : 0) + (special ? .08 : 0) - worker.trust * .0004 - worker.submission * .0004))
  if (roll >= chance) return null
  return roll < chance * .55 ? 'unauthorizedAbsence' : 'refuseDuty'
}
