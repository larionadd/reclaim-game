import milestones from '../data/npcMilestones.json'
import procedures from '../data/medical/procedures.json'

export type Milestone = (typeof milestones)[number]
export type Procedure = (typeof procedures)[number]

export function eligibleMilestones(npcId: string, flags: Set<string>, acceptedChoices: Set<string>, unlocked: Set<string>): Milestone[] {
  return milestones.filter(m => m.npcId === npcId && !unlocked.has(m.id) && m.requiresAll.every(flag => flags.has(flag)) && acceptedChoices.has(m.requiresChoice))
}

export function eligibleProcedures(npcId: string, worldFlags: Set<string>, npcFlags: Set<string>, activeProcedureGoals: Set<string>, consentedProcedureIds: Set<string>, installedSlots: Set<string>, completed: Set<string>): Procedure[] {
  return procedures.filter(p =>
    !completed.has(`${npcId}:${p.id}`) &&
    !installedSlots.has(`${npcId}:${p.bodySlot}`) &&
    p.requiresAll.every(flag => worldFlags.has(flag)) &&
    p.requiresPerson.every(flag => npcFlags.has(flag)) &&
    (!p.requiresPersonalGoal || activeProcedureGoals.has(`${npcId}:${p.id}`)) &&
    (!p.requiresConsent || consentedProcedureIds.has(`${npcId}:${p.id}`))
  )
}
