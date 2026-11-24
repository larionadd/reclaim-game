import procedures from '../data/medical/procedures.json'
import { personalFor } from '../data/npcPersonal'
import type { Worker } from '../store/game'

export type MedicalProcedure = (typeof procedures)[number]
export type OperationOutcome = 'success' | 'complication' | 'disability' | 'death'

export function canReceiveProcedure(id: string, worker: Worker, procedure: MedicalProcedure, day: number): boolean {
  if (!worker.alive || !worker.active || (worker.injuredUntilDay ?? 0) > day) return false
  if (procedure.eligibility !== 'all' && !personalFor(id)?.medicalEligibility[procedure.eligibility as 'breast' | 'uterus']) return false
  if (!procedure.repeatable && worker.operations.some(op => op.id === procedure.id)) return false
  if (!procedure.repeatable && worker.operations.some(op => procedures.find(p => p.id === op.id)?.bodySlot === procedure.bodySlot)) return false
  return true
}

export const operationSuccessChance = (bimbofication: number): number => Math.max(0, 1 - Math.min(10, Math.max(0, bimbofication)) * .1)

export function resolveOperationOutcome(procedure: MedicalProcedure, roll: number, bimbofication = 0): OperationOutcome {
  const successChance = operationSuccessChance(bimbofication)
  if (roll < successChance) return 'success'
  const failureRoll = successChance < 1 ? (roll - successChance) / (1 - successChance) : 0
  const riskTotal = procedure.fatalityRisk + procedure.disabilityRisk + procedure.complicationRisk
  if (riskTotal <= 0) return 'complication'
  if (failureRoll < procedure.fatalityRisk / riskTotal) return 'death'
  if (failureRoll < (procedure.fatalityRisk + procedure.disabilityRisk) / riskTotal) return 'disability'
  return 'complication'
}
