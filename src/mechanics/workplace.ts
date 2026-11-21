import type { Job, Lang } from '../types'
import type { Worker } from '../store/game'
import { canWorkAtFarm } from './mobility'

export const workplaceActions = ['inspectWork', 'praiseWork', 'punishWork', 'threatenWork', 'giveDayOff'] as const
export type WorkplaceAction = typeof workplaceActions[number]

export const workplaceImages: Record<WorkplaceAction, string> = {
  inspectWork: '/art/workplace-actions/inspect-v2.webp',
  praiseWork: '/art/workplace-actions/praise-v2.webp',
  punishWork: '/art/workplace-actions/punish-v2.webp',
  threatenWork: '/art/workplace-actions/threaten-v2.webp',
  giveDayOff: '/art/workplace-actions/day-off-v2.webp',
}

export const workplaceLocation: Record<Exclude<Job, 'rest'>, { name: Record<Lang, string>; image: string }> = {
  production: { name: { uk: 'Корівник', ru: 'Коровник', en: 'Cattle barn' }, image: '/art/workplace-locations/production-v2.webp' },
  layEggs: { name: { uk: 'Курник', ru: 'Курятник', en: 'Henhouse' }, image: '/art/workplace-locations/layEggs-v2.webp' },
  milking: { name: { uk: 'Молочна дільниця', ru: 'Молочный цех', en: 'Dairy station' }, image: '/art/workplace-locations/milking-v2.webp' },
  droneAssembly: { name: { uk: 'Майстерня дронів', ru: 'Мастерская дронов', en: 'Drone workshop' }, image: '/art/workplace-locations/maintenance-v2.webp' },
  storeSales: { name: { uk: 'Магазин', ru: 'Магазин', en: 'Store' }, image: '/art/workplace-locations/maintenance-v2.webp' },
  training: { name: { uk: 'Тренувальний табір', ru: 'Тренировочный лагерь', en: 'Training camp' }, image: '/art/workplace-locations/production-v2.webp' },
}

export function canVisitWorkplace(worker: Worker | undefined, job: Job | undefined, day: number, phase: string, isVetDoctor: boolean): boolean {
  return !!worker && !!job && job !== 'rest' && !isVetDoctor && (worker.routine?.[phase as import('../types').Phase] ?? (phase === 'day' ? 'work' : 'rest')) === 'work' && canWorkAtFarm(worker, day)
}
