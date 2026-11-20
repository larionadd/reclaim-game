import type { EnterpriseDefinition } from './types'

export const repairDepot: EnterpriseDefinition = {
  id: 'repair_depot',
  name: { uk: 'Ремонтне депо', ru: 'Ремонтное депо', en: 'Repair depot' },
  kind: { uk: 'Відновлення техніки', ru: 'Восстановление техники', en: 'Equipment repair' },
  description: { uk: 'Майстерня і склад запчастин.', ru: 'Мастерская и склад запчастей.', en: 'Workshop and parts store.' },
  startingCapacity: 4,
  workAreas: [
    { id: 'workshop', name: { uk: 'Майстерня', ru: 'Мастерская', en: 'Workshop' }, baseOutput: 10, baseInjuryRisk: 0.05, baseFatalityRisk: 0.002 }
  ],
  housing: { room: 0, bunk: 4, cell: 0, cage: 0 }
}
