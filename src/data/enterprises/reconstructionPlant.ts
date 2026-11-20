import type { EnterpriseDefinition } from './types'

export const reconstructionPlant: EnterpriseDefinition = {
  id: 'reconstruction_plant',
  name: { uk: 'Відновлювальний завод', ru: 'Восстановительный завод', en: 'Reconstruction plant' },
  kind: { uk: 'Будівельні матеріали', ru: 'Строительные материалы', en: 'Building materials' },
  description: { uk: 'Лінія переробки та склад.', ru: 'Линия переработки и склад.', en: 'Processing line and warehouse.' },
  startingCapacity: 6,
  workAreas: [
    { id: 'processing', name: { uk: 'Лінія переробки', ru: 'Линия переработки', en: 'Processing line' }, baseOutput: 16, baseInjuryRisk: 0.07, baseFatalityRisk: 0.003 }
  ]
}
