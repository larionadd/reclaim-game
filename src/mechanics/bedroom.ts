import type { Worker } from '../store/game'
import { hasUnfittedLimb } from './mobility'

export type BedroomAction = 'gentleIntimacy' | 'passionateIntimacy' | 'privateNight' | 'oralSex' | 'analSex' | 'reprimand' | 'extraDuty'

export const canCallBedroom = (worker: Worker) => worker.alive && worker.active && !hasUnfittedLimb(worker)
export const canChooseIntimacy = (worker: Worker, age: number) => worker.alive && !worker.punishedInCage && !worker.punishedKneeling && age >= 18 && worker.love >= 80 && worker.friendship >= 60 && worker.fear < 20
export const canChooseOfficeIntimacy = (worker: Worker, age: number) => canChooseIntimacy(worker, age)
export const canPunishInBedroom = (worker: Worker) => worker.alive && worker.active && worker.fear > 70
