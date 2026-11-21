import type { Job, Lang } from '../types'
import type { Worker } from '../store/game'
import { canWorkAtFarm } from './mobility'

export const workplaceActions = ['inspectWork', 'praiseWork', 'punishWork', 'threatenWork', 'giveDayOff'] as const
export type WorkplaceAction = typeof workplaceActions[number]

export const workplaceImages: Record<WorkplaceAction, string> = {
  inspectWork: '/art/workplace-actions/inspect.webp',
  praiseWork: '/art/workplace-actions/praise.webp',
  punishWork: '/art/workplace-actions/punish.webp',
  threatenWork: '/art/workplace-actions/threaten.webp',
  giveDayOff: '/art/workplace-actions/day-off.webp',
}

export const workplaceLocation: Record<Exclude<Job, 'rest'>, { name: Record<Lang, string>; image: string }> = {
  production: { name: { uk: 'Корівник', ru: 'Коровник', en: 'Cattle barn' }, image: '/art/workplace-locations/production.webp' },
  maintenance: { name: { uk: 'Кормовий склад', ru: 'Кормовой склад', en: 'Feed store' }, image: '/art/workplace-locations/maintenance.webp' },
  layEggs: { name: { uk: 'Курник', ru: 'Курятник', en: 'Henhouse' }, image: '/art/workplace-locations/layEggs.webp' },
  milking: { name: { uk: 'Молочна дільниця', ru: 'Молочный цех', en: 'Dairy station' }, image: '/art/workplace-locations/milking.webp' },
}

export function canVisitWorkplace(worker: Worker | undefined, job: Job | undefined, day: number, phase: string, isVetDoctor: boolean): boolean {
  return !!worker && !!job && job !== 'rest' && !isVetDoctor && (phase === 'morning' || phase === 'day') && canWorkAtFarm(worker, day)
}
