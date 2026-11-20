import type { EnterpriseDefinition } from './types'

export const farm: EnterpriseDefinition = {
  id: 'animal_farm_07',
  name: { uk: 'Тваринницька ферма № 7', ru: 'Животноводческая ферма № 7', en: 'Animal Farm No. 7' },
  kind: { uk: 'Тваринництво', ru: 'Животноводство', en: 'Animal husbandry' },
  description: { uk: 'Корівник, вівчарня, курник, кормовий склад і ветпункт.', ru: 'Коровник, овчарня, курятник, кормовой склад и ветпункт.', en: 'Cattle barn, sheepfold, chicken coop, feed store and veterinary post.' },
  startingCapacity: 3,
  workAreas: [
    { id: 'cattle_barn', name: { uk: 'Корівник', ru: 'Коровник', en: 'Cattle barn' }, baseOutput: 8, baseInjuryRisk: 0.04, baseFatalityRisk: 0.001 },
    { id: 'feed_store', name: { uk: 'Кормовий склад', ru: 'Кормовой склад', en: 'Feed store' }, baseOutput: 3, baseInjuryRisk: 0.02, baseFatalityRisk: 0.0005 },
    { id: 'sheepfold', name: { uk: 'Вівчарня', ru: 'Овчарня', en: 'Sheepfold' }, baseOutput: 6, baseInjuryRisk: 0.025, baseFatalityRisk: 0.0005 },
    { id: 'chicken_coop', name: { uk: 'Курник', ru: 'Курятник', en: 'Chicken coop' }, baseOutput: 4, baseInjuryRisk: 0.01, baseFatalityRisk: 0.0001 }
  ],
  housing: { room: 1, bunk: 2, cell: 0, cage: 0 }
}
