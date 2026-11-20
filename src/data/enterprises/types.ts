import type { Localized } from '../../types'

export interface EnterpriseDefinition {
  id: string
  name: Localized
  kind: Localized
  description: Localized
  startingCapacity: number
  workAreas: { id: string; name: Localized; baseOutput: number; baseInjuryRisk: number; baseFatalityRisk: number }[]
  housing: { room: number; bunk: number; cell: number; cage: number }
}
