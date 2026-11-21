import type { Worker } from '../store/game'
import { hasUnfittedLimb } from './mobility'

export type BedroomAction = 'askConsent' | 'gentleIntimacy' | 'passionateIntimacy' | 'privateNight' | 'reprimand' | 'extraDuty'

export const canCallBedroom = (worker: Worker) => worker.alive && !hasUnfittedLimb(worker) && (worker.fear > 70 || worker.love > 70)
export const canAskConsent = (worker: Worker, age: number) => worker.alive && age >= 18 && worker.love > 70 && worker.friendship >= 60 && worker.fear < 20
export const canChooseIntimacy = (worker: Worker, age: number, day: number) => canAskConsent(worker, age) && worker.intimacyConsentDay === day
export const canAskOfficeConsent = (worker: Worker, age: number) => canAskConsent(worker, age)
export const canChooseOfficeIntimacy = (worker: Worker, age: number, day: number) => canAskOfficeConsent(worker, age) && worker.intimacyConsentDay === day
export const canPunishInBedroom = (worker: Worker) => worker.alive && worker.active && worker.fear > 70
