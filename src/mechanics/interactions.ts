import type { Worker } from '../store/game'

export const interactionGroups = {
  reward: ['bonus', 'dayOff', 'extraFood'],
  punish: ['fine', 'hit', 'dismiss', 'standOrder', 'forceDance', 'forceApology', 'punishCage', 'punishKneel', 'endKneeling'],
  talk: ['joke', 'adultJoke', 'flirt', 'romanceTalk', 'walk', 'hug', 'kiss']
} as const

export type InteractionAction = typeof interactionGroups[keyof typeof interactionGroups][number]

export const actionMarkers: Record<InteractionAction, string> = {
  bonus: '😇', dayOff: '😇', extraFood: '😇', fine: '😈', hit: '😈', dismiss: '😈',
  standOrder: '😈', forceDance: '😈', forceApology: '😈', punishCage: '😈', punishKneel: '😈', endKneeling: '😇',
  joke: '😇😈', adultJoke: '😇😈', flirt: '😇😈', romanceTalk: '😇', walk: '😇', hug: '😇', kiss: '😇'
}
export const eventMarker = (action: string) => ['moveToHut', 'askConsent', 'sex', 'gentleIntimacy', 'passionateIntimacy', 'privateNight', 'oralSex', 'analSex', 'vaginalSex', 'officeAskConsent', 'officeTender', 'officePassionate', 'officeQuiet', 'praiseWork', 'giveDayOff'].includes(action) ? '😇' : ['moveToCage', 'reprimand', 'extraDuty', 'sexPressure', 'punishWork', 'threatenWork'].includes(action) ? '😈' : actionMarkers[action as InteractionAction] ?? ''

export function interactionRequirement(w: Worker, action: InteractionAction, money: number, bread: number): string | null {
  switch (action) {
    case 'bonus': return w.contract !== 'paid' ? 'needsPaidContract' : money < 5 ? 'needsFiveHryvnias' : null
    case 'dayOff': return null
    case 'extraFood': return w.contract !== 'foodOnly' ? 'needsFoodContract' : bread < 1 ? 'needsBread' : null
    case 'fine': return w.contract !== 'paid' ? 'needsPaidContract' : w.savings < 1 ? 'needsSavings' : null
    case 'hit': case 'dismiss': case 'joke': return null
    case 'standOrder': return null
    case 'forceDance': return w.submission < 15 ? 'needsSubmission15' : null
    case 'forceApology': return w.submission < 30 ? 'needsSubmission30' : null
    case 'punishCage': return w.punishedInCage ? 'alreadyInCage' : null
    case 'punishKneel': return w.punishedKneeling ? 'alreadyKneeling' : null
    case 'endKneeling': return w.punishedKneeling ? null : 'notKneeling'
    case 'adultJoke': return w.debauchery < 25 ? 'needsDebauchery25' : null
    case 'flirt': return w.debauchery < 35 ? 'needsDebauchery35' : null
    case 'romanceTalk': return w.love < 15 ? 'needsLove15' : null
    case 'walk': return null
    case 'hug': return w.trust < 35 ? 'needsTrust35' : null
    case 'kiss': return w.love < 55 ? 'needsLove55' : null
  }
}

export const thresholdHints: Partial<Record<InteractionAction, string>> = {}
