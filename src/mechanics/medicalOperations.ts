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

export function resolveOperationOutcome(procedure: MedicalProcedure, roll: number): OperationOutcome {
  if (roll < procedure.fatalityRisk) return 'death'
  if (roll < procedure.fatalityRisk + procedure.disabilityRisk) return 'disability'
  if (roll < procedure.fatalityRisk + procedure.disabilityRisk + procedure.complicationRisk) return 'complication'
  return 'success'
}
