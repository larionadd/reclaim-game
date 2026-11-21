import { limbSlots } from '../data/prosthetics'
import type { Worker } from '../store/game'

export function hasUnfittedLimb(worker: Worker): boolean {
  return limbSlots.some(slot => worker.operations.some(op => op.id === `replacement_${slot}` && (!op.outcome || op.outcome === 'success')) && !worker.equippedProsthetics?.[slot])
}

export function canWorkAtFarm(worker: Worker, day: number): boolean {
  return worker.alive && worker.active && !hasUnfittedLimb(worker) && (worker.injuredUntilDay ?? 0) <= day
}
