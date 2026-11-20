import type { FarmStocks } from '../data/goods'
import type { Worker } from '../store/game'

export function productionForWorker(worker: Worker, teamSize: number): FarmStocks {
  const has = (trait: string) => worker.traits.includes(trait)
  return {
    meat: 1 + Number(has('ambitious')) + Number(has('strong_legs')) + Number(has('strong_arms')) - Number(worker.disabled ? 1 : 0),
    milk: 2 + Number(has('observant')) + Number(worker.operations?.some(op => op.id === 'diagnostic_neural_interface') ?? false),
    cheese: 1 + Number(has('methodical')) + Number(has('curious')),
    eggs: 4 + Number(has('inventive')) + (teamSize > 1 ? Number(has('leader')) : 0)
  }
}

export function riskForWorker(worker: Worker, teamHasProtector: boolean, teamSize: number): number {
  let risk = teamSize >= 2 ? .12 : .04
  if (worker.traits.includes('cautious')) risk *= .75
  if (worker.traits.includes('skilled_mechanic')) risk *= .8
  if (worker.operations?.some(op => op.id === 'support_brace')) risk *= .9
  if (teamHasProtector) risk *= .9
  return risk
}

export function conditionEffects(worker: Worker, fed: boolean, unpaid: boolean, job: string): { health: number; trust: number; wellbeing: number } {
  const has = (trait: string) => worker.traits.includes(trait)
  return {
    health: Number(has('resilient')) + Number(has('patient') && job === 'rest') - Number(has('ambitious') && job === 'production'),
    trust: Number(has('sociable')) + Number(has('principled') && !unpaid) + Number(has('frugal') && fed) - Number(has('stubborn') && unpaid) * 2,
    wellbeing: Number(has('compassionate')) + Number(has('protective'))
  }
}


