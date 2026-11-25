import type { Worker } from '../store/game'
import { hasUnfittedLimb } from './mobility'

export type BedroomAction = 'vaginalSex' | 'oralSex' | 'analSex' | 'reprimand' | 'extraDuty'

export const canCallBedroom = (worker: Worker) => worker.alive && worker.active && !hasUnfittedLimb(worker)
export const canChooseIntimacy = (worker: Worker, age: number) => worker.alive && !worker.punishedInCage && !worker.punishedKneeling && age >= 18 && ((worker.love > 80 && worker.debauchery > 50) || (worker.submission > 80 && worker.debauchery > 10))
export const canChooseOfficeIntimacy = (worker: Worker, age: number) => canChooseIntimacy(worker, age)
export const canPunishInBedroom = (worker: Worker) => worker.alive && worker.active
